import { getDb } from "../db";
import {
  ipRateLimitLog,
  ipWhitelist,
  ipBlacklist,
  ipReputation,
  securityAuditLog,
} from "../../drizzle/schema";
import { eq, and, gte, lte, isNull, or } from "drizzle-orm";

/**
 * IP Rate Limiting Configuration
 */
export const IP_RATE_LIMIT_CONFIG = {
  // OTP verification: 10 attempts per 15 minutes
  OTP_VERIFICATION: { maxAttempts: 10, windowSeconds: 900 },
  // OTP request: 5 attempts per 10 minutes
  OTP_REQUEST: { maxAttempts: 5, windowSeconds: 600 },
  // Login attempts: 20 per hour
  LOGIN_ATTEMPT: { maxAttempts: 20, windowSeconds: 3600 },
  // Password reset: 5 per hour
  PASSWORD_RESET: { maxAttempts: 5, windowSeconds: 3600 },
  // Account unlock requests: 10 per day
  ACCOUNT_UNLOCK_REQUEST: { maxAttempts: 10, windowSeconds: 86400 },
  // Block duration after exceeding limit
  BLOCK_DURATION_MINUTES: 30,
};

/**
 * Check if IP is whitelisted
 */
export async function isIpWhitelisted(ipAddress: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const now = new Date();
    const result = await db
      .select()
      .from(ipWhitelist)
      .where(
        and(
          or(
            eq(ipWhitelist.ipAddress, ipAddress),
            // Check CIDR ranges if needed (simplified check)
            ipWhitelist.ipRange
          ),
          eq(ipWhitelist.isActive, "true"),
          or(isNull(ipWhitelist.expiresAt), gte(ipWhitelist.expiresAt, now))
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[IpRateLimiter] Error checking whitelist:", error);
    return false;
  }
}

/**
 * Check if IP is blacklisted
 */
export async function isIpBlacklisted(ipAddress: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const now = new Date();
    const result = await db
      .select()
      .from(ipBlacklist)
      .where(
        and(
          eq(ipBlacklist.ipAddress, ipAddress),
          or(
            eq(ipBlacklist.blockType, "permanent"),
            and(
              eq(ipBlacklist.blockType, "temporary"),
              gte(ipBlacklist.blockedUntil, now)
            )
          )
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[IpRateLimiter] Error checking blacklist:", error);
    return false;
  }
}

/**
 * Check if IP has exceeded rate limit for an endpoint
 */
export async function isIpRateLimited(
  ipAddress: string,
  endpoint: string,
  violationType: string
): Promise<{ limited: boolean; remainingSeconds?: number }> {
  try {
    // Check if IP is blacklisted first
    const isBlacklisted = await isIpBlacklisted(ipAddress);
    if (isBlacklisted) {
      return { limited: true, remainingSeconds: 3600 }; // 1 hour
    }

    // Check if IP is whitelisted
    const isWhitelisted = await isIpWhitelisted(ipAddress);
    if (isWhitelisted) {
      return { limited: false };
    }

    const db = await getDb();
    if (!db) return { limited: false };

    const configKey = violationType as keyof typeof IP_RATE_LIMIT_CONFIG;
    const config = IP_RATE_LIMIT_CONFIG[configKey];
    if (!config || typeof config === "number") {
      return { limited: false };
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    // Get existing rate limit log
    const result = await db
      .select()
      .from(ipRateLimitLog)
      .where(
        and(
          eq(ipRateLimitLog.ipAddress, ipAddress),
          eq(ipRateLimitLog.endpoint, endpoint),
          eq(ipRateLimitLog.violationType, violationType as any),
          gte(ipRateLimitLog.lastRequestAt, windowStart)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { limited: false };
    }

    const log = result[0];

    // Check if currently blocked
    if (log.isBlocked === "true" && log.blockedUntil) {
      const remaining = Math.max(0, log.blockedUntil.getTime() - now.getTime());
      if (remaining > 0) {
        return { limited: true, remainingSeconds: Math.ceil(remaining / 1000) };
      }
    }

    // Check if exceeded limit
    if (log.requestCount >= (config as any).maxAttempts) {
      return { limited: true, remainingSeconds: IP_RATE_LIMIT_CONFIG.BLOCK_DURATION_MINUTES * 60 };
    }

    return { limited: false };
  } catch (error) {
    console.error("[IpRateLimiter] Error checking rate limit:", error);
    return { limited: false };
  }
}

/**
 * Record an IP request
 */
export async function recordIpRequest(
  ipAddress: string,
  endpoint: string,
  violationType: string,
  userAgent?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const configKey = violationType as keyof typeof IP_RATE_LIMIT_CONFIG;
    const config = IP_RATE_LIMIT_CONFIG[configKey];
    if (!config || typeof config === "number") return;

    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    // Get existing log
    const existing = await db
      .select()
      .from(ipRateLimitLog)
      .where(
        and(
          eq(ipRateLimitLog.ipAddress, ipAddress),
          eq(ipRateLimitLog.endpoint, endpoint),
          eq(ipRateLimitLog.violationType, violationType as any),
          gte(ipRateLimitLog.lastRequestAt, windowStart)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing log
      const log = existing[0];
      const newCount = log.requestCount + 1;
      const shouldBlock = newCount >= (config as any).maxAttempts;

      await db
        .update(ipRateLimitLog)
        .set({
          requestCount: newCount,
          lastRequestAt: now,
          isBlocked: shouldBlock ? "true" : "false",
          blockedUntil: shouldBlock
            ? new Date(now.getTime() + IP_RATE_LIMIT_CONFIG.BLOCK_DURATION_MINUTES * 60 * 1000)
            : undefined,
          updatedAt: now,
        })
        .where(eq(ipRateLimitLog.id, log.id));

      // Log security event if blocked
      if (shouldBlock) {
        await logSecurityEvent({
          ipAddress,
          eventType: "rate_limit_exceeded",
          description: `IP rate limit exceeded for ${endpoint}: ${newCount} requests in ${config.windowSeconds}s`,
          severity: "high",
          metadata: {
            endpoint,
            violationType,
            requestCount: newCount,
            limit: config.maxAttempts,
          },
        });
      }
    } else {
      // Create new log
      await db.insert(ipRateLimitLog).values({
        ipAddress,
        endpoint,
        violationType: violationType as any,
        requestCount: 1,
        isBlocked: "false",
        userAgent,
        firstRequestAt: now,
        lastRequestAt: now,
      });
    }
  } catch (error) {
    console.error("[IpRateLimiter] Error recording request:", error);
  }
}

/**
 * Get IP reputation score
 */
export async function getIpReputation(ipAddress: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 50; // Default neutral score

    const result = await db
      .select()
      .from(ipReputation)
      .where(eq(ipReputation.ipAddress, ipAddress))
      .limit(1);

    if (result.length === 0) {
      return 50; // Default neutral score
    }

    return result[0].reputationScore;
  } catch (error) {
    console.error("[IpRateLimiter] Error getting reputation:", error);
    return 50;
  }
}

/**
 * Update IP reputation based on activity
 */
export async function updateIpReputation(
  ipAddress: string,
  failedAttempts: number = 0,
  successfulLogins: number = 0,
  suspiciousActivity: number = 0
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const existing = await db
      .select()
      .from(ipReputation)
      .where(eq(ipReputation.ipAddress, ipAddress))
      .limit(1);

    if (existing.length > 0) {
      const rep = existing[0];
      let newScore = rep.reputationScore;

      // Decrease score for failed attempts
      newScore -= failedAttempts * 5;
      // Increase score for successful logins
      newScore += successfulLogins * 2;
      // Decrease score for suspicious activity
      newScore -= suspiciousActivity * 10;

      // Clamp score between 0-100
      newScore = Math.max(0, Math.min(100, newScore));

      const isHighRisk = newScore < 30 ? "true" : "false";

      await db
        .update(ipReputation)
        .set({
          reputationScore: newScore,
          failedLoginAttempts: rep.failedLoginAttempts + failedAttempts,
          successfulLogins: rep.successfulLogins + successfulLogins,
          suspiciousActivityCount: rep.suspiciousActivityCount + suspiciousActivity,
          lastSuspiciousActivity:
            suspiciousActivity > 0 ? now : rep.lastSuspiciousActivity,
          isHighRisk,
          lastCheckedAt: now,
          updatedAt: now,
        })
        .where(eq(ipReputation.id, rep.id));
    } else {
      // Create new reputation record
      let initialScore = 50;
      initialScore -= failedAttempts * 5;
      initialScore += successfulLogins * 2;
      initialScore -= suspiciousActivity * 10;
      initialScore = Math.max(0, Math.min(100, initialScore));

      const isHighRisk = initialScore < 30 ? "true" : "false";

      await db.insert(ipReputation).values({
        ipAddress,
        reputationScore: initialScore,
        failedLoginAttempts: failedAttempts,
        successfulLogins: successfulLogins,
        suspiciousActivityCount: suspiciousActivity,
        lastSuspiciousActivity: suspiciousActivity > 0 ? now : undefined,
        isHighRisk,
        lastCheckedAt: now,
      });
    }
  } catch (error) {
    console.error("[IpRateLimiter] Error updating reputation:", error);
  }
}

/**
 * Add IP to whitelist
 */
export async function whitelistIp(
  ipAddress: string,
  reason: string,
  description?: string,
  expiresAt?: Date,
  addedBy?: number
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(ipWhitelist).values({
      ipAddress,
      reason: reason as any,
      description,
      expiresAt,
      addedBy,
      isActive: "true",
    });

    await logSecurityEvent({
      ipAddress,
      eventType: "ip_whitelisted",
      description: `IP whitelisted: ${reason}`,
      severity: "low",
      metadata: { reason, description, expiresAt },
    });
  } catch (error) {
    console.error("[IpRateLimiter] Error whitelisting IP:", error);
  }
}

/**
 * Add IP to blacklist
 */
export async function blacklistIp(
  ipAddress: string,
  reason: string,
  severity: "low" | "medium" | "high" | "critical" = "medium",
  blockType: "temporary" | "permanent" = "temporary",
  blockedUntil?: Date,
  notes?: string,
  addedBy?: number
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(ipBlacklist).values({
      ipAddress,
      reason: reason as any,
      severity,
      blockType,
      blockedUntil,
      notes,
      addedBy,
    });

    await logSecurityEvent({
      ipAddress,
      eventType: "ip_blacklisted",
      description: `IP blacklisted: ${reason}`,
      severity,
      metadata: { reason, blockType, blockedUntil, notes },
    });
  } catch (error) {
    console.error("[IpRateLimiter] Error blacklisting IP:", error);
  }
}

