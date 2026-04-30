import { getDb } from "./db";
import { phoneUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Database helpers for TOTP operations
 */

/**
 * Save TOTP secret and backup codes for a user
 */
export async function saveTOTPSecret(
  phoneUserId: number,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(phoneUsers)
    .set({
      twoFactorSecret: secret,
      twoFactorEnabled: "true",
      updatedAt: new Date(),
    })
    .where(eq(phoneUsers.id, phoneUserId));
}

/**
 * Get TOTP secret for a user
 */
export async function getTOTPSecret(phoneUserId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db
    .select({ twoFactorSecret: phoneUsers.twoFactorSecret })
    .from(phoneUsers)
    .where(eq(phoneUsers.id, phoneUserId))
    .limit(1);

  return user[0]?.twoFactorSecret || null;
}

/**
 * Check if TOTP is enabled for a user
 */
export async function isTOTPEnabled(phoneUserId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db
    .select({ twoFactorEnabled: phoneUsers.twoFactorEnabled })
    .from(phoneUsers)
    .where(eq(phoneUsers.id, phoneUserId))
    .limit(1);

  return user[0]?.twoFactorEnabled === "true";
}

/**
 * Disable TOTP for a user
 */
export async function disableTOTP(phoneUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(phoneUsers)
    .set({
      twoFactorSecret: null,
      twoFactorEnabled: "false",
      updatedAt: new Date(),
    })
    .where(eq(phoneUsers.id, phoneUserId));
}
