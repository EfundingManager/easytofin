/**
 * Device-Based Login Service
 * Manages trusted devices and enables one-click login for returning users
 * Implements 1-hour window for device-based login without OTP
 */

import { getDb } from '../db';
import { trustedDevices, deviceVerificationTokens, phoneUsers } from '../../drizzle/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import * as crypto from 'crypto';
import {
  generateDeviceFingerprint,
  hashDeviceFingerprint,
  generateDeviceToken,
  createDeviceInfo,
  DeviceFingerprintData,
} from './device-fingerprint';

export interface TrustedDeviceCheckResult {
  isTrusted: boolean;
  phoneUserId?: number;
  deviceName?: string;
  lastUsedAt?: Date;
  requiresVerification?: boolean;
}

export interface DeviceLoginResult {
  allowed: boolean;
  phoneUserId?: number;
  reason?: string;
  deviceName?: string;
}

export interface RecentLoginUser {
  phoneUserId: number;
  email?: string;
  phone?: string;
  name?: string;
  deviceName: string;
  lastUsedAt: Date;
}

/**
 * Check if a device is trusted for a specific user
 */
export async function checkTrustedDevice(
  phoneUserId: number,
  deviceFingerprint: string,
  ipAddress: string
): Promise<TrustedDeviceCheckResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { isTrusted: false };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour window

    // Find trusted device for this user
    const device = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.deviceFingerprint, deviceFingerprint),
          eq(trustedDevices.isActive, 'true'),
          gt(trustedDevices.lastUsedAt, oneHourAgo)
        )
      )
      .limit(1);

    if (device.length === 0) {
      return { isTrusted: false };
    }

    const trustedDevice = device[0];

    // Verify IP address hasn't changed dramatically (allow some variation for mobile)
    // For security, we could enforce strict IP matching, but we'll allow some flexibility
    if (trustedDevice.ipAddress && trustedDevice.ipAddress !== ipAddress) {
      // IP changed - require verification
      return {
        isTrusted: true,
        phoneUserId: trustedDevice.phoneUserId,
        deviceName: trustedDevice.deviceName,
        lastUsedAt: trustedDevice.lastUsedAt,
        requiresVerification: true,
      };
    }

    return {
      isTrusted: true,
      phoneUserId: trustedDevice.phoneUserId,
      deviceName: trustedDevice.deviceName,
      lastUsedAt: trustedDevice.lastUsedAt,
      requiresVerification: false,
    };
  } catch (error) {
    console.error('[Device Login] Error checking trusted device:', error);
    return { isTrusted: false };
  }
}

/**
 * Get recently logged-in users on a device
 * Shows "Continue as [user]" options
 */
export async function getRecentLoginUsers(
  deviceFingerprint: string,
  limit: number = 5
): Promise<RecentLoginUser[]> {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour window

    // Find all trusted devices with this fingerprint that were used recently
    const devices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.deviceFingerprint, deviceFingerprint),
          eq(trustedDevices.isActive, 'true'),
          gt(trustedDevices.lastUsedAt, oneHourAgo)
        )
      )
      .limit(limit);

    // Get user details for each device
    const users: RecentLoginUser[] = [];
    for (const device of devices) {
      const user = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.id, device.phoneUserId))
        .limit(1);

      if (user.length > 0) {
        users.push({
          phoneUserId: device.phoneUserId,
          email: user[0].email || undefined,
          phone: user[0].phone || undefined,
          name: user[0].name || undefined,
          deviceName: device.deviceName,
          lastUsedAt: device.lastUsedAt,
        });
      }
    }

    return users;
  } catch (error) {
    console.error('[Device Login] Error getting recent login users:', error);
    return [];
  }
}

/**
 * Register a new trusted device
 */
