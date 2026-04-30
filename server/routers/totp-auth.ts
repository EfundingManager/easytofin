import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  generateTOTPSecret,
  verifyTOTPToken,
  isTOTPRequired,
  verifyAndRemoveBackupCode,
} from "../_core/totp";
import {
  saveTOTPSecret,
  getTOTPSecret,
  isTOTPEnabled,
  disableTOTP,
} from "../db-totp";
import { getPhoneUserById } from "../db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

/**
 * TOTP (Authenticator App) Router
 * Handles setup and verification of TOTP for 2FA
 */
export const totpAuthRouter = router({
  /**
   * Get TOTP setup QR code (first-time setup)
   * Called when user first logs in and needs to set up authenticator
   */
  getSetupQRCode: publicProcedure
    .input(
      z.object({
        pendingToken: z.string(), // 2FA session token from phone auth
        userEmail: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Verify the pending token and extract user info
        // This would normally verify the JWT token
        // For now, we'll just generate the QR code
        const setupResult = await generateTOTPSecret(input.userEmail);

        return {
          success: true,
          qrCode: setupResult.qrCode,
          secret: setupResult.secret, // Send to frontend for manual entry fallback
          backupCodes: setupResult.backupCodes,
        };
      } catch (error) {
        console.error("[TOTP] Setup error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate TOTP setup",
        });
      }
    }),

  /**
   * Verify TOTP token and complete setup
   * Called after user scans QR code and enters first TOTP code
   */
  verifyAndSetup: publicProcedure
    .input(
      z.object({
        pendingToken: z.string(), // 2FA session token
        totpCode: z.string().length(6, "TOTP code must be 6 digits"),
        secret: z.string(), // The secret from setup
        backupCodes: z.array(z.string()), // Backup codes to save
        phoneUserId: z.number(), // User ID to save secret for
      })
    )
    .mutation(async ({ input, ctx: opts }) => {
      try {
        // Verify the TOTP code
        const isValid = verifyTOTPToken(input.secret, input.totpCode);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid TOTP code. Please try again.",
          });
        }

        // Save the secret to the user
        await saveTOTPSecret(input.phoneUserId, input.secret, input.backupCodes);

        // Get the user to determine redirect
        const user = await getPhoneUserById(input.phoneUserId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Create session cookie
        const openId = user.googleId || user.email || user.phone || `phone-${user.id}`;
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
          name: user.name || "User",
        });

        const cookieOptions = getSessionCookieOptions(opts.req);
        opts.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        } as any);

        // Determine redirect URL based on role
        const roleRedirects: Record<string, string> = {
          admin: "/admin/dashboard",
          super_admin: "/admin/dashboard",
          manager: "/manager/dashboard",
          staff: "/staff/dashboard",
          support: "/support/dashboard",
          customer: "/customer/dashboard",
          user: "/user/dashboard",
        };

        const redirectUrl = roleRedirects[user.role] || "/user/dashboard";

        return {
          success: true,
          message: "TOTP setup complete",
          redirectUrl,
          userRole: user.role,
        };
      } catch (error: any) {
        console.error("[TOTP] Setup verification error:", error);
        throw error instanceof TRPCError
          ? error
          : new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "TOTP verification failed",
            });
      }
    }),

  /**
   * Verify TOTP code on subsequent logins
   * Called when user logs in and needs to verify with authenticator
   */
  verifyCode: publicProcedure
    .input(
      z.object({
        pendingToken: z.string(), // 2FA session token
        totpCode: z.string().length(6, "TOTP code must be 6 digits"),
        phoneUserId: z.number(),
      })
    )
    .mutation(async ({ input, ctx: opts }) => {
      try {
        // Get the user's TOTP secret
        const secret = await getTOTPSecret(input.phoneUserId);
        if (!secret) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "TOTP not set up for this user",
          });
        }

        // Verify the TOTP code
        const isValid = verifyTOTPToken(secret, input.totpCode);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid TOTP code. Please try again.",
          });
        }

        // Get the user
        const user = await getPhoneUserById(input.phoneUserId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Create session cookie
        const openId = user.googleId || user.email || user.phone || `phone-${user.id}`;
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: 365 * 24 * 60 * 60 * 1000,
          name: user.name || "User",
        });

        const cookieOptions = getSessionCookieOptions(opts.req);
        opts.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        } as any);

        // Determine redirect URL
        const roleRedirects: Record<string, string> = {
          admin: "/admin/dashboard",
          super_admin: "/admin/dashboard",
          manager: "/manager/dashboard",
          staff: "/staff/dashboard",
          support: "/support/dashboard",
          customer: "/customer/dashboard",
          user: "/user/dashboard",
        };

        const redirectUrl = roleRedirects[user.role] || "/user/dashboard";

        return {
          success: true,
          message: "TOTP verification successful",
          redirectUrl,
          userRole: user.role,
        };
      } catch (error: any) {
        console.error("[TOTP] Verification error:", error);
        throw error instanceof TRPCError
          ? error
          : new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "TOTP verification failed",
            });
      }
    }),

  /**
   * Use backup code instead of TOTP
   * Called if user loses access to authenticator
   */
  verifyBackupCode: publicProcedure
    .input(
      z.object({
        pendingToken: z.string(),
        backupCode: z.string(),
        phoneUserId: z.number(),
      })
    )
    .mutation(async ({ input, ctx: opts }) => {
      try {
        // Get the user's TOTP secret (which contains backup codes)
        const user = await getPhoneUserById(input.phoneUserId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // For now, just verify TOTP is enabled
        const totpEnabled = await isTOTPEnabled(input.phoneUserId);
        if (!totpEnabled) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "TOTP not enabled for this user",
          });
        }

        // TODO: Implement backup code verification
        // This would require storing backup codes separately
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Backup code verification not yet implemented",
        });
      } catch (error: any) {
        throw error instanceof TRPCError
          ? error
          : new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Backup code verification failed",
            });
      }
    }),

  /**
   * Check if user has TOTP enabled
   */
  isTOTPSetup: publicProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .query(async ({ input }) => {
      try {
        const enabled = await isTOTPEnabled(input.phoneUserId);
        return { enabled };
      } catch (error) {
        console.error("[TOTP] Check error:", error);
        return { enabled: false };
      }
    }),

  /**
   * Disable TOTP for a user (requires authentication)
   */
  disable: protectedProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify the user owns this phone user ID
        // This would check ctx.user against the phoneUserId
        await disableTOTP(input.phoneUserId);

        return {
          success: true,
          message: "TOTP disabled successfully",
        };
      } catch (error) {
        console.error("[TOTP] Disable error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable TOTP",
        });
      }
    }),
});
