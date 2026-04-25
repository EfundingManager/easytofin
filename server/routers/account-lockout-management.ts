import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  suspiciousActivityLockout,
  loginAttempts,
  sessionActivityLog,
  securityAuditLog,
  phoneUsers,
} from "../../drizzle/schema";
import { eq, and, gte, lte, isNull, desc, sql } from "drizzle-orm";
import { getSuspiciousActivityLockoutDetails, unlockSuspiciousActivityLockout } from "../services/sessionActivityMonitor";

export const accountLockoutManagementRouter = router({
  /**
   * Get list of locked accounts with pagination
   */
  getLockedAccounts: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        filterByStatus: z.enum(["active", "expired"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { accounts: [], total: 0 };

        const now = new Date();
        const offset = (input.page - 1) * input.pageSize;
        const conditions: any[] = [];

        if (input.filterByStatus === "active") {
          conditions.push(
            and(
              gte(suspiciousActivityLockout.unlocksAt, now),
              isNull(suspiciousActivityLockout.unlockedAt)
            )
          );
        } else if (input.filterByStatus === "expired") {
          conditions.push(
            and(
              lte(suspiciousActivityLockout.unlocksAt, now),
              isNull(suspiciousActivityLockout.unlockedAt)
            )
          );
        }

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(suspiciousActivityLockout)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = countResult[0]?.count || 0;

        const results = await db
          .select()
          .from(suspiciousActivityLockout)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(suspiciousActivityLockout.lockedAt))
          .limit(input.pageSize)
          .offset(offset);

        const enrichedResults = await Promise.all(
          results.map(async (lockout) => {
            let userInfo = null;
            if (lockout.phoneUserId) {
              const user = await db
                .select()
                .from(phoneUsers)
                .where(eq(phoneUsers.id, lockout.phoneUserId))
                .limit(1);
              userInfo = user[0];
            }

            return {
              ...lockout,
              userInfo,
              isActive: lockout.unlocksAt > now && !lockout.unlockedAt,
              remainingSeconds: Math.max(
                0,
                Math.ceil((lockout.unlocksAt.getTime() - now.getTime()) / 1000)
              ),
            };
          })
        );

        return { accounts: enrichedResults, total };
      } catch (error) {
        console.error("[AccountLockoutManagement] Error getting locked accounts:", error);
        return { accounts: [], total: 0 };
      }
    }),

  /**
   * Get activity pattern for a locked account
   */
  getActivityPattern: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        hoursBack: z.number().int().positive().max(720).default(24),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { activities: [], summary: null };

        const cutoffTime = new Date(Date.now() - input.hoursBack * 60 * 60 * 1000);

        const activities = await db
          .select()
          .from(sessionActivityLog)
          .where(
            and(
              input.phoneUserId ? eq(sessionActivityLog.phoneUserId, input.phoneUserId) : undefined,
              input.email ? eq(sessionActivityLog.email, input.email) : undefined,
              input.phone ? eq(sessionActivityLog.phone, input.phone) : undefined,
              gte(sessionActivityLog.createdAt, cutoffTime)
            )
          )
          .orderBy(desc(sessionActivityLog.createdAt))
          .limit(500);

        const loginAttemptRecords = await db
          .select()
          .from(loginAttempts)
          .where(
            and(
              input.phoneUserId ? eq(loginAttempts.phoneUserId, input.phoneUserId) : undefined,
              input.email ? eq(loginAttempts.email, input.email) : undefined,
              input.phone ? eq(loginAttempts.phone, input.phone) : undefined,
              gte(loginAttempts.createdAt, cutoffTime)
            )
          )
          .orderBy(desc(loginAttempts.createdAt))
          .limit(500);

        const loginCount = loginAttemptRecords.length;
        const logoutCount = activities.filter((a) => a.activityType === "logout").length;
        const failedAttempts = loginAttemptRecords.filter((a) => !a.success).length;
        const successfulLogins = loginAttemptRecords.filter((a) => a.success).length;

        const summary = {
          totalActivities: activities.length + loginAttemptRecords.length,
          loginAttempts: loginCount,
          logoutCount,
          failedAttempts,
          successfulLogins,
          suspiciousPattern: loginCount + logoutCount > 5 && input.hoursBack <= 2,
        };

        return { activities, loginAttempts: loginAttemptRecords, summary };
      } catch (error) {
        console.error("[AccountLockoutManagement] Error getting activity pattern:", error);
        return { activities: [], loginAttempts: [], summary: null };
      }
    }),

  /**
   * Get lockout details for an account
   */
  getLockoutDetails: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const details = await getSuspiciousActivityLockoutDetails(
          input.phoneUserId,
          input.email,
          input.phone
        );
        return details;
      } catch (error) {
        console.error("[AccountLockoutManagement] Error getting lockout details:", error);
        return { locked: false };
      }
    }),

  /**
   * Manually unlock an account
   */
  unlockAccount: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        reason: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false, error: "Database connection failed" };

        await unlockSuspiciousActivityLockout(
          input.phoneUserId,
          input.email,
          input.phone,
          ctx.user?.id?.toString(),
          input.reason
        );

        await db.insert(securityAuditLog).values({
          email: input.email,
          phone: input.phone,
          eventType: "account_unlocked" as any,
          description: `Account manually unlocked by admin: ${input.reason}`,
          severity: "medium" as any,
          metadata: JSON.stringify({
            unlockedBy: ctx.user?.id,
            reason: input.reason,
            timestamp: new Date().toISOString(),
          }),
        });

        return { success: true };
      } catch (error) {
        console.error("[AccountLockoutManagement] Error unlocking account:", error);
        return { success: false, error: "Failed to unlock account" };
      }
    }),

  /**
   * Get security audit log
   */
  getAuditLog: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        daysBack: z.number().int().positive().max(365).default(30),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { logs: [], total: 0 };

        const cutoffDate = new Date(Date.now() - input.daysBack * 24 * 60 * 60 * 1000);
        const offset = (input.page - 1) * input.pageSize;

        const conditions: any[] = [];
        if (input.phoneUserId) {
          conditions.push(eq(securityAuditLog.phoneUserId, input.phoneUserId));
        }
        if (input.email) {
          conditions.push(eq(securityAuditLog.email, input.email));
        }
        if (input.phone) {
          conditions.push(eq(securityAuditLog.phone, input.phone));
        }
        conditions.push(gte(securityAuditLog.createdAt, cutoffDate));

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(securityAuditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = countResult[0]?.count || 0;

        const logs = await db
          .select()
          .from(securityAuditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(securityAuditLog.createdAt))
          .limit(input.pageSize)
          .offset(offset);

        return { logs, total };
      } catch (error) {
        console.error("[AccountLockoutManagement] Error getting audit log:", error);
        return { logs: [], total: 0 };
      }
    }),

  /**
   * Get lockout statistics
   */
  getStatistics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { stats: null };

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const activeLockouts = await db
        .select({ count: sql<number>`count(*)` })
        .from(suspiciousActivityLockout)
        .where(
          and(
            gte(suspiciousActivityLockout.unlocksAt, now),
            isNull(suspiciousActivityLockout.unlockedAt)
          )
        );

      const lockoutsLast24h = await db
        .select({ count: sql<number>`count(*)` })
        .from(suspiciousActivityLockout)
        .where(gte(suspiciousActivityLockout.lockedAt, last24Hours));

      return {
        stats: {
          activeLockouts: activeLockouts[0]?.count || 0,
          lockoutsLast24h: lockoutsLast24h[0]?.count || 0,
        },
      };
    } catch (error) {
      console.error("[AccountLockoutManagement] Error getting statistics:", error);
      return { stats: null };
    }
  }),
});
