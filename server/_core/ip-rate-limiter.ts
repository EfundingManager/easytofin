/**
 * IP-Based Rate Limiter Service
 * Implements IP-based login rate limiting with:
 * - Maximum 2 successful login switches per IP per hour
 * - 4-hour blocking after exceeding limit
 * - Handles proxy headers (X-Forwarded-For)
 */

import { getDb } from '../db';
import { ipLoginSwitches, ipRateLimitLog } from '../../drizzle/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export interface IpRateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Seconds until retry is allowed
  blockedUntil?: Date;
}

export interface LoginSwitchCheckResult {
  allowed: boolean;
  switchCount: number;
  windowEndAt: Date;
  blockedUntil?: Date;
}

/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, CF-Connecting-IP, etc.)
 */
export function extractIpAddress(req: any): string {
  // Check for proxy headers first
  const xForwardedFor = req.headers?.['x-forwarded-for'];
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = xForwardedFor.split(',').map((ip: string) => ip.trim());
    return ips[0];
  }

  // Check other common proxy headers
  const cfConnectingIp = req.headers?.['cf-connecting-ip'];
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = req.headers?.['x-real-ip'];
  if (xRealIp) return xRealIp;

  // Fallback to direct connection IP
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Normalize IPv6 addresses to prevent bypass
 */
export function normalizeIpAddress(ip: string): string {
  // Remove IPv6 prefix if present (::ffff:)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  // Remove localhost variations
  if (ip === '::1' || ip === '127.0.0.1') {
    return 'localhost';
  }
  return ip;
}

/**
 * Check if IP is currently blocked from login attempts
 */
export async function checkIpRateLimit(ipAddress: string): Promise<IpRateLimitCheckResult> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[IP Rate Limiter] Database connection failed');
      return { allowed: true }; // Fail open to avoid blocking legitimate users
    }

    const normalizedIp = normalizeIpAddress(ipAddress);
    const now = new Date();

    // Check if IP is currently blocked
    const blockedRecord = await db
      .select()
      .from(ipRateLimitLog)
      .where(
        and(
          eq(ipRateLimitLog.ipAddress, normalizedIp),
          eq(ipRateLimitLog.isBlocked, 'true'),
          gt(ipRateLimitLog.blockedUntil, now)
        )
      )
      .limit(1);

    if (blockedRecord.length > 0) {
      const record = blockedRecord[0];
      const retryAfter = record.blockedUntil
        ? Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000)
        : 14400; // 4 hours default

      return {
        allowed: false,
        reason: 'IP is temporarily blocked due to too many login attempts',
        retryAfter,
        blockedUntil: record.blockedUntil || undefined,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('[IP Rate Limiter] Error checking rate limit:', error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Track login switch per IP
 * Returns whether the switch is allowed and current switch count
 */
export async function trackLoginSwitch(
  ipAddress: string,
  currentPhoneUserId: number,
  previousPhoneUserId?: number
): Promise<LoginSwitchCheckResult> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[IP Rate Limiter] Database connection failed');
      return {
        allowed: true,
        switchCount: 0,
        windowEndAt: new Date(Date.now() + 3600000),
      };
    }

    const normalizedIp = normalizeIpAddress(ipAddress);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour window
    const fourHoursFromNow = new Date(now.getTime() + 14400000); // 4 hour block

    // Get existing switch records within the 1-hour window
    const existingRecords = await db
      .select()
      .from(ipLoginSwitches)
      .where(
        and(
          eq(ipLoginSwitches.ipAddress, normalizedIp),
          gt(ipLoginSwitches.windowEndAt, now)
        )
      );

    // Check if IP is already blocked
    const blockedRecord = existingRecords.find(r => r.isBlocked === 'true');
    if (blockedRecord && blockedRecord.blockedUntil && blockedRecord.blockedUntil > now) {
      return {
        allowed: false,
        switchCount: blockedRecord.switchCount,
        windowEndAt: blockedRecord.windowEndAt,
        blockedUntil: blockedRecord.blockedUntil,
      };
    }

    // Count unique user switches in the window
    const uniqueUsers = new Set(existingRecords.map(r => r.phoneUserId));
    const switchCount = uniqueUsers.size + 1; // +1 for current login

    // Check if exceeding limit (max 2 different users per hour)
    if (switchCount > 2) {
      // Block this IP for 4 hours
      await db.insert(ipLoginSwitches).values({
        ipAddress: normalizedIp,
        phoneUserId: currentPhoneUserId,
        previousPhoneUserId,
        switchCount,
        isBlocked: 'true',
        blockedUntil: fourHoursFromNow,
        blockReason: 'Exceeded maximum login switches per hour (max 2)',
        windowStartAt: now,
        windowEndAt: new Date(now.getTime() + 3600000),
      });

      // Also update ipRateLimitLog for consistency
      await db.insert(ipRateLimitLog).values({
        ipAddress: normalizedIp,
        endpoint: '/api/trpc/auth.verifyOtp',
        requestCount: switchCount,
        violationType: 'login_attempt',
        isBlocked: 'true',
        blockedUntil: fourHoursFromNow,
        firstRequestAt: now,
        lastRequestAt: now,
      });

      return {
        allowed: false,
        switchCount,
        windowEndAt: new Date(now.getTime() + 3600000),
        blockedUntil: fourHoursFromNow,
      };
    }

    // Log the switch
    if (existingRecords.length === 0) {
      // First switch in this window
      await db.insert(ipLoginSwitches).values({
        ipAddress: normalizedIp,
        phoneUserId: currentPhoneUserId,
        previousPhoneUserId,
        switchCount: 1,
        isBlocked: 'false',
        windowStartAt: now,
        windowEndAt: new Date(now.getTime() + 3600000),
      });
    } else {
      // Update existing record
      const latestRecord = existingRecords[existingRecords.length - 1];
      await db
        .update(ipLoginSwitches)
        .set({
          phoneUserId: currentPhoneUserId,
          previousPhoneUserId,
          switchCount,
          updatedAt: now,
        })
        .where(eq(ipLoginSwitches.id, latestRecord.id));
    }

    return {
      allowed: true,
      switchCount,
      windowEndAt: new Date(now.getTime() + 3600000),
    };
  } catch (error) {
    console.error('[IP Rate Limiter] Error tracking login switch:', error);
    return {
      allowed: true,
      switchCount: 0,
      windowEndAt: new Date(Date.now() + 3600000),
    };
  }
}

