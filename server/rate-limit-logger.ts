import { getDb } from "./db";
import { rateLimitLogs, InsertRateLimitLog } from "../drizzle/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

/**
 * Log a rate limit violation
 */
export async function logRateLimitViolation(
  identifier: string,
  identifierType: "phone" | "email",
  violationType: "send_otp" | "verify_otp",
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return;
  }

  try {
    // Check if there's an existing unresolved violation for this identifier
    const existingViolation = await db
      .select()
      .from(rateLimitLogs)
      .where(
        and(
          eq(rateLimitLogs.identifier, identifier),
          eq(rateLimitLogs.identifierType, identifierType),
          eq(rateLimitLogs.violationType, violationType),
          isNull(rateLimitLogs.resolvedAt)
        )
      )
      .limit(1);

    if (existingViolation.length > 0) {
      // Update existing violation
      await db
        .update(rateLimitLogs)
        .set({
          attemptCount: existingViolation[0].attemptCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(rateLimitLogs.id, existingViolation[0].id));
    } else {
      // Create new violation log
      await db.insert(rateLimitLogs).values({
        identifier,
        identifierType,
        violationType,
        attemptCount: 1,
        ipAddress,
        userAgent,
        isWhitelisted: "false",
      });
    }
  } catch (error) {
    console.error("[RateLimitLogger] Failed to log violation:", error);
  }
}

/**
 * Get rate limit violations with optional filtering
 */
export async function getRateLimitViolations(options?: {
  identifier?: string;
  identifierType?: "phone" | "email";
  violationType?: "send_otp" | "verify_otp";
  resolved?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "attemptCount";
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return [];
  }

  try {
    let query = db.select().from(rateLimitLogs);

    // Build where clause
    const conditions = [];

    if (options?.identifier) {
      conditions.push(eq(rateLimitLogs.identifier, options.identifier));
    }

    if (options?.identifierType) {
      conditions.push(eq(rateLimitLogs.identifierType, options.identifierType));
    }

    if (options?.violationType) {
      conditions.push(eq(rateLimitLogs.violationType, options.violationType));
    }

    if (options?.resolved !== undefined) {
      if (!options.resolved) {
        // Unresolved violations
        conditions.push(isNull(rateLimitLogs.resolvedAt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Sort
    const sortBy = options?.sortBy || "createdAt";
    if (sortBy === "createdAt") {
      query = query.orderBy(desc(rateLimitLogs.createdAt)) as any;
    } else if (sortBy === "attemptCount") {
      query = query.orderBy(desc(rateLimitLogs.attemptCount)) as any;
    }

    // Pagination
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    query = query.limit(limit).offset(offset) as any;

    return await query;
  } catch (error) {
    console.error("[RateLimitLogger] Failed to get violations:", error);
    return [];
  }
}

/**
 * Get violation count for a specific identifier
 */
export async function getViolationCount(
  identifier: string,
  identifierType: "phone" | "email"
): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return 0;
  }

  try {
    const result = await db
      .select()
      .from(rateLimitLogs)
      .where(
        and(
          eq(rateLimitLogs.identifier, identifier),
          eq(rateLimitLogs.identifierType, identifierType),
          isNull(rateLimitLogs.resolvedAt)
        )
      );

    return result.length;
  } catch (error) {
    console.error("[RateLimitLogger] Failed to get violation count:", error);
    return 0;
  }
}

/**
 * Whitelist an identifier to exclude from rate limiting
 */
export async function whitelistIdentifier(
  identifier: string,
  identifierType: "phone" | "email",
  adminId: number,
  notes?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return false;
  }

  try {
    await db
      .update(rateLimitLogs)
      .set({
        isWhitelisted: "true",
        resolvedAt: new Date(),
        resolvedBy: adminId,
        notes: notes || "Whitelisted by admin",
      })
      .where(
        and(
          eq(rateLimitLogs.identifier, identifier),
          eq(rateLimitLogs.identifierType, identifierType)
        )
      );

    return true;
  } catch (error) {
    console.error("[RateLimitLogger] Failed to whitelist identifier:", error);
    return false;
  }
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(
  identifier: string,
  identifierType: "phone" | "email",
  adminId: number,
  notes?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return false;
  }

  try {
    await db
      .update(rateLimitLogs)
      .set({
        resolvedAt: new Date(),
        resolvedBy: adminId,
        notes: notes || "Rate limit reset by admin",
      })
      .where(
        and(
          eq(rateLimitLogs.identifier, identifier),
          eq(rateLimitLogs.identifierType, identifierType),
          isNull(rateLimitLogs.resolvedAt)
        )
      );

    return true;
  } catch (error) {
    console.error("[RateLimitLogger] Failed to reset rate limit:", error);
    return false;
  }
}

/**
 * Get statistics for rate limit violations
 */
export async function getRateLimitStats(): Promise<{
  totalViolations: number;
  unresolvedViolations: number;
  whitelistedCount: number;
  topViolators: Array<{ identifier: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[RateLimitLogger] Database not available");
    return {
      totalViolations: 0,
      unresolvedViolations: 0,
      whitelistedCount: 0,
      topViolators: [],
    };
  }

  try {
    const allViolations = await db.select().from(rateLimitLogs);
    const unresolvedViolations = allViolations.filter((v) => !v.resolvedAt);
    const whitelistedViolations = allViolations.filter(
      (v) => v.isWhitelisted === "true"
    );

    // Group by identifier to find top violators
    const violatorMap = new Map<string, number>();
    unresolvedViolations.forEach((v) => {
      const count = violatorMap.get(v.identifier) || 0;
      violatorMap.set(v.identifier, count + v.attemptCount);
    });

    const topViolators = Array.from(violatorMap.entries())
      .map(([identifier, count]) => ({ identifier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalViolations: allViolations.length,
      unresolvedViolations: unresolvedViolations.length,
      whitelistedCount: whitelistedViolations.length,
      topViolators,
    };
  } catch (error) {
    console.error("[RateLimitLogger] Failed to get stats:", error);
    return {
      totalViolations: 0,
      unresolvedViolations: 0,
      whitelistedCount: 0,
      topViolators: [],
    };
  }
}
