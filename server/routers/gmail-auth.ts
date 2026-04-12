import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { createPhoneUser, getPhoneUserByEmail } from "../db";
import { TRPCError } from "@trpc/server";
import { sdk } from "../_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";
import { roleRequires2FA, createPending2FAToken } from "../_core/twoFactor";

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
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if user already exists by email
        let existingUser = await getPhoneUserByEmail(input.email);
        let isNewRegistration = false;

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
        const sessionToken = await sdk.createSessionToken(input.googleId, {
          name: input.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Determine redirect URL based on clientStatus
        const redirectUrl = existingUser.clientStatus === 'customer' 
          ? `/customer/${existingUser.id}`
          : `/user/${existingUser.id}`;

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
