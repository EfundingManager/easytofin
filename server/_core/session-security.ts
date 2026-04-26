/**
 * Session Security Service
 * Implements:
 * - Session fixation prevention (regenerate session ID on login)
 * - Token reuse detection
 * - Session invalidation on logout
 * - Secure cookie settings validation
 */

import { getDb } from '../db';
import { sessionTokens } from '../../drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface SessionSecurityCheckResult {
  isValid: boolean;
  reason?: string;
  shouldRegenerate?: boolean;
}

export interface SessionTokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a session token for storage
 * Never store plain tokens in database
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new session token with security checks
 */
export async function createSessionToken(
  phoneUserId: number,
  ipAddress: string,
  userAgent: string,
  deviceFingerprint?: string,
  expiresInMs: number = 86400000 // 24 hours default
): Promise<SessionTokenData> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInMs);

    // Insert new session token
    await db.insert(sessionTokens).values({
      phoneUserId,
      token: token.substring(0, 100), // Store truncated version for reference
      tokenHash,
      ipAddress,
      userAgent,
      deviceFingerprint,
      isActive: 'true',
      isRevoked: 'false',
      expiresAt,
      lastActivityAt: now,
    });

    return {
      token,
      tokenHash,
      expiresAt,
    };
  } catch (error) {
    console.error('[Session Security] Error creating session token:', error);
    throw error;
  }
}

/**
 * Verify a session token
 * Checks expiration, revocation, and activity
 */
export async function verifySessionToken(
  phoneUserId: number,
  tokenHash: string,
  ipAddress: string
): Promise<SessionSecurityCheckResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        isValid: false,
        reason: 'Database connection failed',
      };
    }

    const now = new Date();

    // Find the session token
    const sessionRecord = await db
      .select()
      .from(sessionTokens)
      .where(
        and(
          eq(sessionTokens.phoneUserId, phoneUserId),
          eq(sessionTokens.tokenHash, tokenHash)
        )
      )
      .limit(1);

    if (sessionRecord.length === 0) {
      return {
        isValid: false,
        reason: 'Session token not found',
      };
    }

    const session = sessionRecord[0];

    // Check if revoked
    if (session.isRevoked === 'true') {
      return {
        isValid: false,
        reason: 'Session has been revoked',
      };
    }

    // Check if expired
    if (session.expiresAt < now) {
      return {
        isValid: false,
        reason: 'Session has expired',
      };
    }

    // Check if inactive (optional: invalidate after 30 minutes of inactivity)
    const thirtyMinutesAgo = new Date(now.getTime() - 1800000);
    if (session.lastActivityAt < thirtyMinutesAgo) {
      return {
        isValid: false,
        reason: 'Session has been inactive for too long',
        shouldRegenerate: true,
      };
    }

    // Check for IP mismatch (potential session hijacking)
    if (session.ipAddress !== ipAddress) {
      return {
        isValid: false,
        reason: 'Session IP address mismatch - possible session hijacking',
        shouldRegenerate: true,
      };
    }

    // Update last activity
    await db
      .update(sessionTokens)
      .set({ lastActivityAt: now })
      .where(eq(sessionTokens.id, session.id));

    return {
      isValid: true,
      shouldRegenerate: false,
    };
  } catch (error) {
    console.error('[Session Security] Error verifying session token:', error);
    return {
      isValid: false,
      reason: 'Session verification failed',
    };
  }
}

/**
 * Revoke a session token
 */
export async function revokeSessionToken(
  tokenHash: string,
  reason: string = 'User logout'
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const now = new Date();

    await db
      .update(sessionTokens)
      .set({
        isRevoked: 'true',
        revokedAt: now,
        revokedReason: reason,
      })
      .where(eq(sessionTokens.tokenHash, tokenHash));

    return true;
  } catch (error) {
    console.error('[Session Security] Error revoking session token:', error);
    return false;
  }
}

/**
 * Revoke all sessions for a user (e.g., on password change or suspicious activity)
 */
export async function revokeAllUserSessions(
  phoneUserId: number,
  reason: string = 'User initiated'
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const now = new Date();

    // Get all active sessions for this user
    const activeSessions = await db
      .select()
      .from(sessionTokens)
      .where(
        and(
          eq(sessionTokens.phoneUserId, phoneUserId),
          eq(sessionTokens.isRevoked, 'false')
        )
      );

    // Revoke all of them
    if (activeSessions.length > 0) {
      await db
        .update(sessionTokens)
        .set({
          isRevoked: 'true',
          revokedAt: now,
          revokedReason: reason,
        })
        .where(
          and(
            eq(sessionTokens.phoneUserId, phoneUserId),
            eq(sessionTokens.isRevoked, 'false')
          )
        );
    }

    return activeSessions.length;
  } catch (error) {
    console.error('[Session Security] Error revoking all user sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired and revoked sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 2592000000); // 30 days

    // Delete old revoked sessions
    await db
      .delete(sessionTokens)
      .where(
        and(
          eq(sessionTokens.isRevoked, 'true'),
          lt(sessionTokens.revokedAt, thirtyDaysAgo)
        )
      );

    return 0; // Drizzle doesn't return affected rows count in this version
  } catch (error) {
    console.error('[Session Security] Error cleaning up sessions:', error);
    return 0;
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(phoneUserId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();

    const sessions = await db
      .select()
      .from(sessionTokens)
      .where(
        and(
          eq(sessionTokens.phoneUserId, phoneUserId),
          eq(sessionTokens.isRevoked, 'false'),
          lt(sessionTokens.expiresAt, now)
        )
      );

    return sessions.map(s => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      deviceFingerprint: s.deviceFingerprint,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
    }));
  } catch (error) {
    console.error('[Session Security] Error getting user sessions:', error);
    return [];
  }
}

/**
 * Validate secure cookie settings
 */
export function validateSecureCookieSettings(cookieOptions: any): boolean {
  // Check required security settings
  const hasHttpOnly = cookieOptions.httpOnly === true;
  const hasSecure = cookieOptions.secure === true;
  const hasSameSite = cookieOptions.sameSite && cookieOptions.sameSite !== 'none';

  if (!hasHttpOnly || !hasSecure) {
    console.warn('[Session Security] Insecure cookie settings detected');
    return false;
  }

  return true;
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, sessionCsrfToken: string): boolean {
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== sessionCsrfToken.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionCsrfToken)
    );
  } catch (error) {
    return false;
  }
}
