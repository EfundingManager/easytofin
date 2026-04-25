import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  recordLoginAttempt,
  isAccountLocked,
  checkAndLockAccount,
  getRemainingLockoutTime,
  getFailedAttemptCount,
  logSecurityEvent,
  unlockAccount,
} from "../services/accountLockout";
import { TRPCError } from "@trpc/server";

export const authLockoutRouter = router({
  /**
   * Verify OTP with account lockout check
   */
  verifyOtpWithLockout: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        otp: z.string().min(6).max(6),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, phone, otp, ipAddress, userAgent } = input;

      // Check if account is locked
      const locked = await isAccountLocked(undefined, email, phone);
      if (locked) {
        const remainingTime = await getRemainingLockoutTime(undefined, email, phone);
        const minutes = Math.ceil(remainingTime / 60);

        // Log failed attempt
        await recordLoginAttempt({
          email,
          phone,
          attemptType: "otp",
          success: false,
          ipAddress,
          userAgent,
          failureReason: "account_locked",
        });

        await logSecurityEvent({
          email,
          phone,
          eventType: "login_failed",
          description: `Login attempt on locked account (${minutes} minutes remaining)`,
          ipAddress,
          userAgent,
          severity: "high",
          metadata: { reason: "account_locked", remainingMinutes: minutes },
        });

        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Account is locked. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
          cause: "account_locked",
        });
      }

      // TODO: Verify OTP against database
      // This is a placeholder - integrate with your actual OTP verification logic
      const otpValid = await verifyOtpCode(email, phone, otp);

      if (!otpValid) {
        // Record failed attempt
        await recordLoginAttempt({
          email,
          phone,
          attemptType: "otp",
          success: false,
          ipAddress,
          userAgent,
          failureReason: "invalid_otp",
        });

        // Check if we should lock the account
        const failedCount = await getFailedAttemptCount(undefined, email, phone);
        const shouldLock = await checkAndLockAccount(undefined, email, phone, ipAddress, userAgent);

        if (shouldLock) {
          await logSecurityEvent({
            email,
            phone,
            eventType: "account_locked",
            description: `Account locked after ${failedCount} failed OTP attempts`,
            ipAddress,
            userAgent,
            severity: "high",
            metadata: { failedAttempts: failedCount, lockDurationMinutes: 60 },
          });

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Too many failed attempts. Account is now locked for 60 minutes.",
            cause: "account_locked",
          });
        }

        const attemptsRemaining = 5 - failedCount;
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Invalid OTP. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? "s" : ""} remaining.`,
          cause: "invalid_otp",
        });
      }

      // OTP is valid - record successful attempt
      await recordLoginAttempt({
        email,
        phone,
        attemptType: "otp",
        success: true,
        ipAddress,
        userAgent,
      });

      await logSecurityEvent({
        email,
        phone,
        eventType: "login_success",
        description: "User logged in successfully via OTP",
        ipAddress,
        userAgent,
        severity: "low",
      });

      return { success: true, message: "OTP verified successfully" };
    }),

  /**
   * Get account lockout status
   */
  getLockoutStatus: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { email, phone } = input;

      const isLocked = await isAccountLocked(undefined, email, phone);
      if (!isLocked) {
        return { locked: false, remainingTime: 0 };
      }

      const remainingTime = await getRemainingLockoutTime(undefined, email, phone);
      const failedCount = await getFailedAttemptCount(undefined, email, phone);

      return {
        locked: true,
        remainingTime,
        remainingMinutes: Math.ceil(remainingTime / 60),
        failedAttempts: failedCount,
      };
    }),

  /**
   * Get failed attempt count
   */
  getFailedAttempts: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { email, phone } = input;
      const count = await getFailedAttemptCount(undefined, email, phone);
      return { failedAttempts: count, remainingAttempts: Math.max(0, 5 - count) };
    }),

  /**
   * Admin unlock account
   */
  adminUnlockAccount: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can unlock accounts
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can unlock accounts",
        });
      }

      const { email, phone, reason } = input;

      await unlockAccount(undefined, email, phone, `admin_${ctx.user.id}`);

      await logSecurityEvent({
        email,
        phone,
        eventType: "account_unlocked",
        description: `Account unlocked by admin: ${reason || "No reason provided"}`,
        severity: "medium",
        metadata: { unlockedBy: `admin_${ctx.user.id}`, reason },
      });

      return { success: true, message: "Account unlocked successfully" };
    }),
});

/**
 * Placeholder for OTP verification
 * Replace with your actual OTP verification logic
 */
async function verifyOtpCode(
  email: string | undefined,
  phone: string | undefined,
  otp: string
): Promise<boolean> {
  // TODO: Implement actual OTP verification
  // This should check against the otpCodes table
  return false;
}
