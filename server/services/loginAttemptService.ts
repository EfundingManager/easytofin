import { getDb } from '../db';
import { loginAttempts, phoneUsers } from '../../drizzle/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { sendLoginAlertEmail } from './emailAlertService';

export interface LoginAttemptData {
  phoneUserId?: number;
  email?: string;
  phone?: string;
  attemptType: 'password' | 'otp' | 'email_link';
  status: 'success' | 'failed';
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: string;
}

/**
 * Track login attempt and send alert if failed
 */
export async function trackLoginAttempt(data: LoginAttemptData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[LoginAttempt] Database not available');
      return;
    }

    // Insert login attempt record
    const attempt = await db.insert(loginAttempts).values({
      phoneUserId: data.phoneUserId,
      email: data.email,
      phone: data.phone,
      attemptType: data.attemptType,
      status: data.status,
      failureReason: data.failureReason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceFingerprint: data.deviceFingerprint,
      location: data.location,
      alertSent: 'false',
    });

    console.log(`[LoginAttempt] Recorded ${data.status} attempt for ${data.email || data.phone}`);

    // Send alert if failed login
    if (data.status === 'failed') {
      await sendFailedLoginAlert(data);
    }
  } catch (error) {
    console.error('[LoginAttempt] Failed to track attempt:', error);
  }
}

/**
 * Send failed login alert email to user
 */
async function sendFailedLoginAlert(data: LoginAttemptData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[LoginAlert] Database not available');
      return;
    }

    // Get user email
    let userEmail = data.email;
    if (data.phoneUserId && !userEmail) {
      const user = await db.select().from(phoneUsers).where(eq(phoneUsers.id, data.phoneUserId));
      if (user && user.length > 0) {
        userEmail = user[0].email || undefined;
      }
    }

    if (!userEmail) {
      console.warn('[LoginAlert] No email found for failed login attempt');
      return;
    }

    // Check if user has multiple failed attempts in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailedAttempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.status, 'failed'),
          eq(loginAttempts.email, userEmail),
          gte(loginAttempts.createdAt, oneHourAgo)
        )
      );

    const failedCount = recentFailedAttempts.length;

    // Send alert for first failure or every 3rd failure
    if (failedCount === 1 || failedCount % 3 === 0) {
      const alertSent = await sendLoginAlertEmail({
        email: userEmail,
        attemptType: data.attemptType,
        failureReason: data.failureReason,
        ipAddress: data.ipAddress,
        location: data.location,
        failedAttemptCount: failedCount,
        timestamp: new Date(),
      });

      if (alertSent) {
        // Mark alert as sent
        const latestAttempt = recentFailedAttempts[recentFailedAttempts.length - 1];
        if (latestAttempt) {
          await db
            .update(loginAttempts)
            .set({
              alertSent: 'true',
              alertSentAt: new Date(),
            })
            .where(eq(loginAttempts.id, latestAttempt.id));
        }
      }
    }
  } catch (error) {
    console.error('[LoginAlert] Failed to send alert:', error);
  }
}

/**
 * Get recent login attempts for a user
 */
export async function getRecentLoginAttempts(
  email: string,
  hours: number = 24
): Promise<LoginAttemptData[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[LoginAttempt] Database not available');
      return [];
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const attempts = await db
      .select()
      .from(loginAttempts)
      .where(and(eq(loginAttempts.email, email), gte(loginAttempts.createdAt, since)))
      .orderBy(desc(loginAttempts.createdAt));

    return attempts.map((a) => ({
      phoneUserId: a.phoneUserId || undefined,
      email: a.email || undefined,
      phone: a.phone || undefined,
      attemptType: a.attemptType as 'password' | 'otp' | 'email_link',
      status: a.status as 'success' | 'failed',
      failureReason: a.failureReason || undefined,
      ipAddress: a.ipAddress || undefined,
      userAgent: a.userAgent || undefined,
      deviceFingerprint: a.deviceFingerprint || undefined,
      location: a.location || undefined,
    }));
  } catch (error) {
    console.error('[LoginAttempt] Failed to get attempts:', error);
    return [];
  }
}

/**
 * Get failed login attempts count for a user in last hour
 */
export async function getFailedLoginAttemptsCount(email: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[LoginAttempt] Database not available');
      return 0;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const attempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email),
          eq(loginAttempts.status, 'failed'),
          gte(loginAttempts.createdAt, oneHourAgo)
        )
      );

    return attempts.length;
  } catch (error) {
    console.error('[LoginAttempt] Failed to get count:', error);
    return 0;
  }
}

/**
 * Check if account should be locked due to too many failed attempts
 */
export async function shouldLockAccount(email: string, maxAttempts: number = 5): Promise<boolean> {
  const failedCount = await getFailedLoginAttemptsCount(email);
  return failedCount >= maxAttempts;
}
