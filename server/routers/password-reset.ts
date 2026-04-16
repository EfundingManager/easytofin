/**
 * Password Reset Router
 * Handles password reset requests, OTP verification, and password updates
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createPasswordResetToken,
  getPasswordResetToken,
  verifyPasswordResetOtp,
  completePasswordReset,
  getActivePasswordResetToken,
} from "../db-password-reset";
import { getDb } from "../db";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const passwordResetRouter = router({
  /**
   * Request password reset via email or phone
   * Generates OTP and creates reset token
   */
  requestReset: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        resetMethod: z.enum(["email", "phone"]),
      })
    )
    .mutation(async ({ input }) => {
      const { email, phone, resetMethod } = input;

      if (!email && !phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email or phone is required",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Find user by email or phone
      let user;
      if (resetMethod === "email" && email) {
        const result = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, email))
          .limit(1);
        user = result[0];
      } else if (resetMethod === "phone" && phone) {
        const result = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.phone, phone))
          .limit(1);
        user = result[0];
      }

      if (!user) {
        // Don't reveal if user exists (security best practice)
        return {
          success: true,
          message: "If the account exists, a reset code has been sent",
        };
      }

      // Check if there's an active reset token
      const existingToken = await getActivePasswordResetToken(
        user.id,
        resetMethod
      );
      if (existingToken) {
        return {
          success: true,
          message: "A reset code was recently sent. Please check your messages.",
        };
      }

      // Generate OTP (6-digit code)
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

      // Create reset token
      const resetToken = await createPasswordResetToken(
        user.id,
        resetMethod,
        email || null,
        phone || null,
        otp,
        expiresAt
      );

      // TODO: Send OTP via email or SMS
      // For now, log it (in production, send via email/SMS service)
      console.log(`[Password Reset] OTP for user ${user.id}: ${otp}`);

      return {
        success: true,
        message: "Reset code sent successfully",
        tokenId: resetToken.id, // For frontend to track
      };
    }),

  /**
   * Verify OTP for password reset
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        token: z.string(),
        otp: z.string().length(6),
      })
    )
    .mutation(async ({ input }) => {
      const { token, otp } = input;

      const resetToken = await getPasswordResetToken(token);
      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token",
        });
      }

      const result = await verifyPasswordResetOtp(resetToken.id, otp);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.message,
        });
      }

      return {
        success: true,
        message: "OTP verified successfully",
        tokenId: resetToken.id,
      };
    }),

  /**
   * Complete password reset with new password
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { token, newPassword } = input;

      const resetToken = await getPasswordResetToken(token);
      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token",
        });
      }

      // Verify OTP was verified
      if (resetToken.otpVerified !== "true") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "OTP must be verified before resetting password",
        });
      }

      // Hash new password
      const crypto_module = require("crypto");
      const passwordHash = crypto_module.createHash("sha256").update(newPassword).digest("hex");

      // Update password in database
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      await db
        .update(phoneUsers)
        .set({ passwordHash })
        .where(eq(phoneUsers.id, resetToken.phoneUserId));

      // Mark reset as complete
      const result = await completePasswordReset(resetToken.id, passwordHash);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return {
        success: true,
        message: "Password reset successfully. Please log in with your new password.",
      };
    }),

  /**
   * Check if reset token is valid
   */
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const resetToken = await getPasswordResetToken(input.token);

      if (!resetToken) {
        return { valid: false, message: "Invalid or expired token" };
      }

      if (new Date() > resetToken.expiresAt) {
        return { valid: false, message: "Token has expired" };
      }

      return {
        valid: true,
        requiresOtp: resetToken.otpVerified !== "true",
        resetMethod: resetToken.resetMethod,
      };
    }),
});
