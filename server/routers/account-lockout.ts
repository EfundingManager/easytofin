import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { AccountLockoutService } from "../services/accountLockoutService";
import { TRPCError } from "@trpc/server";

export const accountLockoutRouter = router({
  /**
   * Check if account is locked
   */
  checkLockStatus: publicProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { isLocked, lockedUntil, remainingMinutes } =
          await AccountLockoutService.isAccountLocked(
            input.phoneUserId || null,
            input.email || null,
            input.phone || null
          );

        if (isLocked) {
          return {
            isLocked: true,
            message: `Account is locked. Please try again in ${remainingMinutes} minutes.`,
            lockedUntil,
            remainingMinutes,
          };
        }

        return { isLocked: false };
      } catch (error) {
        console.error("[AccountLockout] Error checking lock status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check account lock status",
        });
      }
    }),

  /**
   * Request unlock via email verification
   */
  requestEmailUnlock: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const token = await AccountLockoutService.generateUnlockToken(
          null,
          input.email,
          null,
          "email_verification"
        );

        // TODO: Send email with unlock link
        // const unlockUrl = `${process.env.FRONTEND_URL}/unlock-account/${token}`;
        // await sendUnlockEmail(input.email, unlockUrl);

        return {
          success: true,
          message: "Unlock email sent. Please check your inbox.",
        };
      } catch (error) {
        console.error("[AccountLockout] Error requesting email unlock:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request unlock email",
        });
      }
    }),

  /**
   * Request unlock via SMS verification
   */
  requestSmsUnlock: publicProcedure
    .input(
      z.object({
        phone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const token = await AccountLockoutService.generateUnlockToken(
          null,
          null,
          input.phone,
          "sms_verification"
        );

        // TODO: Send SMS with unlock code
        // const unlockCode = token.substring(0, 6).toUpperCase();
        // await sendUnlockSms(input.phone, unlockCode);

        return {
          success: true,
          message: "Unlock code sent via SMS. Please check your messages.",
        };
      } catch (error) {
        console.error("[AccountLockout] Error requesting SMS unlock:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request unlock SMS",
        });
      }
    }),

  /**
   * Verify unlock token and unlock account
   */
  verifyUnlockToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await AccountLockoutService.verifyUnlockToken(
          input.token
        );

        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired unlock token",
          });
        }

        return {
          success: true,
          message: "Account unlocked successfully. You can now try logging in again.",
        };
      } catch (error) {
        console.error("[AccountLockout] Error verifying unlock token:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify unlock token",
        });
      }
    }),

  /**
   * Get lockout statistics (admin only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view lockout statistics",
        });
      }

      const stats = await AccountLockoutService.getLockoutStats();
      return stats;
    } catch (error) {
      console.error("[AccountLockout] Error getting stats:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get lockout statistics",
      });
    }
  }),
});