/**
 * Remove IP from whitelist
 */
export async function removeIpFromWhitelist(ipAddress: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.delete(ipWhitelist).where(eq(ipWhitelist.ipAddress, ipAddress));

    await logSecurityEvent({
      ipAddress,
      eventType: "ip_whitelist_removed",
      description: "IP removed from whitelist",
      severity: "low",
    });
  } catch (error) {
    console.error("[IpRateLimiter] Error removing from whitelist:", error);
  }
}

/**
 * Remove IP from blacklist
 */
export async function removeIpFromBlacklist(ipAddress: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.delete(ipBlacklist).where(eq(ipBlacklist.ipAddress, ipAddress));

    await logSecurityEvent({
      ipAddress,
      eventType: "ip_blacklist_removed",
      description: "IP removed from blacklist",
      severity: "low",
    });
  } catch (error) {
    console.error("[IpRateLimiter] Error removing from blacklist:", error);
  }
}

/**
 * Clean up old rate limit logs
 */
export async function cleanupOldRateLimitLogs(daysToKeep: number = 30): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    await db
      .delete(ipRateLimitLog)
      .where(lte(ipRateLimitLog.createdAt, cutoffDate));
  } catch (error) {
    console.error("[IpRateLimiter] Error cleaning up logs:", error);
  }
}

/**
 * Log security event
 */
async function logSecurityEvent(input: {
  ipAddress: string;
  eventType: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(securityAuditLog).values({
      ipAddress: input.ipAddress,
      eventType: input.eventType as any,
      description: input.description,
      severity: (input.severity || "low") as any,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    });
  } catch (error) {
    console.error("[IpRateLimiter] Error logging security event:", error);
  }
}
