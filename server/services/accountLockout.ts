import { getDb } from "../db";
import { loginAttempts, accountLockouts, securityAuditLog } from "../../drizzle/schema";
import { eq, and, gt, gte } from "drizzle-orm";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export interface LoginAttemptInput {
  phoneUserId?: number;
  email?: string;
  phone?: string;
  attemptType: "otp" | "password" | "google";
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}

export interface AuditLogInput {
  phoneUserId?: number;
  email?: string;
  phone?: string;
  eventType: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
}

/**
 * Record a login attempt in the database
 */
export async function recordLoginAttempt(input: LoginAttemptInput): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.insert(loginAttempts).values({
      phoneUserId: input.phoneUserId,
      email: input.email,
      phone: input.phone,
      attemptType: input.attemptType,
      success: input.success ? "true" : "false",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      failureReason: input.failureReason,
    });
  } catch (error) {
    console.error("[AccountLockout] Error recording login attempt:", error);
  }
}

/**
 * Get the number of failed login attempts for an account in the last hour
 */
export async function getFailedAttemptCount(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const conditions = [];
    if (phoneUserId) {
      conditions.push(eq(loginAttempts.phoneUserId, phoneUserId));
    } else if (email) {
      conditions.push(eq(loginAttempts.email, email));
    } else if (phone) {
      conditions.push(eq(loginAttempts.phone, phone));
    }

    conditions.push(eq(loginAttempts.success, "false"));
    conditions.push(gte(loginAttempts.createdAt, oneHourAgo));

    const result = await db
      .select()
      .from(loginAttempts)
      .where(and(...conditions));

    return result.length;
  } catch (error) {
    console.error("[AccountLockout] Error getting failed attempt count:", error);
    return 0;
  }
}

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const conditions = [];
    if (phoneUserId) {
      conditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
    } else if (email) {
      conditions.push(eq(accountLockouts.email, email));
    } else if (phone) {
      conditions.push(eq(accountLockouts.phone, phone));
    }

    conditions.push(gt(accountLockouts.lockedUntil, new Date()));

    const result = await db
      .select()
      .from(accountLockouts)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[AccountLockout] Error checking account lock status:", error);
    return false;
  }
}

/**
 * Get the current lockout details for an account
 */
export async function getLockoutDetails(
  phoneUserId?: number,
  email?: string,
  phone?: string
): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const conditions = [];
    if (phoneUserId) {
      conditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
    } else if (email) {
      conditions.push(eq(accountLockouts.email, email));
    } else if (phone) {
      conditions.push(eq(accountLockouts.phone, phone));
    }

    conditions.push(gt(accountLockouts.lockedUntil, new Date()));

    const result = await db
      .select()
      .from(accountLockouts)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[AccountLockout] Error getting lockout details:", error);
    return null;
  }
}

/**
 * Lock an account after max failed attempts
 */
export async function lockAccount(
  phoneUserId: number | undefined,
  email: string | undefined,
  phone: string | undefined,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

    await db.insert(accountLockouts).values({
      phoneUserId,
      email,
      phone,
      failedAttempts: MAX_FAILED_ATTEMPTS,
      lockedUntil,
      lockReason: "max_failed_attempts",
    });

    // Log the lockout event
    await logSecurityEvent({
      phoneUserId,
      email,
      phone,
      eventType: "account_locked",
      description: `Account locked after ${MAX_FAILED_ATTEMPTS} failed login attempts`,
      ipAddress,
      userAgent,
      severity: "high",
      metadata: {
        lockDurationMinutes: 60,
        lockedUntil: lockedUntil.toISOString(),
      },
    });
  } catch (error) {
    console.error("[AccountLockout] Error locking account:", error);
  }
}

/**
 * Unlock an account (admin action)
 */
export async function unlockAccount(
  phoneUserId: number | undefined,
  email: string | undefined,
  phone: string | undefined,
  unlockedBy: string = "auto"
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const conditions = [];
    if (phoneUserId) {
      conditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
    } else if (email) {
      conditions.push(eq(accountLockouts.email, email));
    } else if (phone) {
      conditions.push(eq(accountLockouts.phone, phone));
    }

    conditions.push(gt(accountLockouts.lockedUntil, new Date()));

    await db
      .update(accountLockouts)
      .set({
        unlockedBy,
        unlockedAt: new Date(),
      })
      .where(and(...conditions));

    // Log the unlock event
    await logSecurityEvent({
      phoneUserId,
      email,
      phone,
      eventType: "account_unlocked",
      description: `Account unlocked by ${unlockedBy}`,
      severity: "medium",
    });
  } catch (error) {
    console.error("[AccountLockout] Error unlocking account:", error);
  }
}

/**
 * Check if account should be locked and lock if necessary
 */
export async function checkAndLockAccount(
  phoneUserId: number | undefined,
  email: string | undefined,
  phone: string | undefined,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const failedAttempts = await getFailedAttemptCount(phoneUserId, email, phone);

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const isLocked = await isAccountLocked(phoneUserId, email, phone);
      if (!isLocked) {
        await lockAccount(phoneUserId, email, phone, ipAddress, userAgent);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("[AccountLockout] Error checking and locking account:", error);
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
    const lockout = await getLockoutDetails(phoneUserId, email, phone);
    if (!lockout) return 0;

    const now = Date.now();
    const lockedUntil = new Date(lockout.lockedUntil).getTime();
    const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

    return remaining;
  } catch (error) {
    console.error("[AccountLockout] Error getting remaining lockout time:", error);
    return 0;
  }
}

/**
 * Log a security event
 */
export async function logSecurityEvent(input: AuditLogInput): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.insert(securityAuditLog).values({
      phoneUserId: input.phoneUserId,
      email: input.email,
      phone: input.phone,
      eventType: input.eventType as any,
      description: input.description,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      severity: (input.severity || "low") as any,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    });
  } catch (error) {
    console.error("[SecurityAuditLog] Error logging security event:", error);
  }
}

/**
 * Clear old login attempts (cleanup job)
 */
export async function clearOldLoginAttempts(olderThanHours: number = 24): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    // Note: This would require a delete operation, which may not be available in basic drizzle setup
    console.log(`[AccountLockout] Would clear login attempts older than ${cutoffTime.toISOString()}`);
  } catch (error) {
    console.error("[AccountLockout] Error clearing old login attempts:", error);
  }
}
