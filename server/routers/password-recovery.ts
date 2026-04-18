import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { phoneUsers, passwordResetTokens } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Rate limiting for password recovery attempts
const recoveryAttempts = new Map<string, { timestamp: number; count: number }>();
const RECOVERY_COOLDOWN_SECONDS = 60;
const RECOVERY_MAX_ATTEMPTS_PER_HOUR = 5;

function checkRecoveryRateLimit(identifier: string): { allowed: boolean; remainingSeconds?: number; error?: string } {
  const now = Date.now();
  const attempts = recoveryAttempts.get(identifier);

  if (!attempts) {
    recoveryAttempts.set(identifier, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  const timeSinceLastAttempt = (now - attempts.timestamp) / 1000;

  if (timeSinceLastAttempt < RECOVERY_COOLDOWN_SECONDS) {
    const remainingSeconds = Math.ceil(RECOVERY_COOLDOWN_SECONDS - timeSinceLastAttempt);
    return {
      allowed: false,
      remainingSeconds,
      error: `Please wait ${remainingSeconds} seconds before trying again`,
    };
  }

  if (timeSinceLastAttempt > 3600) {
    recoveryAttempts.set(identifier, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  if (attempts.count >= RECOVERY_MAX_ATTEMPTS_PER_HOUR) {
    return {
      allowed: false,
      error: `Too many recovery attempts. Please try again later.`,
    };
  }

  recoveryAttempts.set(identifier, { timestamp: now, count: attempts.count + 1 });
  return { allowed: true };
}

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate recovery token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send SMS OTP (using Twilio or built-in service)
async function sendPasswordRecoverySMS(phone: string, otp: string, userName: string): Promise<boolean> {
  try {
    console.log(`📱 Password Recovery OTP for ${phone}:`);
    console.log(`   Code: ${otp}`);
    console.log(`   Message: Hi ${userName}, your password recovery code is ${otp}. Valid for 15 minutes. Do not share this code.`);
    
    // TODO: Integrate with actual SMS service (Twilio, AWS SNS)
    return true;
  } catch (error) {
    console.error('[PasswordRecovery] Failed to send SMS:', error);
    return false;
  }
}

// Send email recovery link
async function sendPasswordRecoveryEmail(email: string, token: string, userName: string): Promise<boolean> {
  try {
    const recoveryUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    console.log(`📧 Password Recovery Link for ${email}:`);
    console.log(`   ${recoveryUrl}`);
    console.log(`   Token: ${token}`);
    
    // TODO: Integrate with actual email service
    return true;
  } catch (error) {
    console.error('[PasswordRecovery] Failed to send email:', error);
    return false;
  }
}

export const passwordRecoveryRouter = router({
  /**
   * Request password recovery via email or SMS
   */
  requestRecovery: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email').optional(),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
        method: z.enum(['email', 'sms']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validate that at least email or phone is provided
        if (!input.email && !input.phone) {
          return { success: false, error: 'Email or phone number is required' };
        }

        // Check rate limiting
        const identifier = input.email || input.phone || '';
        const rateLimitCheck = checkRecoveryRateLimit(identifier);
        if (!rateLimitCheck.allowed) {
          return {
            success: false,
            error: rateLimitCheck.error || 'Too many requests. Please try again later.',
            remainingSeconds: rateLimitCheck.remainingSeconds,
          };
        }

        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Find user by email or phone
        let user: any = null;
        if (input.email) {
          const result = await db.select().from(phoneUsers).where(eq(phoneUsers.email, input.email));
          user = result[0];
        } else if (input.phone) {
          const result = await db.select().from(phoneUsers).where(eq(phoneUsers.phone, input.phone));
          user = result[0];
        }

        if (!user) {
          // Don't reveal whether email/phone exists for security
          return { success: true, message: 'If an account exists, recovery instructions have been sent' };
        }

        if (input.method === 'sms') {
          // Generate OTP for SMS
          const otp = generateOTP();
          const token = generateToken();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          // Store OTP in database
          await db.insert(passwordResetTokens).values({
            phoneUserId: user.id,
            token,
            resetMethod: 'phone',
            email: user.email,
            phone: user.phone,
            otp,
            otpAttempts: 0,
            maxOtpAttempts: 3,
            otpVerified: 'false',
            expiresAt,
          });

          // Send SMS
          const smsSent = await sendPasswordRecoverySMS(user.phone, otp, user.name || 'User');

          if (!smsSent) {
            return { success: false, error: 'Failed to send recovery SMS' };
          }

          return {
            success: true,
            message: 'Recovery code sent to your phone',
            method: 'sms',
            expiresAt: expiresAt.toISOString(),
          };
        } else {
          // Generate token for email
          const token = generateToken();
          const otp = generateOTP(); // Generate OTP even for email method
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          // Store token in database
          await db.insert(passwordResetTokens).values({
            phoneUserId: user.id,
            token,
            resetMethod: 'email',
            email: user.email,
            phone: user.phone,
            otp,
            otpAttempts: 0,
            maxOtpAttempts: 3,
            otpVerified: 'false',
            expiresAt,
          });

          // Send email
          const emailSent = await sendPasswordRecoveryEmail(user.email, token, user.name || 'User');

          if (!emailSent) {
            return { success: false, error: 'Failed to send recovery email' };
          }

          return {
            success: true,
            message: 'Recovery link sent to your email',
            method: 'email',
            expiresAt: expiresAt.toISOString(),
          };
        }
      } catch (error) {
        console.log('[PasswordRecovery] Failed to request recovery:', error);
        return { success: false, error: 'Failed to process recovery request' };
      }
    }),

  /**
   * Verify SMS OTP for password recovery
   */
  verifySMSOTP: publicProcedure
    .input(
      z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
        otp: z.string().length(6, 'OTP must be 6 digits'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Find OTP record by phone and OTP
        const records: any = await db.select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.otp, input.otp));

        if (!records || records.length === 0) {
          return { success: false, error: 'Invalid recovery code' };
        }

        const record = records[0];

        // Verify phone matches
        if (record.phone !== input.phone) {
          return { success: false, error: 'Recovery code does not match phone number' };
        }

        // Check if expired
        if (new Date() > new Date(record.expiresAt)) {
          return { success: false, error: 'Recovery code has expired' };
        }

        // Check if already verified
        if (record.otpVerified === 'true') {
          return { success: false, error: 'Recovery code has already been used' };
        }

        // Check OTP attempts
        if (record.otpAttempts >= record.maxOtpAttempts) {
          return { success: false, error: 'Too many failed attempts. Please request a new code.' };
        }

        // Mark as verified
        await db.update(passwordResetTokens).set({
          otpVerified: 'true',
          otpVerifiedAt: new Date(),
        }).where(eq(passwordResetTokens.id, record.id));

        return {
          success: true,
          message: 'Code verified successfully',
          resetToken: record.token,
          phoneUserId: record.phoneUserId,
        };
      } catch (error) {
        console.log('[PasswordRecovery] Failed to verify SMS OTP:', error);
        return { success: false, error: 'Failed to verify code' };
      }
    }),

  /**
   * Reset password using recovery token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        resetToken: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validate passwords match
        if (input.newPassword !== input.confirmPassword) {
          return { success: false, error: 'Passwords do not match' };
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(input.newPassword)) {
          return {
            success: false,
            error: 'Password must contain uppercase, lowercase, number, and special character',
          };
        }

        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Find reset token
        const records: any = await db.select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, input.resetToken));

        if (!records || records.length === 0) {
          return { success: false, error: 'Invalid or expired reset link' };
        }

        const record = records[0];

        // Check if expired
        if (new Date() > new Date(record.expiresAt)) {
          return { success: false, error: 'Reset link has expired' };
        }

        // Check if already used
        if (record.passwordResetAt) {
          return { success: false, error: 'Reset link has already been used' };
        }

        // Hash password (in production, use bcrypt)
        const hashedPassword = crypto.createHash('sha256').update(input.newPassword).digest('hex');

        // Update user password
        await db.update(phoneUsers).set({
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        }).where(eq(phoneUsers.id, record.phoneUserId));

        // Mark token as used
        await db.update(passwordResetTokens).set({
          passwordResetAt: new Date(),
        }).where(eq(passwordResetTokens.id, record.id));

        return {
          success: true,
          message: 'Password reset successfully',
          phoneUserId: record.phoneUserId,
        };
      } catch (error) {
        console.log('[PasswordRecovery] Failed to reset password:', error);
        return { success: false, error: 'Failed to reset password' };
      }
    }),

  /**
   * Verify email recovery token
   */
  verifyEmailToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Token is required'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Find token
        const records: any = await db.select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, input.token));

        if (!records || records.length === 0) {
          return { success: false, error: 'Invalid or expired token' };
        }

        const record = records[0];

        // Check if expired
        if (new Date() > new Date(record.expiresAt)) {
          return { success: false, error: 'Token has expired' };
        }

        // Check if already used
        if (record.passwordResetAt) {
          return { success: false, error: 'Token has already been used' };
        }

        return {
          success: true,
          message: 'Token verified',
          resetToken: input.token,
          phoneUserId: record.phoneUserId,
        };
      } catch (error) {
        console.log('[PasswordRecovery] Failed to verify email token:', error);
        return { success: false, error: 'Failed to verify token' };
      }
    }),
});
