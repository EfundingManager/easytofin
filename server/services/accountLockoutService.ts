import { getDb } from "../db";
import { accountLockouts } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const FAILED_ATTEMPT_THRESHOLD = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const UNLOCK_TOKEN_EXPIRY_MINUTES = 60;

/**
 * Account Lockout Service
 * Manages progressive account lockout after failed login attempts
 */
export class AccountLockoutService {
  /**
   * Check if table exists before attempting queries
   */
  private static async tableExists(): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;
      await db.select().from(accountLockouts).limit(1);
      return true;
    } catch (err: any) {
      if (err.message?.includes("doesn't exist") || err.message?.includes("no such table")) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Record a failed login attempt and check if account should be locked
   */
  static async recordFailedAttempt(
    phoneUserId: number | null,
    email: string | null,
    phone: string | null,
    failureReason: string,
    ipAddress?: string
  ) {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        console.warn("[AccountLockout] Table not yet created, skipping lockout check");
        return {
          isLocked: false,
          remainingAttempts: FAILED_ATTEMPT_THRESHOLD,
          remainingMinutes: 0,
        };
      }

      // Get or create lockout record
      const whereConditions = [];
      if (phoneUserId) whereConditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
      if (email) whereConditions.push(eq(accountLockouts.email, email));
      if (phone) whereConditions.push(eq(accountLockouts.phone, phone));

      const lockoutRecords = await db
        .select()
        .from(accountLockouts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      let lockout = lockoutRecords.length > 0 ? lockoutRecords[0] : null;

      const now = new Date();
      let failedAttempts = (lockout?.failedAttempts || 0) + 1;
      let isLocked = false;
      let lockedUntil = null;

      // Check if lockout period has expired
      if (lockout?.isLocked === "true" && lockout.lockedUntil) {
        if (now > lockout.lockedUntil) {
          // Lockout expired, reset counter
          failedAttempts = 1;
          isLocked = false;
          lockedUntil = null;
        } else {
          // Still locked
          isLocked = true;
          lockedUntil = lockout.lockedUntil;
        }
      } else if (failedAttempts >= FAILED_ATTEMPT_THRESHOLD) {
        // Lock account
        isLocked = true;
        lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }

      // Update or create lockout record
      if (lockout) {
        await db
          .update(accountLockouts)
          .set({
            failedAttempts,
            isLocked: isLocked ? "true" : "false",
            lockedUntil,
            lastFailedAttempt: now,
            lastFailureReason: failureReason,
            updatedAt: now,
          })
          .where(eq(accountLockouts.id, lockout.id));
      } else {
        await db.insert(accountLockouts).values({
          phoneUserId: phoneUserId || undefined,
          email: email || undefined,
          phone: phone || undefined,
          failedAttempts,
          isLocked: isLocked ? "true" : "false",
          lockedUntil,
          lastFailedAttempt: now,
          lastFailureReason: failureReason,
        });
      }

      return {
        isLocked,
        failedAttempts,
        lockedUntil,
        remainingAttempts: Math.max(0, FAILED_ATTEMPT_THRESHOLD - failedAttempts),
      };
    } catch (error) {
      console.error("[AccountLockout] Error recording failed attempt:", error);
      // Return safe defaults without exposing database errors
      return {
        isLocked: false,
        failedAttempts: 1,
        lockedUntil: null,
        remainingAttempts: FAILED_ATTEMPT_THRESHOLD - 1,
      };
    }
  }

  /**
   * Check if account is currently locked
   */
  static async isAccountLocked(
    phoneUserId: number | null,
    email: string | null,
    phone: string | null
  ): Promise<{ isLocked: boolean; lockedUntil?: Date; remainingMinutes?: number }> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        console.warn("[AccountLockout] Table not yet created, skipping lockout check");
        return { isLocked: false };
      }

      const whereConditions = [];
      if (phoneUserId) whereConditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
      if (email) whereConditions.push(eq(accountLockouts.email, email));
      if (phone) whereConditions.push(eq(accountLockouts.phone, phone));

      const lockoutRecords = await db
        .select()
        .from(accountLockouts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const lockout = lockoutRecords.length > 0 ? lockoutRecords[0] : null;

      if (!lockout || lockout.isLocked !== "true") {
        return { isLocked: false };
      }

      const now = new Date();
      if (lockout.lockedUntil && now > lockout.lockedUntil) {
        // Lockout expired, unlock account
        await db
          .update(accountLockouts)
          .set({
            isLocked: "false",
            failedAttempts: 0,
            updatedAt: now,
          })
          .where(eq(accountLockouts.id, lockout.id));

        return { isLocked: false };
      }

      const remainingMs = lockout.lockedUntil
        ? lockout.lockedUntil.getTime() - now.getTime()
        : 0;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      return {
        isLocked: true,
        lockedUntil: lockout.lockedUntil || undefined,
        remainingMinutes: Math.max(0, remainingMinutes),
      };
    } catch (error) {
      console.error("[AccountLockout] Error checking account lock status:", error);
      // Return safe defaults without exposing database errors
      return { isLocked: false };
    }
  }

  /**
   * Record successful login and reset failed attempts
   */
  static async recordSuccessfulLogin(
    phoneUserId: number | null,
    email: string | null,
    phone: string | null
  ) {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        return;
      }

      const whereConditions = [];
      if (phoneUserId) whereConditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
      if (email) whereConditions.push(eq(accountLockouts.email, email));
      if (phone) whereConditions.push(eq(accountLockouts.phone, phone));

      const lockoutRecords = await db
        .select()
        .from(accountLockouts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const lockout = lockoutRecords.length > 0 ? lockoutRecords[0] : null;

      if (lockout) {
        await db
          .update(accountLockouts)
          .set({
            failedAttempts: 0,
            isLocked: "false",
            updatedAt: new Date(),
          })
          .where(eq(accountLockouts.id, lockout.id));
      }
    } catch (error) {
      console.error("[AccountLockout] Error recording successful login:", error);
      // Don't throw - allow login to proceed even if we can't record success
    }
  }

  /**
   * Generate unlock token for email/SMS verification
   */
  static async generateUnlockToken(
    phoneUserId: number | null,
    email: string | null,
    phone: string | null,
    unlockMethod: "email_verification" | "sms_verification"
  ): Promise<string> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        throw new Error("Account lockout table not yet created");
      }

      const whereConditions = [];
      if (phoneUserId) whereConditions.push(eq(accountLockouts.phoneUserId, phoneUserId));
      if (email) whereConditions.push(eq(accountLockouts.email, email));
      if (phone) whereConditions.push(eq(accountLockouts.phone, phone));

      const lockoutRecords = await db
        .select()
        .from(accountLockouts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const lockout = lockoutRecords.length > 0 ? lockoutRecords[0] : null;

      if (!lockout) {
        throw new Error("Account lockout record not found");
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(
        Date.now() + UNLOCK_TOKEN_EXPIRY_MINUTES * 60 * 1000
      );

      await db
        .update(accountLockouts)
        .set({
          unlockMethod,
          unlockToken: token,
          unlockTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(accountLockouts.id, lockout.id));

      return token;
    } catch (error) {
      console.error("[AccountLockout] Error generating unlock token:", error);
      throw error;
    }
  }

  /**
   * Verify unlock token and unlock account
   */
  static async verifyUnlockToken(token: string): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        return false;
      }

      const lockoutRecords = await db
        .select()
        .from(accountLockouts)
        .where(eq(accountLockouts.unlockToken, token));

      const lockout = lockoutRecords.length > 0 ? lockoutRecords[0] : null;

      if (!lockout) {
        return false;
      }

      const now = new Date();
      if (!lockout.unlockTokenExpiresAt || now > lockout.unlockTokenExpiresAt) {
        return false;
      }

      // Unlock account
      await db
        .update(accountLockouts)
        .set({
          isLocked: "false",
          failedAttempts: 0,
          unlockToken: null,
          unlockTokenExpiresAt: null,
          updatedAt: now,
        })
        .where(eq(accountLockouts.id, lockout.id));

      return true;
    } catch (error) {
      console.error("[AccountLockout] Error verifying unlock token:", error);
      throw error;
    }
  }

  /**
   * Get lockout statistics for monitoring
   */
  static async getLockoutStats(): Promise<{
    totalLocked: number;
    totalFailedAttempts: number;
    recentLockouts: number;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if table exists
      const tableOk = await this.tableExists();
      if (!tableOk) {
        return {
          totalLocked: 0,
          totalFailedAttempts: 0,
          recentLockouts: 0,
        };
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const locked = await db
        .select()
        .from(accountLockouts)
        .where(eq(accountLockouts.isLocked, "true"));

      const recent = await db
        .select()
        .from(accountLockouts)
        .where(
          and(
            eq(accountLockouts.isLocked, "true"),
            gt(accountLockouts.updatedAt, oneHourAgo)
          )
        );

      const totalFailedAttempts = locked.reduce(
        (sum: number, l: any) => sum + (l.failedAttempts || 0),
        0
      );

      return {
        totalLocked: locked.length,
        totalFailedAttempts,
        recentLockouts: recent.length,
      };
    } catch (error) {
      console.error("[AccountLockout] Error getting lockout stats:", error);
      return {
        totalLocked: 0,
        totalFailedAttempts: 0,
        recentLockouts: 0,
      };
    }
  }
}
