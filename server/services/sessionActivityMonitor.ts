import { getDb } from "../db";
import {
  sessionActivityLog,
  suspiciousActivityLockout,
  securityAuditLog,
} from "../../drizzle/schema";
import { eq, and, gt, gte, lte, isNull } from "drizzle-orm";

/**
 * Configuration for suspicious activity detection
 */
export const SUSPICIOUS_ACTIVITY_CONFIG = {
  MAX_ACTIVITIES_IN_WINDOW: 5, // 5 login/logout events
  TIME_WINDOW_SECONDS: 120, // within 2 minutes
  LOCKOUT_DURATION_MINUTES: 60, // lock for 60 minutes
};

/**
 * Record a session activity (login, logout, etc.)
 */
export async function recordSessionActivity(input: {
  phoneUserId?: number;
  userId?: number;
  email?: string;
  phone?: string;
  activityType: "login" | "logout" | "session_created" | "session_terminated";
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceFingerprint?: string;
  location?: string;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(sessionActivityLog).values({
      phoneUserId: input.phoneUserId,
      userId: input.userId,
      email: input.email,
      phone: input.phone,
      activityType: input.activityType,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      sessionId: input.sessionId,
      deviceFingerprint: input.deviceFingerprint,
      location: input.location,
    });
  } catch (error) {
    console.error("[SessionActivityMonitor] Error recording activity:", error);
  }
}

/**
 * Get activity count within time window
 */
export async function getActivityCountInWindow(
  phoneUserId?: number,
  email?: string,
  phone?: string,
  timeWindowSeconds: number = SUSPICIOUS_ACTIVITY_CONFIG.TIME_WINDOW_SECONDS
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const cutoffTime = new Date(Date.now() - timeWindowSeconds * 1000);

    const result = await db
      .select({ count: sessionActivityLog.id })
      .from(sessionActivityLog)
      .where(
        and(
          phoneUserId ? eq(sessionActivityLog.phoneUserId, phoneUserId) : undefined,
          email ? eq(sessionActivityLog.email, email) : undefined,
          phone ? eq(sessionActivityLog.phone, phone) : undefined,
          gte(sessionActivityLog.createdAt, cutoffTime)
        )
      )
      .limit(1);

    return result.length > 0 ? result.length : 0;
  } catch (error) {
    console.error("[SessionActivityMonitor] Error getting activity count:", error);
    return 0;
  }
}

/**
 * Check if account is locked due to suspicious activity
 */
