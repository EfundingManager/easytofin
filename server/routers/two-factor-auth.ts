/**
 * Two-Factor Authentication Router
 *
 * Used by privileged roles (admin, manager, staff) to complete login after
 * passing the first authentication factor (Google or Email OTP).
 *
 * Endpoints:
 *  - requestPhoneOtp  : Send an SMS OTP to the user's registered phone
 *  - completeLogin    : Verify the SMS OTP + pendingToken → issue real session cookie
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { sdk } from "../_core/sdk";
import { verifyPending2FAToken, roleRequires2FA } from "../_core/twoFactor";
import {
  getPhoneUserById,
  createOtpCode,
  getValidOtpCode,
  deleteOtpCode,
  incrementOtpAttempts,
  updatePhoneUser,
} from "../db";
import { sendSMSVerification, verifySMSCode } from "../verification";
import { rateLimiter, RATE_LIMIT_CONFIG } from "../rate-limiter";
import { COOKIE_NAME, ONE_YEAR_MS, PENDING_2FA_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

// Generate a random 6-digit OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expires in 5 minutes
function getOtpExpiration(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}

export const twoFactorAuthRouter = router({
  /**
   * Request a phone OTP for the 2FA challenge.
   * Requires a valid pendingToken issued after the first-factor login.
   */
  requestPhoneOtp: publicProcedure
    .input(
      z.object({
        pendingToken: z.string().min(1, "Pending token is required"),
      })
    )
    .mutation(async ({ input }) => {
      // Validate the pending token
      const pending = await verifyPending2FAToken(input.pendingToken);
      if (!pending) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired 2FA session. Please log in again.",
        });
      }

      // Re-fetch the user to ensure they still exist and still have a privileged role
      const user = await getPhoneUserById(pending.phoneUserId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User account not found.",
        });
      }

      if (!user.phone) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "No phone number registered on this account. " +
            "Please contact an administrator.",
        });
      }

      // Rate-limit SMS requests
      const rateLimitCheck = rateLimiter.isAllowed(
        user.phone,
        RATE_LIMIT_CONFIG.SMS_REQUEST.maxRequests,
        RATE_LIMIT_CONFIG.SMS_REQUEST.windowMs
      );

      if (!rateLimitCheck.allowed) {
        const retryAfter = rateLimitCheck.retryAfter || 3600;
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many SMS requests. Please try again in ${retryAfter} seconds.`,
        });
      }

      // Generate and store OTP
      const code = generateOtpCode();
      await createOtpCode({
        phoneUserId: user.id,
        code,
        expiresAt: getOtpExpiration(),
        attempts: 0,
      });

      // Send SMS
      const smsResult = await sendSMSVerification(user.phone);
      if (!smsResult.success) {
        console.error(`[2FA] Failed to send SMS to ${user.phone}:`, smsResult.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification SMS. Please try again.",
        });
      }

      console.log(`[2FA] OTP sent to ${user.phone} for user ${user.id} (role: ${user.role})`);

      return {
        success: true,
        message: "Verification code sent to your registered phone number.",
        // Masked phone for display (e.g. +44 *** *** 1234)
        maskedPhone: maskPhone(user.phone),
        // Dev only — remove in production
        devCode: code,
      };
    }),

  /**
   * Verify the phone OTP and complete the login.
   * On success, sets the real session cookie and clears the pending-2FA cookie.
   */
  completeLogin: publicProcedure
    .input(
      z.object({
        pendingToken: z.string().min(1, "Pending token is required"),
        code: z.string().length(6, "OTP must be 6 digits"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate the pending token
      const pending = await verifyPending2FAToken(input.pendingToken);
      if (!pending) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired 2FA session. Please log in again.",
        });
      }

      // Re-fetch user
      const user = await getPhoneUserById(pending.phoneUserId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User account not found.",
        });
      }

      if (!user.phone) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No phone number registered on this account.",
        });
      }

      // Rate-limit verification attempts
      const rateLimitCheck = rateLimiter.isVerificationAllowed(
        `${user.phone}-2fa-verify`,
        RATE_LIMIT_CONFIG.VERIFICATION_ATTEMPT.maxAttempts,
        RATE_LIMIT_CONFIG.VERIFICATION_ATTEMPT.windowMs
      );

      if (!rateLimitCheck.allowed) {
        const retryAfter = rateLimitCheck.retryAfter || 3600;
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many verification attempts. Please try again in ${retryAfter} seconds.`,
        });
      }

      // Verify OTP against database record
      const otpRecord = await getValidOtpCode(user.id, input.code);

      if (!otpRecord) {
        // Fall back to Twilio Verify API
        const twilioResult = await verifySMSCode(user.phone, input.code);
        if (!twilioResult.success) {
          await incrementOtpAttempts(user.id);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired verification code.",
          });
        }
      } else {
        if (otpRecord.attempts >= 3) {
          await deleteOtpCode(otpRecord.id);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Too many failed attempts. Please request a new code.",
          });
        }
        await deleteOtpCode(otpRecord.id);
      }

      // Update last sign-in time
      await updatePhoneUser(user.id, { lastSignedIn: new Date() });

      // Issue the real session cookie
      // Use googleId if available, otherwise fall back to email, then phone
      const openId = user.googleId || user.email || user.phone || String(user.id);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Clear the pending 2FA cookie if it was set
      ctx.res.clearCookie(PENDING_2FA_COOKIE_NAME, cookieOptions);

      console.log(
        `[2FA] Login completed for user ${user.id} (role: ${user.role}) via phone 2FA`
      );

      return {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  /**
   * Get the masked phone number for display on the 2FA challenge page.
   * Requires a valid pendingToken.
   */
  getChallengeMeta: publicProcedure
    .input(
      z.object({
        pendingToken: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const pending = await verifyPending2FAToken(input.pendingToken);
      if (!pending) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired 2FA session.",
        });
      }

      const user = await getPhoneUserById(pending.phoneUserId);
      if (!user || !user.phone) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User or phone number not found.",
        });
      }

      return {
        maskedPhone: maskPhone(user.phone),
        role: user.role,
      };
    }),
});

/** Mask a phone number for safe display, e.g. +44 *** *** 1234 */
function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, Math.min(3, phone.length - 4));
  const middle = "*".repeat(Math.max(0, phone.length - 4 - prefix.length));
  return `${prefix} ${middle} ${last4}`.trim();
}
