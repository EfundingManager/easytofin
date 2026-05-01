import { getDb } from "./db";
import { applicationLogs } from "../drizzle/schema";
import { desc, eq, gte, and } from "drizzle-orm";
import type { ApplicationLog } from "../drizzle/schema";

/**
 * Get recent logs with optional filtering
 */
export async function getRecentLogs(
  limit: number = 100,
  level?: string,
  context?: string,
  hoursAgo: number = 24
): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const filters = [gte(applicationLogs.createdAt, cutoffTime)];
  if (level) {
    filters.push(eq(applicationLogs.level, level as any));
  }
  if (context) {
    filters.push(eq(applicationLogs.context, context));
  }

  return db
    .select()
    .from(applicationLogs)
    .where(and(...filters))
    .orderBy(desc(applicationLogs.createdAt))
    .limit(limit);
}

/**
 * Get error logs
 */
export async function getErrorLogs(limit: number = 50): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.level, "error"))
    .orderBy(desc(applicationLogs.createdAt))
    .limit(limit);
}

/**
 * Get logs for a specific user
 */
export async function getUserLogs(
  userId: number,
  limit: number = 50
): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.userId, userId))
    .orderBy(desc(applicationLogs.createdAt))
    .limit(limit);
}

/**
 * Get logs for a specific phone user
 */
export async function getPhoneUserLogs(
  phoneUserId: number,
  limit: number = 50
): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.phoneUserId, phoneUserId))
    .orderBy(desc(applicationLogs.createdAt))
    .limit(limit);
}

/**
 * Get logs by request ID (for tracing a single request)
 */
export async function getRequestLogs(requestId: string): Promise<ApplicationLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(applicationLogs)
    .where(eq(applicationLogs.requestId, requestId))
    .orderBy(desc(applicationLogs.createdAt));
}

/**
 * Get log statistics
 */
export async function getLogStatistics(hoursAgo: number = 24): Promise<{
  total: number;
  byLevel: Record<string, number>;
  byContext: Record<string, number>;
}> {
  const logs = await getRecentLogs(10000, undefined, undefined, hoursAgo);

  const byLevel: Record<string, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
  };

  const byContext: Record<string, number> = {};

  for (const log of logs) {
    byLevel[log.level]++;
    if (log.context) {
      byContext[log.context] = (byContext[log.context] || 0) + 1;
    }
  }

  return {
    total: logs.length,
    byLevel,
    byContext,
  };
}
