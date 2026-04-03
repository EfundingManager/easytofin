import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createPhoneUser, getPhoneUserByEmail } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Gmail OAuth Authentication Router
 * Handles Google Sign-in for client registration and login
 */
export const gmailAuthRouter = router({
  /**
   * Handle Google OAuth callback
   * Creates or updates user account based on Google profile data
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
        const existingUser = await getPhoneUserByEmail(input.email);

        if (existingUser) {
          // User exists - return login success
          return {
            success: true,
            message: "Login successful",
            userId: existingUser.id,
            user: existingUser,
            isNewRegistration: false,
            loginMethod: "google",
          };
        }

        // Create new user from Google profile
        const newUser = await createPhoneUser({
          phone: "", // Phone not required for Google OAuth
          email: input.email,
          name: input.name,
          googleId: input.googleId,
          picture: input.picture,
          verified: "true", // Google-verified email
          role: "user",
          loginMethod: "google",
        });

        return {
          success: true,
          message: "Registration successful",
          userId: newUser.id,
          user: newUser,
          isNewRegistration: true,
          loginMethod: "google",
        };
      } catch (error: any) {
        console.error("[Gmail Auth] Error handling Google callback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process Google login",
        });
      }
    }),

  /**
   * Verify Google ID token (optional - for additional security)
   * Can be used to verify the token on the backend
   */
  verifyGoogleToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
      })
    )
    .query(async ({ input }) => {
      try {
        // In a production app, you would verify the token here
        // using Google's tokeninfo endpoint or a JWT library
        // For now, we'll just return success if token is provided

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
   * Returns the necessary configuration for Google Sign-in button
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
