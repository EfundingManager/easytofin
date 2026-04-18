import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { phoneUsers, smsVerificationTokens } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Rate limiting for SMS resend (separate from email)
const smsResendAttempts = new Map<number, { timestamp: number; count: number }>();
const SMS_COOLDOWN_SECONDS = 60;
const SMS_MAX_ATTEMPTS_PER_HOUR = 5;

function checkSmsRateLimit(userId: number): { allowed: boolean; remainingSeconds?: number; error?: string } {
  const now = Date.now();
  const userAttempts = smsResendAttempts.get(userId);

  if (!userAttempts) {
    smsResendAttempts.set(userId, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  const timeSinceLastAttempt = (now - userAttempts.timestamp) / 1000;

  if (timeSinceLastAttempt < SMS_COOLDOWN_SECONDS) {
    const remainingSeconds = Math.ceil(SMS_COOLDOWN_SECONDS - timeSinceLastAttempt);
    return {
      allowed: false,
      remainingSeconds,
      error: `Please wait ${remainingSeconds} seconds before resending SMS`,
    };
  }

  if (timeSinceLastAttempt > 3600) {
    smsResendAttempts.set(userId, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  if (userAttempts.count >= SMS_MAX_ATTEMPTS_PER_HOUR) {
    return {
      allowed: false,
      error: `Too many SMS resend attempts. Please try again later.`,
    };
  }

  smsResendAttempts.set(userId, { timestamp: now, count: userAttempts.count + 1 });
  return { allowed: true };
}

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS (using Twilio or built-in service)
async function sendVerificationSMS(phone: string, otp: string, userName: string): Promise<boolean> {
  try {
    // In production, integrate with Twilio or AWS SNS
    console.log(`📱 SMS Verification Code for ${phone}:`);
    console.log(`   Code: ${otp}`);
    console.log(`   Message: Hi ${userName}, your verification code is ${otp}. Valid for 10 minutes.`);
    
    // TODO: Integrate with actual SMS service
    // const message = await twilioClient.messages.create({
    //   body: `Hi ${userName}, your verification code is ${otp}. Valid for 10 minutes.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });
    
    return true;
  } catch (error) {
    console.error('[SMSVerification] Failed to send SMS:', error);
    return false;
  }
}

export const smsVerificationRouter = router({
  /**
   * Send SMS verification code after signup
   */
  sendVerificationSMS: protectedProcedure
    .input(
      z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await db.insert(smsVerificationTokens).values({
          phoneUserId: ctx.user.id,
          phone: input.phone,
          otp,
          expiresAt,
        });

        // Get user info
        const user: any = await db.select({
          id: phoneUsers.id,
          name: phoneUsers.name,
          phone: phoneUsers.phone,
        }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
        
        if (!user || user.length === 0) {
          return { success: false, error: 'User not found' };
        }

        // Send SMS
        const smsSent = await sendVerificationSMS(input.phone, otp, user[0].name || 'User');

        if (!smsSent) {
          return { success: false, error: 'Failed to send verification SMS' };
        }

        return {
          success: true,
          message: 'Verification SMS sent successfully',
          expiresAt: expiresAt.toISOString(),
          cooldownSeconds: SMS_COOLDOWN_SECONDS,
        };
      } catch (error) {
        console.log('[SMSVerification] Failed to send verification SMS:', error);
        return { success: false, error: 'Failed to send verification SMS' };
      }
    }),

  /**
   * Verify SMS OTP
   */
  verifySMS: publicProcedure
    .input(
      z.object({
        otp: z.string().length(6, 'OTP must be 6 digits'),
        phoneUserId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Find OTP
        const otpRecord: any = await db.select()
          .from(smsVerificationTokens)
          .where(eq(smsVerificationTokens.otp, input.otp));

        if (!otpRecord || otpRecord.length === 0) {
          return { success: false, error: 'Invalid OTP' };
        }

        const record = otpRecord[0];

        // Check if OTP is for the correct user
        if (record.phoneUserId !== input.phoneUserId) {
          return { success: false, error: 'OTP does not match user' };
        }

        // Check if OTP is expired
        if (new Date() > new Date(record.expiresAt)) {
          return { success: false, error: 'OTP has expired' };
        }

        // Check if already verified
        if (record.verifiedAt) {
          return { success: false, error: 'SMS already verified' };
        }

        // Mark as verified
        await db.update(smsVerificationTokens).set({
          verifiedAt: new Date(),
        }).where(eq(smsVerificationTokens.id, record.id));

        // Update user's phoneVerified status
        await db.update(phoneUsers).set({
          verified: 'true',
          updatedAt: new Date(),
        }).where(eq(phoneUsers.id, record.phoneUserId));

        return {
          success: true,
          message: 'Phone verified successfully',
          phone: record.phone,
          phoneUserId: record.phoneUserId,
        };
      } catch (error) {
        console.log('[SMSVerification] Failed to verify SMS:', error);
        return { success: false, error: 'Failed to verify SMS' };
      }
    }),

  /**
   * Resend verification SMS
   */
  resendVerificationSMS: protectedProcedure
    .input(
      z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check rate limiting
        const rateLimitCheck = checkSmsRateLimit(ctx.user.id);
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

        // Check if phone already verified
        const user: any = await db.select({
          id: phoneUsers.id,
          name: phoneUsers.name,
          verified: phoneUsers.verified,
        }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
        
        if (!user || user.length === 0) {
          return { success: false, error: 'User not found' };
        }

        if (user[0].verified === 'true') {
          return { success: false, error: 'Phone already verified' };
        }

        // Delete old OTPs
        await db.delete(smsVerificationTokens).where(eq(smsVerificationTokens.phoneUserId, ctx.user.id));

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Store new OTP
        await db.insert(smsVerificationTokens).values({
          phoneUserId: ctx.user.id,
          phone: input.phone,
          otp,
          expiresAt,
        });

        // Send SMS
        const smsSent = await sendVerificationSMS(input.phone, otp, user[0].name || 'User');

        if (!smsSent) {
          return { success: false, error: 'Failed to send verification SMS' };
        }

        return {
          success: true,
          message: 'Verification SMS resent successfully',
          expiresAt: expiresAt.toISOString(),
          cooldownSeconds: SMS_COOLDOWN_SECONDS,
        };
      } catch (error) {
        console.log('[SMSVerification] Failed to resend verification SMS:', error);
        return { success: false, error: 'Failed to resend verification SMS' };
      }
    }),

  /**
   * Check SMS verification status
   */
  getSmsVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const user: any = await db.select({
        id: phoneUsers.id,
        phone: phoneUsers.phone,
        verified: phoneUsers.verified,
      }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
      
      if (!user || user.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const isVerified = user[0].verified === 'true';

      return {
        success: true,
        data: {
          isVerified,
          phone: user[0].phone,
          phoneUserId: ctx.user.id,
        },
      };
    } catch (error) {
      console.log('[SMSVerification] Failed to get verification status:', error);
      return { success: false, error: 'Failed to get verification status' };
    }
  }),
});
