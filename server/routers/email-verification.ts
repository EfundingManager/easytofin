import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { phoneUsers, emailVerificationTokens } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Generate a random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send email (using built-in notification system or external service)
async function sendVerificationEmail(email: string, token: string, userName: string): Promise<boolean> {
  try {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we'll log it and return success
    const verificationUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    console.log(`📧 Email Verification Link for ${email}:`);
    console.log(`   ${verificationUrl}`);
    console.log(`   Token: ${token}`);
    
    // In production, send actual email here
    // await emailService.send({
    //   to: email,
    //   subject: 'Verify Your Email - EasyToFin',
    //   html: `<p>Hi ${userName},</p>
    //          <p>Please verify your email by clicking the link below:</p>
    //          <a href="${verificationUrl}">Verify Email</a>
    //          <p>This link expires in 24 hours.</p>`
    // });
    
    return true;
  } catch (error) {
    console.error('[EmailVerification] Failed to send email:', error);
    return false;
  }
}

export const emailVerificationRouter = router({
  /**
   * Send verification email after profile submission
   */
  sendVerificationEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Generate token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token in database
        await db.insert(emailVerificationTokens).values({
          phoneUserId: ctx.user.id,
          email: input.email,
          token,
          expiresAt,
        });

        // Get user info
        const user: any = await db.select({
          id: phoneUsers.id,
          name: phoneUsers.name,
          email: phoneUsers.email,
          phone: phoneUsers.phone,
          address: phoneUsers.address,
          verified: phoneUsers.verified,
          emailVerified: phoneUsers.emailVerified,
          role: phoneUsers.role,
          clientStatus: phoneUsers.clientStatus,
          kycStatus: phoneUsers.kycStatus,
          createdAt: phoneUsers.createdAt,
          updatedAt: phoneUsers.updatedAt,
          lastSignedIn: phoneUsers.lastSignedIn,
        }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
        
        if (!user || user.length === 0) {
          return { success: false, error: 'User not found' };
        }

        // Send verification email
        const emailSent = await sendVerificationEmail(input.email, token, user[0].name || 'User');

        if (!emailSent) {
          return { success: false, error: 'Failed to send verification email' };
        }

        return {
          success: true,
          message: 'Verification email sent successfully',
          expiresAt: expiresAt.toISOString(),
        };
      } catch (error) {
        console.log('[EmailVerification] Failed to send verification email:', error);
        return { success: false, error: 'Failed to send verification email' };
      }
    }),

  /**
   * Verify email token
   */
  verifyEmail: publicProcedure
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
        const tokenRecord: any = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, input.token));

        if (!tokenRecord || tokenRecord.length === 0) {
          return { success: false, error: 'Invalid or expired token' };
        }

        const record = tokenRecord[0];

        // Check if token is expired
        if (new Date() > new Date(record.expiresAt)) {
          return { success: false, error: 'Token has expired' };
        }

        // Check if already verified
        if (record.verifiedAt) {
          return { success: false, error: 'Email already verified' };
        }

        // Mark as verified
        await db.update(emailVerificationTokens).set({
          verifiedAt: new Date(),
        }).where(eq(emailVerificationTokens.id, record.id));

        // Update user's emailVerified status
        await db.update(phoneUsers).set({
          emailVerified: 'true',
          updatedAt: new Date(),
        }).where(eq(phoneUsers.id, record.phoneUserId));

        return {
          success: true,
          message: 'Email verified successfully',
          email: record.email,
          phoneUserId: record.phoneUserId,
        };
      } catch (error) {
        console.log('[EmailVerification] Failed to verify email:', error);
        return { success: false, error: 'Failed to verify email' };
      }
    }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Check if email already verified
        const user: any = await db.select({
          id: phoneUsers.id,
          name: phoneUsers.name,
          email: phoneUsers.email,
          phone: phoneUsers.phone,
          address: phoneUsers.address,
          verified: phoneUsers.verified,
          emailVerified: phoneUsers.emailVerified,
          role: phoneUsers.role,
          clientStatus: phoneUsers.clientStatus,
          kycStatus: phoneUsers.kycStatus,
          createdAt: phoneUsers.createdAt,
          updatedAt: phoneUsers.updatedAt,
          lastSignedIn: phoneUsers.lastSignedIn,
        }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
        
        if (!user || user.length === 0) {
          return { success: false, error: 'User not found' };
        }

        if (user[0].emailVerified === 'true') {
          return { success: false, error: 'Email already verified' };
        }

        // Delete old tokens
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.phoneUserId, ctx.user.id));

        // Generate new token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Store new token
        await db.insert(emailVerificationTokens).values({
          phoneUserId: ctx.user.id,
          email: input.email,
          token,
          expiresAt,
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(input.email, token, user[0].name || 'User');

        if (!emailSent) {
          return { success: false, error: 'Failed to send verification email' };
        }

        return {
          success: true,
          message: 'Verification email resent successfully',
          expiresAt: expiresAt.toISOString(),
        };
      } catch (error) {
        console.log('[EmailVerification] Failed to resend verification email:', error);
        return { success: false, error: 'Failed to resend verification email' };
      }
    }),

  /**
   * Check email verification status
   */
  getVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const user: any = await db.select({
        id: phoneUsers.id,
        name: phoneUsers.name,
        email: phoneUsers.email,
        phone: phoneUsers.phone,
        address: phoneUsers.address,
        verified: phoneUsers.verified,
        emailVerified: phoneUsers.emailVerified,
        role: phoneUsers.role,
        clientStatus: phoneUsers.clientStatus,
        kycStatus: phoneUsers.kycStatus,
        createdAt: phoneUsers.createdAt,
        updatedAt: phoneUsers.updatedAt,
        lastSignedIn: phoneUsers.lastSignedIn,
      }).from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
      
      if (!user || user.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const isVerified = user[0].emailVerified === 'true';

      return {
        success: true,
        data: {
          isVerified,
          email: user[0].email,
          phoneUserId: ctx.user.id,
        },
      };
    } catch (error) {
      console.log('[EmailVerification] Failed to get verification status:', error);
      return { success: false, error: 'Failed to get verification status' };
    }
  }),
});