/**
 * Unblock an IP address (admin operation)
 */
export async function unblockIp(
  ipAddress: string,
  reason: string = 'Manual unblock by admin'
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const normalizedIp = normalizeIpAddress(ipAddress);
    const now = new Date();

    // Update ipLoginSwitches
    await db
      .update(ipLoginSwitches)
      .set({
        isBlocked: 'false',
        blockReason: reason,
        updatedAt: now,
      })
      .where(
        and(
          eq(ipLoginSwitches.ipAddress, normalizedIp),
          eq(ipLoginSwitches.isBlocked, 'true')
        )
      );

    // Update ipRateLimitLog
    await db
      .update(ipRateLimitLog)
      .set({
        isBlocked: 'false',
        updatedAt: now,
      })
      .where(
        and(
          eq(ipRateLimitLog.ipAddress, normalizedIp),
          eq(ipRateLimitLog.isBlocked, 'true')
        )
      );

    return true;
  } catch (error) {
    console.error('[IP Rate Limiter] Error unblocking IP:', error);
    return false;
  }
}

/**
 * Get IP reputation and statistics
 */
export async function getIpStats(ipAddress: string) {
  try {
    const db = await getDb();
    if (!db) return null;

    const normalizedIp = normalizeIpAddress(ipAddress);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 86400000);

    const records = await db
      .select()
      .from(ipLoginSwitches)
      .where(
        and(
          eq(ipLoginSwitches.ipAddress, normalizedIp),
          gt(ipLoginSwitches.createdAt, twentyFourHoursAgo)
        )
      );

    const blockedRecords = records.filter(r => r.isBlocked === 'true');
    const activeRecords = records.filter(r => r.isBlocked === 'false');

    return {
      ipAddress: normalizedIp,
      totalAttempts: records.length,
      blockedCount: blockedRecords.length,
      activeCount: activeRecords.length,
      isCurrentlyBlocked: blockedRecords.some(r => r.blockedUntil && r.blockedUntil > now),
      lastAttempt: records[records.length - 1]?.createdAt || null,
    };
  } catch (error) {
    console.error('[IP Rate Limiter] Error getting IP stats:', error);
    return null;
  }
}
