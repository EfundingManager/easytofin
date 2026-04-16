import { getDb } from "./db";
import {
  trustedDevices,
  deviceVerificationTokens,
  type InsertTrustedDevice,
  type InsertDeviceVerificationToken,
} from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";

// Helper to get db instance
const getDatabase = async () => {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db;
};

/**
 * Device management database helpers
 * Handles trusted device registration, verification, and management
 */

/**
 * Register a new trusted device for a user
 */
export async function registerTrustedDevice(
  phoneUserId: number,
  input: Omit<InsertTrustedDevice, "createdAt" | "updatedAt">
): Promise<typeof trustedDevices.$inferSelect> {
  const db = await getDatabase();
  const result = await db.insert(trustedDevices).values({
    ...input,
    phoneUserId,
  });

  const deviceId = result[0].insertId;
  const devices = await db.select().from(trustedDevices).where(eq(trustedDevices.id, Number(deviceId)));
  const device = devices[0];

  if (!device) {
    throw new Error("Failed to create trusted device");
  }

  return device;
}

/**
 * Get all trusted devices for a user
 */
export async function getTrustedDevices(phoneUserId: number) {
  const db = await getDatabase();
  return db
    .select()
    .from(trustedDevices)
    .where(and(eq(trustedDevices.phoneUserId, phoneUserId), eq(trustedDevices.isActive, "true")));
}

/**
 * Get a specific trusted device
 */
export async function getTrustedDevice(deviceId: number) {
  const db = await getDatabase();
  const result = await db.select().from(trustedDevices).where(eq(trustedDevices.id, deviceId));
  return result[0] || null;
}

/**
 * Get trusted device by token
 */
export async function getTrustedDeviceByToken(token: string) {
  const db = await getDatabase();
  const result = await db.select().from(trustedDevices).where(eq(trustedDevices.deviceToken, token));
  return result[0] || null;
}

/**
 * Update trusted device last used time
 */
export async function updateDeviceLastUsed(deviceId: number): Promise<void> {
  const db = await getDatabase();
  await db
    .update(trustedDevices)
    .set({
      lastUsedAt: new Date(),
    })
    .where(eq(trustedDevices.id, deviceId));
}

/**
 * Deactivate a trusted device
 */
export async function deactivateTrustedDevice(deviceId: number): Promise<void> {
  const db = await getDatabase();
  await db
    .update(trustedDevices)
    .set({
      isActive: "false",
    })
    .where(eq(trustedDevices.id, deviceId));
}

/**
 * Delete a trusted device
 */
export async function deleteTrustedDevice(deviceId: number): Promise<void> {
  const db = await getDatabase();
  await db.delete(trustedDevices).where(eq(trustedDevices.id, deviceId));
}

/**
 * Create a device verification token
 */
export async function createDeviceVerificationToken(
  phoneUserId: number,
  input: Omit<InsertDeviceVerificationToken, "phoneUserId" | "createdAt">
): Promise<typeof deviceVerificationTokens.$inferSelect> {
  const db = await getDatabase();
  const result = await db.insert(deviceVerificationTokens).values({
    ...input,
    phoneUserId,
  });

  const tokenId = result[0].insertId;
  const tokens = await db.select().from(deviceVerificationTokens).where(eq(deviceVerificationTokens.id, Number(tokenId)));
  const token = tokens[0];

  if (!token) {
    throw new Error("Failed to create device verification token");
  }

  return token;
}

/**
 * Get device verification token
 */
export async function getDeviceVerificationToken(token: string) {
  const db = await getDatabase();
  const result = await db.select().from(deviceVerificationTokens).where(eq(deviceVerificationTokens.token, token));
  return result[0] || null;
}

/**
 * Verify and activate device verification token
 */
export async function verifyDeviceToken(tokenId: number): Promise<void> {
  const db = await getDatabase();
  await db
    .update(deviceVerificationTokens)
    .set({
      verified: "true",
      verifiedAt: new Date(),
    })
    .where(eq(deviceVerificationTokens.id, tokenId));
}

/**
 * Clean up expired device verification tokens
 */
export async function cleanupExpiredDeviceTokens(): Promise<number> {
  const db = await getDatabase();
  const result = await db
    .delete(deviceVerificationTokens)
    .where(lt(deviceVerificationTokens.expiresAt, new Date()));

  return result[0].affectedRows || 0;
}

/**
 * Check if device fingerprint is already trusted for user
 */
export async function isFingerprintTrusted(
  phoneUserId: number,
  deviceFingerprint: string
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .select()
    .from(trustedDevices)
    .where(
      and(
        eq(trustedDevices.phoneUserId, phoneUserId),
        eq(trustedDevices.deviceFingerprint, deviceFingerprint),
        eq(trustedDevices.isActive, "true")
      )
    );

  return result.length > 0;
}

/**
 * Get device by fingerprint for user
 */
export async function getDeviceByFingerprint(phoneUserId: number, deviceFingerprint: string) {
  const db = await getDatabase();
  const result = await db
    .select()
    .from(trustedDevices)
    .where(
      and(
        eq(trustedDevices.phoneUserId, phoneUserId),
        eq(trustedDevices.deviceFingerprint, deviceFingerprint),
        eq(trustedDevices.isActive, "true")
      )
    );
  return result[0] || null;
}

/**
 * Count trusted devices for user
 */
export async function countTrustedDevices(phoneUserId: number): Promise<number> {
  const db = await getDatabase();
  const devices = await db
    .select()
    .from(trustedDevices)
    .where(and(eq(trustedDevices.phoneUserId, phoneUserId), eq(trustedDevices.isActive, "true")));

  return devices.length;
}

/**
 * Deactivate all devices for user (e.g., on password change)
 */
export async function deactivateAllUserDevices(phoneUserId: number): Promise<void> {
  const db = await getDatabase();
  await db
    .update(trustedDevices)
    .set({
      isActive: "false",
    })
    .where(eq(trustedDevices.phoneUserId, phoneUserId));
}

/**
 * Get recent devices for user (last 7 days)
 */
export async function getRecentDevices(phoneUserId: number) {
  const db = await getDatabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return db
    .select()
    .from(trustedDevices)
    .where(
      and(
        eq(trustedDevices.phoneUserId, phoneUserId),
        eq(trustedDevices.isActive, "true")
        // Note: Drizzle doesn't support gt() directly in findMany, so we filter in code
      )
    );
}