export async function isSuspiciousActivityLocked(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const now = new Date();

    const result = await db
      .select()
      .from(suspiciousActivityLockout)
      .where(
        and(
          phoneUserId ? eq(suspiciousActivityLockout.phoneUserId, phoneUserId) : undefined,
          email ? eq(suspiciousActivityLockout.email, email) : undefined,
          phone ? eq(suspiciousActivityLockout.phone, phone) : undefined,
          lte(suspiciousActivityLockout.lockedAt, now),
          gte(suspiciousActivityLockout.unlocksAt, now),
          isNull(suspiciousActivityLockout.unlockedAt)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[SessionActivityMonitor] Error checking lockout status:", error);
    return false;
  }
}

/**
 * Detect and lock account for suspicious activity
 */
export async function detectAndLockSuspiciousActivity(
  phoneUserId?: number,
  userId?: number,
  email?: string,
  phone?: string,
  ipAddress?: string,
  userAgent?: string,
  timeWindowSeconds: number = SUSPICIOUS_ACTIVITY_CONFIG.TIME_WINDOW_SECONDS,
  maxActivities: number = SUSPICIOUS_ACTIVITY_CONFIG.MAX_ACTIVITIES_IN_WINDOW
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Count activities in time window
    const cutoffTime = new Date(Date.now() - timeWindowSeconds * 1000);

    const activities = await db
      .select()
      .from(sessionActivityLog)
      .where(
        and(
          phoneUserId ? eq(sessionActivityLog.phoneUserId, phoneUserId) : undefined,
          email ? eq(sessionActivityLog.email, email) : undefined,
          phone ? eq(sessionActivityLog.phone, phone) : undefined,
          gte(sessionActivityLog.createdAt, cutoffTime)
        )
      );

    // If activity count exceeds threshold, lock the account
    if (activities.length >= maxActivities) {
      const now = new Date();
      const unlocksAt = new Date(
        now.getTime() + SUSPICIOUS_ACTIVITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000
      );

      await db.insert(suspiciousActivityLockout).values({
        phoneUserId,
        userId,
        email,
        phone,
        lockoutReason: "excessive_login_logout",
        activityCount: activities.length,
        timeWindowSeconds,
        lockedAt: now,
        unlocksAt,
        ipAddress,
        userAgent,
        metadata: JSON.stringify({
          activities: activities.map((a) => ({
            type: a.activityType,
            time: a.createdAt,
            ip: a.ipAddress,
          })),
          detectedAt: now.toISOString(),
        }),
      });

      // Log security event
      await logSecurityEvent({
        phoneUserId,
        userId,
        email,
        phone,
        eventType: "suspicious_activity",
        description: `Account locked due to ${activities.length} login/logout events in ${timeWindowSeconds} seconds`,
        ipAddress,
        userAgent,
        severity: "high",
        metadata: {
          activityCount: activities.length,
          timeWindowSeconds,
          lockoutDurationMinutes: SUSPICIOUS_ACTIVITY_CONFIG.LOCKOUT_DURATION_MINUTES,
        },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("[SessionActivityMonitor] Error detecting suspicious activity:", error);
    return false;
  }
}

/**
 * Get remaining lockout time in seconds
 */
export async function getRemainingLockoutTime(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;
    const now = new Date();

    const result = await db
      .select()
      .from(suspiciousActivityLockout)
      .where(
        and(
          phoneUserId ? eq(suspiciousActivityLockout.phoneUserId, phoneUserId) : undefined,
          email ? eq(suspiciousActivityLockout.email, email) : undefined,
          phone ? eq(suspiciousActivityLockout.phone, phone) : undefined,
          lte(suspiciousActivityLockout.lockedAt, now),
          gte(suspiciousActivityLockout.unlocksAt, now),
          isNull(suspiciousActivityLockout.unlockedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return 0;
    }

    const lockout = result[0];
    const remaining = Math.max(0, lockout.unlocksAt.getTime() - now.getTime());
    return Math.ceil(remaining / 1000);
  } catch (error) {
    console.error("[SessionActivityMonitor] Error getting remaining lockout time:", error);
    return 0;
  }
}

/**
 * Get lockout details
 */
export async function getSuspiciousActivityLockoutDetails(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<
  | {
      locked: boolean;
      reason?: string;
      activityCount?: number;
      remainingSeconds?: number;
      unlocksAt?: Date;
    }
  | null
> {
  try {
    const db = await getDb();
    if (!db) return { locked: false };
    const now = new Date();

    const result = await db
      .select()
      .from(suspiciousActivityLockout)
      .where(
        and(
          phoneUserId ? eq(suspiciousActivityLockout.phoneUserId, phoneUserId) : undefined,
          email ? eq(suspiciousActivityLockout.email, email) : undefined,
          phone ? eq(suspiciousActivityLockout.phone, phone) : undefined,
          lte(suspiciousActivityLockout.lockedAt, now),
          gte(suspiciousActivityLockout.unlocksAt, now),
          isNull(suspiciousActivityLockout.unlockedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { locked: false };
    }

    const lockout = result[0];
    const remaining = Math.max(0, lockout.unlocksAt.getTime() - now.getTime());

    return {
      locked: true,
      reason: lockout.lockoutReason,
      activityCount: lockout.activityCount,
      remainingSeconds: Math.ceil(remaining / 1000),
      unlocksAt: lockout.unlocksAt,
    };
  } catch (error) {
    console.error("[SessionActivityMonitor] Error getting lockout details:", error);
    return { locked: false };
  }
}

/**
 * Manually unlock account (admin only)
 */
export async function unlockSuspiciousActivityLockout(
  phoneUserId?: number,
  email?: string,
  phone?: string,
  unlockedBy?: string,
  reason?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    const now = new Date();

    // Find the active lockout
    const result = await db
      .select()
      .from(suspiciousActivityLockout)
      .where(
        and(
          phoneUserId ? eq(suspiciousActivityLockout.phoneUserId, phoneUserId) : undefined,
          email ? eq(suspiciousActivityLockout.email, email) : undefined,
          phone ? eq(suspiciousActivityLockout.phone, phone) : undefined,
          isNull(suspiciousActivityLockout.unlockedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return;
    }

    const lockout = result[0];

    // Update lockout record
    await db
      .update(suspiciousActivityLockout)
      .set({
        unlockedAt: now,
        unlockedBy,
        unlockReason: reason,
      })
      .where(eq(suspiciousActivityLockout.id, lockout.id));

    // Log security event
    await logSecurityEvent({
      phoneUserId,
      email,
      phone,
      eventType: "account_unlocked",
      description: `Suspicious activity lockout manually unlocked: ${reason || "No reason provided"}`,
      severity: "medium",
      metadata: { unlockedBy, reason },
    });
  } catch (error) {
    console.error("[SessionActivityMonitor] Error unlocking account:", error);
  }
}

/**
 * Clean up old activity logs
 */
export async function cleanupOldActivityLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    await db
      .delete(sessionActivityLog)
      .where(lte(sessionActivityLog.createdAt, cutoffDate));
  } catch (error) {
    console.error("[SessionActivityMonitor] Error cleaning up old logs:", error);
  }
}

/**
 * Log security event
 */
async function logSecurityEvent(input: {
  phoneUserId?: number;
  userId?: number;
  email?: string;
  phone?: string;
  eventType: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(securityAuditLog).values({
      phoneUserId: input.phoneUserId,
      email: input.email,
      phone: input.phone,
      eventType: input.eventType as any,
      description: input.description,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      severity: (input.severity || "low") as any,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    });
  } catch (error) {
    console.error("[SessionActivityMonitor] Error logging security event:", error);
  }
}
