/**
 * Password Reset Database Helpers
 * Manages password reset token lifecycle and OTP verification
 */

import { getDb } from "./db";
import { passwordResetTokens, PasswordResetToken } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new password reset token
 */
export async function createPasswordResetToken(
  phoneUserId: number,
  resetMethod: "email" | "phone",
  email: string | null,
  phone: string | null,
  otp: string,
  expiresAt: Date
): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const token = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const result = await db.insert(passwordResetTokens).values({
    phoneUserId,
    token,
    resetMethod,
    email,
    phone,
    otp,
    expiresAt,
  });

  const inserted = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return inserted[0];
}

/**
 * Get password reset token by token string
 */
export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return result[0] || null;
}

/**
 * Verify OTP for password reset token
 */
export async function verifyPasswordResetOtp(
  tokenId: number,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database connection failed" };
  const token = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, tokenId))
    .limit(1);

  if (!token[0]) {
    return { success: false, message: "Token not found" };
  }

  const resetToken = token[0];

  // Check if token is expired
  if (new Date() > resetToken.expiresAt) {
    return { success: false, message: "Token has expired" };
  }

  // Check if already verified
  if (resetToken.otpVerified === "true") {
    return { success: false, message: "OTP already verified" };
  }

  // Check max attempts
  if (resetToken.otpAttempts >= resetToken.maxOtpAttempts) {
    return { success: false, message: "Maximum OTP attempts exceeded" };
  }

  // Verify OTP
  if (resetToken.otp !== otp) {
    await db
      .update(passwordResetTokens)
      .set({ otpAttempts: resetToken.otpAttempts + 1 })
      .where(eq(passwordResetTokens.id, tokenId));

    return { success: false, message: "Invalid OTP" };
  }

  // Mark as verified
  await db
    .update(passwordResetTokens)
    .set({
      otpVerified: "true",
      otpVerifiedAt: new Date(),
    })
    .where(eq(passwordResetTokens.id, tokenId));

  return { success: true, message: "OTP verified successfully" };
}

/**
 * Complete password reset
 */
export async function completePasswordReset(
  tokenId: number,
  newPasswordHash: string
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database connection failed" };
  const token = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, tokenId))
    .limit(1);

  if (!token[0]) {
    return { success: false, message: "Token not found" };
  }

  const resetToken = token[0];

  // Check if OTP was verified
  if (resetToken.otpVerified !== "true") {
    return { success: false, message: "OTP not verified" };
  }

  // Check if already used
  if (resetToken.passwordResetAt) {
    return { success: false, message: "Token already used" };
  }

  // Update password reset completion
  await db
    .update(passwordResetTokens)
    .set({ passwordResetAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));

  return { success: true, message: "Password reset completed" };
}

/**
 * Get active password reset token for user
 */
export async function getActivePasswordResetToken(
  phoneUserId: number,
  resetMethod: "email" | "phone"
): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.phoneUserId, phoneUserId),
        eq(passwordResetTokens.resetMethod, resetMethod)
      )
    )
    .limit(1);

  if (!result[0]) return null;

  const token = result[0];

  // Check if expired
  if (new Date() > token.expiresAt) {
    return null;
  }

  return token;
}

/**
 * Invalidate password reset token
 */
export async function invalidatePasswordResetToken(
  tokenId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(passwordResetTokens)
    .set({ expiresAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.expiresAt, new Date()));

  return 0;
}
