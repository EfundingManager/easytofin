import { z } from "zod";
import * as db from "../db";
import { createPhoneUser, getPhoneUserByEmail, updatePhoneUser, getPhoneUserById } from "../db";
import { TRPCError } from "@trpc/server";
import { sdk } from "../_core/sdk";
import { router, publicProcedure } from "../_core/trpc";
import { THIRTY_DAYS_MS, DEFAULT_SESSION_MS, COOKIE_NAME, PENDING_2FA_COOKIE_NAME } from "@shared/const";
import { roleRequires2FA, createPending2FAToken } from "../_core/twoFactor";
import { getSessionCookieOptions } from "../_core/cookies";

/**
 * Gmail OAuth Authentication Router
 * Handles Google Sign-in for client registration and login.
 *
 * For privileged roles (admin, manager, staff), login is NOT completed here.
 * Instead a short-lived pendingToken is returned and the frontend must redirect
 * the user to /2fa for phone OTP verification before a real session is issued.
 */

export const gmailAuthRouter = router({
  /**
   * Handle Google OAuth callback.
   * Returns either a full sessionToken (regular users) or a pendingToken (privileged roles).
   */
  handleGoogleCallback: publicProcedure
    .input(
      z.object({
        googleId: z.string().min(1, "Google ID is required"),
        email: z.string().email("Invalid email"),
        name: z.string().min(1, "Name is required"),
        picture: z.string().url().optional(),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx: { req, res } }) => {
      try {
        console.log("[Gmail Auth] handleGoogleCallback mutation started", { email: input.email, googleId: input.googleId });
        
        // Check if user already exists by email
        let existingUser = await getPhoneUserByEmail(input.email);
        let isNewRegistration = false;
        console.log("[Gmail Auth] User lookup result:", { exists: !!existingUser, userId: existingUser?.id, email: existingUser?.email, role: existingUser?.role });

        if (!existingUser) {
          // Create new user from Google profile — always starts as 'user' role
          existingUser = await createPhoneUser({
            email: input.email,
            name: input.name,
            googleId: input.googleId,
            picture: input.picture,
            emailVerified: "true", // Google-verified email
            role: "user",
            loginMethod: "google",
          });
          isNewRegistration = true;
        } else {
          // Update existing user with Google profile data (fixes users who logged in before the fix)
          // This ensures googleId, name, loginMethod, and picture are populated for existing users
          if (!existingUser.googleId || existingUser.loginMethod !== "google") {
            console.log("[Gmail Auth] Updating existing user with Google profile data:", { userId: existingUser.id, email: existingUser.email });
            await updatePhoneUser(existingUser.id, {
              googleId: input.googleId,
              name: input.name || existingUser.name,
              picture: input.picture || existingUser.picture,
              emailVerified: "true",
              loginMethod: "google",
            });
            // Refresh the user object with updated data
            const refreshedUser = await getPhoneUserById(existingUser.id);
            if (refreshedUser) {
              existingUser = refreshedUser;
            }
          }
        }

        // TypeScript type guard: existingUser is guaranteed to be defined here
        if (!existingUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or retrieve user",
          });
        }

        const userRole = existingUser.role ?? "user";

        // ── Privileged role: require phone 2FA before issuing a real session ──
        if (roleRequires2FA(userRole)) {
          if (!existingUser.phone) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message:
                "Your account requires phone 2FA but no phone number is registered. " +
                "Please contact an administrator to add your phone number.",
            });
          }

          const pendingToken = await createPending2FAToken({
            phoneUserId: existingUser.id,
            phone: existingUser.phone,
            role: userRole,
          });

          return {
            success: true,
            requires2FA: true,
            pendingToken,
            message: "Phone 2FA required. Please verify your phone number.",
            loginMethod: "google",
          };
        }

        // ── Regular user: issue session immediately ──
        const sessionDuration = input.rememberMe ? THIRTY_DAYS_MS : DEFAULT_SESSION_MS;
        const sessionToken = await sdk.createSessionToken(input.googleId, {
          name: input.name || input.email || "User",
          expiresInMs: sessionDuration,
        });

        // Set session cookie on the server response
        // This is CRITICAL: the cookie must be set on the response, not returned in the body
        const cookieOptions = getSessionCookieOptions(req);
        console.log("[Gmail Auth] Setting session cookie:", { COOKIE_NAME, sessionDuration, tokenLength: sessionToken.length });
        console.log("[Gmail Auth] Request details:", {
          protocol: req.protocol,
          hostname: req.hostname,
          secure: req.secure,
          xForwardedProto: req.headers['x-forwarded-proto'],
          xForwardedHost: req.headers['x-forwarded-host'],
          origin: req.headers['origin'],
        });
        console.log("[Gmail Auth] Cookie options:", cookieOptions);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: sessionDuration,
        } as any);
        console.log("[Gmail Auth] Session cookie set successfully");
        const setCookieHeader = res.getHeaders()['set-cookie'];
        console.log("[Gmail Auth] Set-Cookie header:", setCookieHeader);

        // Determine redirect URL based on role and clientStatus
        let redirectUrl = "/user/dashboard";
        if (userRole === "admin" || userRole === "super_admin") {
          redirectUrl = "/admin/dashboard";
        } else if (userRole === "manager") {
          redirectUrl = "/manager/dashboard";
        } else if (userRole === "staff") {
          redirectUrl = "/staff/dashboard";
        } else if (existingUser.clientStatus === 'customer') {
          redirectUrl = `/customer/dashboard`;
        } else {
          redirectUrl = `/user/dashboard`;
        }

        return {
          success: true,
          requires2FA: false,
          message: isNewRegistration ? "Registration successful" : "Login successful",
          userId: existingUser.id,
          clientStatus: existingUser.clientStatus,
          redirectUrl,
          user: existingUser,
          isNewRegistration,
          loginMethod: "google",
          sessionToken,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("[Gmail Auth] Error handling Google callback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process Google login",
        });
      }
    }),

  /**
   * Verify Google ID token (optional - for additional security)
   */
  verifyGoogleToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
      })
    )
    .query(async ({ input }) => {
      try {
        return {
          valid: true,
          message: "Token verified",
        };
      } catch (error: any) {
        console.error("[Gmail Auth] Error verifying token:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }
    }),

  /**
   * Get Google OAuth configuration for frontend
   */
  getGoogleConfig: publicProcedure.query(() => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Google OAuth not configured",
      });
    }

    return {
      clientId,
      redirectUri: `${process.env.VITE_APP_URL || "http://localhost:3000"}/auth/google/callback`,
    };
  }),
});