export async function registerTrustedDevice(
  phoneUserId: number,
  deviceFingerprint: string,
  userAgent: string,
  ipAddress: string,
  deviceName?: string
): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const deviceToken = generateDeviceToken();
    const now = new Date();

    // Check if device already exists
    const existing = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.deviceFingerprint, deviceFingerprint)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing device
      await db
        .update(trustedDevices)
        .set({
          lastUsedAt: now,
          ipAddress,
          userAgent,
          isActive: 'true',
        })
        .where(eq(trustedDevices.id, existing[0].id));

      return existing[0].deviceToken;
    }

    // Create new trusted device
    const deviceInfo = createDeviceInfo(userAgent);
    await db.insert(trustedDevices).values({
      phoneUserId,
      deviceFingerprint,
      deviceToken,
      deviceName: deviceName || deviceInfo.deviceName,
      userAgent,
      ipAddress,
      lastUsedAt: now,
      isActive: 'true',
    });

    return deviceToken;
  } catch (error) {
    console.error('[Device Login] Error registering trusted device:', error);
    return null;
  }
}

/**
 * Verify device-based login (one-click login)
 */
export async function verifyDeviceLogin(
  phoneUserId: number,
  deviceFingerprint: string,
  ipAddress: string
): Promise<DeviceLoginResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { allowed: false, reason: 'Database connection failed' };
    }

    // Check if device is trusted
    const check = await checkTrustedDevice(phoneUserId, deviceFingerprint, ipAddress);

    if (!check.isTrusted) {
      return { allowed: false, reason: 'Device not trusted' };
    }

    // Update last used time
    const now = new Date();
    await db
      .update(trustedDevices)
      .set({ lastUsedAt: now })
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.deviceFingerprint, deviceFingerprint)
        )
      );

    return {
      allowed: true,
      phoneUserId,
      deviceName: check.deviceName,
    };
  } catch (error) {
    console.error('[Device Login] Error verifying device login:', error);
    return { allowed: false, reason: 'Verification failed' };
  }
}

/**
 * Remove a trusted device
 */
export async function removeTrustedDevice(
  phoneUserId: number,
  deviceId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Verify ownership
    const device = await db
      .select()
      .from(trustedDevices)
      .where(eq(trustedDevices.id, deviceId))
      .limit(1);

    if (device.length === 0 || device[0].phoneUserId !== phoneUserId) {
      return false;
    }

    // Deactivate device instead of deleting
    await db
      .update(trustedDevices)
      .set({ isActive: 'false' })
      .where(eq(trustedDevices.id, deviceId));

    return true;
  } catch (error) {
    console.error('[Device Login] Error removing trusted device:', error);
    return false;
  }
}

/**
 * Get all trusted devices for a user
 */
export async function getUserTrustedDevices(phoneUserId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const devices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.isActive, 'true')
        )
      );

    return devices.map(d => ({
      id: d.id,
      deviceName: d.deviceName,
      browserInfo: d.userAgent,
      ipAddress: d.ipAddress,
      lastUsedAt: d.lastUsedAt,
      createdAt: d.createdAt,
    }));
  } catch (error) {
    console.error('[Device Login] Error getting user devices:', error);
    return [];
  }
}

/**
 * Logout from all devices
 */
export async function logoutAllDevices(phoneUserId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    // Deactivate all devices
    await db
      .update(trustedDevices)
      .set({ isActive: 'false' })
      .where(eq(trustedDevices.phoneUserId, phoneUserId));

    return 1;
  } catch (error) {
    console.error('[Device Login] Error logging out from all devices:', error);
    return 0;
  }
}

/**
 * Clean up old trusted devices (older than 30 days)
 */
export async function cleanupOldDevices(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const thirtyDaysAgo = new Date(Date.now() - 2592000000); // 30 days

    // Deactivate old devices
    await db
      .update(trustedDevices)
      .set({ isActive: 'false' })
      .where(lt(trustedDevices.lastUsedAt, thirtyDaysAgo));

    return 1;
  } catch (error) {
    console.error('[Device Login] Error cleaning up old devices:', error);
    return 0;
  }
}
