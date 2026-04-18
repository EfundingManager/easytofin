import { getDb } from '../db';
import { trustedDevices } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
}

export interface TrustedDeviceData {
  phoneUserId: number;
  deviceFingerprint: string;
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Generate a unique device fingerprint based on user agent and other device characteristics
 */
export function generateDeviceFingerprint(userAgent?: string, ipAddress?: string): string {
  const fingerprint = `${userAgent || 'unknown'}-${ipAddress || 'unknown'}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

/**
 * Generate a unique device token for verification
 */
export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Parse user agent to extract device name
 */
export function parseDeviceName(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';

  // Simple parsing - can be enhanced
  if (userAgent.includes('Windows')) {
    if (userAgent.includes('Chrome')) return 'Chrome on Windows';
    if (userAgent.includes('Firefox')) return 'Firefox on Windows';
    if (userAgent.includes('Safari')) return 'Safari on Windows';
    return 'Windows Device';
  } else if (userAgent.includes('Mac')) {
    if (userAgent.includes('Chrome')) return 'Chrome on Mac';
    if (userAgent.includes('Safari')) return 'Safari on Mac';
    if (userAgent.includes('Firefox')) return 'Firefox on Mac';
    return 'Mac Device';
  } else if (userAgent.includes('iPhone')) {
    if (userAgent.includes('Chrome')) return 'Chrome on iPhone';
    if (userAgent.includes('Safari')) return 'Safari on iPhone';
    return 'iPhone';
  } else if (userAgent.includes('Android')) {
    if (userAgent.includes('Chrome')) return 'Chrome on Android';
    return 'Android Device';
  } else if (userAgent.includes('Linux')) {
    return 'Linux Device';
  }

  return 'Unknown Device';
}

/**
 * Add a device to trusted devices list
 */
export async function addTrustedDevice(data: TrustedDeviceData): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    const deviceToken = generateDeviceToken();

    await db.insert(trustedDevices).values({
      phoneUserId: data.phoneUserId,
      deviceFingerprint: data.deviceFingerprint,
      deviceName: data.deviceName,
      deviceToken,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      lastUsedAt: new Date(),
      isActive: 'true',
    });

    console.log(`[DeviceTrust] Added trusted device for user ${data.phoneUserId}: ${data.deviceName}`);
    return true;
  } catch (error) {
    console.error('[DeviceTrust] Failed to add trusted device:', error);
    return false;
  }
}

/**
 * Check if a device is trusted for a user
 */
export async function isTrustedDevice(phoneUserId: number, deviceFingerprint: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    const device = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.deviceFingerprint, deviceFingerprint),
          eq(trustedDevices.isActive, 'true')
        )
      )
      .limit(1);

    if (device && device.length > 0) {
      // Update last used time
      await db
        .update(trustedDevices)
        .set({ lastUsedAt: new Date() })
        .where(eq(trustedDevices.id, device[0].id));

      return true;
    }

    return false;
  } catch (error) {
    console.error('[DeviceTrust] Failed to check trusted device:', error);
    return false;
  }
}

/**
 * Get all trusted devices for a user
 */
export async function getTrustedDevices(phoneUserId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return [];
    }

    const devices = await db
      .select()
      .from(trustedDevices)
      .where(eq(trustedDevices.phoneUserId, phoneUserId))
      .orderBy(trustedDevices.lastUsedAt);

    return devices.map((d) => ({
      id: d.id,
      deviceName: d.deviceName,
      deviceFingerprint: d.deviceFingerprint,
      ipAddress: d.ipAddress,
      userAgent: d.userAgent,
      lastUsedAt: d.lastUsedAt,
      isActive: d.isActive === 'true',
      createdAt: d.createdAt,
    }));
  } catch (error) {
    console.error('[DeviceTrust] Failed to get trusted devices:', error);
    return [];
  }
}

/**
 * Remove a trusted device
 */
export async function removeTrustedDevice(phoneUserId: number, deviceId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    // Verify ownership before deleting
    const device = await db
      .select()
      .from(trustedDevices)
      .where(eq(trustedDevices.id, deviceId))
      .limit(1);

    if (!device || device.length === 0 || device[0].phoneUserId !== phoneUserId) {
      console.warn(`[DeviceTrust] Unauthorized attempt to remove device ${deviceId}`);
      return false;
    }

    await db.delete(trustedDevices).where(eq(trustedDevices.id, deviceId));

    console.log(`[DeviceTrust] Removed trusted device for user ${phoneUserId}`);
    return true;
  } catch (error) {
    console.error('[DeviceTrust] Failed to remove trusted device:', error);
    return false;
  }
}

/**
 * Deactivate a trusted device (soft delete)
 */
export async function deactivateTrustedDevice(phoneUserId: number, deviceId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    // Verify ownership before deactivating
    const device = await db
      .select()
      .from(trustedDevices)
      .where(eq(trustedDevices.id, deviceId))
      .limit(1);

    if (!device || device.length === 0 || device[0].phoneUserId !== phoneUserId) {
      console.warn(`[DeviceTrust] Unauthorized attempt to deactivate device ${deviceId}`);
      return false;
    }

    await db
      .update(trustedDevices)
      .set({ isActive: 'false' })
      .where(eq(trustedDevices.id, deviceId));

    console.log(`[DeviceTrust] Deactivated trusted device for user ${phoneUserId}`);
    return true;
  } catch (error) {
    console.error('[DeviceTrust] Failed to deactivate trusted device:', error);
    return false;
  }
}

/**
 * Remove all trusted devices for a user (security measure)
 */
export async function removeAllTrustedDevices(phoneUserId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    await db.delete(trustedDevices).where(eq(trustedDevices.phoneUserId, phoneUserId));

    console.log(`[DeviceTrust] Removed all trusted devices for user ${phoneUserId}`);
    return true;
  } catch (error) {
    console.error('[DeviceTrust] Failed to remove all trusted devices:', error);
    return false;
  }
}

/**
 * Get device count for a user
 */
export async function getTrustedDeviceCount(phoneUserId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return 0;
    }

    const devices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(eq(trustedDevices.phoneUserId, phoneUserId), eq(trustedDevices.isActive, 'true'))
      );

    return devices.length;
  } catch (error) {
    console.error('[DeviceTrust] Failed to get device count:', error);
    return 0;
  }
}

/**
 * Check if user has reached max trusted devices limit
 */
export async function hasReachedDeviceLimit(phoneUserId: number, maxDevices: number = 10): Promise<boolean> {
  const count = await getTrustedDeviceCount(phoneUserId);
  return count >= maxDevices;
}

/**
 * Update device name
 */
export async function updateDeviceName(phoneUserId: number, deviceId: number, newName: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return false;
    }

    // Verify ownership
    const device = await db
      .select()
      .from(trustedDevices)
      .where(eq(trustedDevices.id, deviceId))
      .limit(1);

    if (!device || device.length === 0 || device[0].phoneUserId !== phoneUserId) {
      console.warn(`[DeviceTrust] Unauthorized attempt to update device ${deviceId}`);
      return false;
    }

    await db
      .update(trustedDevices)
      .set({ deviceName: newName })
      .where(eq(trustedDevices.id, deviceId));

    console.log(`[DeviceTrust] Updated device name for user ${phoneUserId}`);
    return true;
  } catch (error) {
    console.error('[DeviceTrust] Failed to update device name:', error);
    return false;
  }
}

/**
 * Clean up old inactive devices (older than 90 days)
 */
export async function cleanupOldDevices(phoneUserId: number, daysOld: number = 90): Promise<number> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[DeviceTrust] Database not available');
      return 0;
    }

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const oldDevices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.phoneUserId, phoneUserId),
          eq(trustedDevices.isActive, 'false')
        )
      );

    let deletedCount = 0;
    for (const device of oldDevices) {
      if (device.lastUsedAt < cutoffDate) {
        await db.delete(trustedDevices).where(eq(trustedDevices.id, device.id));
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[DeviceTrust] Cleaned up ${deletedCount} old devices for user ${phoneUserId}`);
    }

    return deletedCount;
  } catch (error) {
    console.error('[DeviceTrust] Failed to cleanup old devices:', error);
    return 0;
  }
}
