import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { sendOtpEmail, sendAccountConfirmationEmail, sendWelcomeEmail } from "../_core/emailService";
import { rateLimiter, RATE_LIMIT_CONFIG } from "../rate-limiter";
import { COOKIE_NAME, ONE_YEAR_MS, THIRTY_DAYS_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import {
  createPhoneUser,
  getPhoneUserByEmail,
  createOtpCode,
  getValidOtpCode,
  incrementOtpAttempts,
  deleteOtpCode,
  updatePhoneUser,
  getPhoneUserById,
} from "../db";

// Generate a random 6-digit OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate OTP expiration (5 minutes from now)
function getOtpExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000);
}

export const emailAuthRouter = router({
  /**
   * Request OTP for email registration or login
   * In production, this would send an email via a service like SendGrid
   */
  requestOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check rate limit for email requests
        const rateLimitCheck = rateLimiter.isAllowed(
          input.email,
          RATE_LIMIT_CONFIG.EMAIL_REQUEST.maxRequests,
          RATE_LIMIT_CONFIG.EMAIL_REQUEST.windowMs
        );

        if (!rateLimitCheck.allowed) {
          const retryAfter = rateLimitCheck.retryAfter || 3600;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many email requests. Please try again in ${retryAfter} seconds.`,
          });
        }

        // Check if user already exists by email
        const existingUser = await getPhoneUserByEmail(input.email);

        // Generate OTP code
        const code = generateOtpCode();
        const expiresAt = getOtpExpiration();

        if (existingUser) {
          // User exists - create OTP for login
          const otp = await createOtpCode({
            phoneUserId: existingUser.id,
            code,
            expiresAt,
            attempts: 0,
          });

          // In production, send email here:
          // await sendEmail(input.email, `Your EasyToFin verification code is: ${code}`);

          console.log(`[OTP] Login OTP for ${input.email}: ${code}`);

          // Send OTP email for login
          const emailSent1 = await sendOtpEmail(input.email, existingUser.name || "User", code, false);
          if (!emailSent1) {
            console.warn(`[OTP] Failed to send email to ${input.email}, but OTP was created`);
          }

          return {
            success: true,
            message: "OTP sent to your email",
            userId: existingUser.id,
            // For development only - remove in production
            devCode: code,
          };
        } else {
          // New user - create temporary user record to store the OTP
          const tempUser = await createPhoneUser({
            email: input.email,
            phone: null,
            name: null,
            verified: "false",
            loginMethod: "email",
            role: "user",
          });

          // Create OTP code for new user
          const otp = await createOtpCode({
            phoneUserId: tempUser.id,
            code,
            expiresAt,
            attempts: 0,
          });

          console.log(`[OTP] Registration OTP for ${input.email}: ${code}`);

          // Send OTP email
          const emailSent2 = await sendOtpEmail(input.email, "New User", code, true);
          if (!emailSent2) {
            console.warn(`[OTP] Failed to send email to ${input.email}, but OTP was created`);
          }

          return {
            success: true,
            message: "OTP sent to your email",
            isNewUser: true,
            phoneUserId: tempUser.id,
            // For development only - remove in production
            devCode: code,
          };
        }
      } catch (error) {
        console.error("Error requesting OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request OTP",
        });
      }
    }),

  /**
   * Verify OTP and create/login user
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        code: z.string().length(6, "OTP must be 6 digits"),
        name: z.string().optional(),
        phone: z.string().optional(),
        isNewUser: z.boolean(),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx: opts }) => {
      try {
        // Check rate limit for verification attempts
        const rateLimitCheck = rateLimiter.isVerificationAllowed(
          `${input.email}-verify`,
          RATE_LIMIT_CONFIG.VERIFICATION_ATTEMPT.maxAttempts,
          RATE_LIMIT_CONFIG.VERIFICATION_ATTEMPT.windowMs
        );

        if (!rateLimitCheck.allowed) {
          const retryAfter = rateLimitCheck.retryAfter || 3600;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many verification attempts. Please try again in ${retryAfter} seconds.`,
          });
        }

        // Check if user exists
        let user = await getPhoneUserByEmail(input.email);

        if (!user && !input.isNewUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (!user && input.isNewUser) {
          // Create new user for email registration
          if (!input.name || !input.phone) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Name and phone are required for new users",
            });
          }

          user = await createPhoneUser({
            email: input.email,
            phone: input.phone,
            name: input.name,
            emailVerified: "true", // Email is verified through OTP
            clientStatus: "queue",
          });
        }

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or find user",
          });
        }

        // Verify OTP
        const otpRecord = await getValidOtpCode(user.id, input.code);

        if (!otpRecord) {
          // Increment failed attempts
          await incrementOtpAttempts(user.id);

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired OTP",
          });
        }
        
        // Verify code with SendGrid verification (optional - for redundancy)
        // const verifyResult = verifyEmailCode(input.code, otpRecord.code);
        // if (!verifyResult) {
        //   throw new TRPCError({
        //     code: "UNAUTHORIZED",
        //     message: "Invalid verification code",
        //   });
        // }

        // Delete OTP after successful verification
        await deleteOtpCode(otpRecord.id);

        // Update user email verification if not already verified
        if (user.emailVerified !== "true") {
          const updatedUser = await updatePhoneUser(user.id, { emailVerified: "true" });
          if (updatedUser) {
            user = updatedUser;
          }
        }

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found after verification",
          });
        }

        // Create session token and set cookie
        const sessionDuration = input.rememberMe ? THIRTY_DAYS_MS : ONE_YEAR_MS;
        const openId = user.googleId || user.email || user.phone || `email-${user.id}`;
        const sessionToken = await sdk.createSessionToken(
          openId,
          { expiresInMs: sessionDuration, name: user.name || "User" }
        );
        
        const cookieOptions = getSessionCookieOptions(opts.req);
        opts.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: sessionDuration,
        } as any);

        // Send confirmation email
        const dashboardUrl = `${process.env.VITE_FRONTEND_URL || "https://easytofin.com"}/dashboard`;
        await sendAccountConfirmationEmail(user.email || input.email, user.name || "User", dashboardUrl);

        // Send welcome email if new user
        if (input.isNewUser) {
          await sendWelcomeEmail(user.email || input.email, user.name || "User", dashboardUrl);
        }

        // Determine redirect URL based on role and user status
        const isNewUser = input.isNewUser;
        const userRole = user.role || 'user';
        
        let redirectUrl: string;
        let requiresSMS2FA = false;
        let twoFASessionToken: string | undefined;
        
        // New users always go to user dashboard
        if (isNewUser) {
          redirectUrl = '/user/dashboard';
        } else {
          // Existing users: redirect based on role
          if (userRole === 'admin' || userRole === 'super_admin') {
            // Admin and super admin require SMS 2FA
            requiresSMS2FA = true;
            redirectUrl = '/2fa';
            // Create 2FA session token for admin users
            twoFASessionToken = await sdk.createSessionToken(
              openId,
              { expiresInMs: 15 * 60 * 1000, name: user.name || 'Admin' } // 15 min expiry for 2FA
            );
            opts.res.cookie('2fa_session', twoFASessionToken, {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            } as any);
          } else if (userRole === 'manager' || userRole === 'staff') {
            // Manager and staff require SMS 2FA
            requiresSMS2FA = true;
            redirectUrl = '/2fa';
            // Create 2FA session token for manager/staff users
            twoFASessionToken = await sdk.createSessionToken(
              openId,
              { expiresInMs: 15 * 60 * 1000, name: user.name || 'Staff' } // 15 min expiry for 2FA
            );
            opts.res.cookie('2fa_session', twoFASessionToken, {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            } as any);
          } else {
            // Regular users go to role-based dashboard
            redirectUrl = user.clientStatus === 'customer' 
              ? `/customer/dashboard`
              : `/user/dashboard`;
          }
        }

        return {
          success: true,
          message: "Email verified successfully",
          userId: user.id,
          clientStatus: user.clientStatus,
          userRole,
          requiresSMS2FA,
          redirectUrl,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            emailVerified: user.emailVerified,
            clientStatus: user.clientStatus,
            role: userRole,
          },
          isNewRegistration: isNewUser,
        };
      } catch (error: any) {
        console.error("Error verifying OTP:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify OTP",
        });
      }
    }),

  /**
   * Resend OTP to email
   */
  resendOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check rate limit for resend requests
        const resendLimitKey = `resend-${input.email}`;
        const rateLimitCheck = rateLimiter.isAllowed(
          resendLimitKey,
          RATE_LIMIT_CONFIG.EMAIL_RESEND.maxRequests,
          RATE_LIMIT_CONFIG.EMAIL_RESEND.windowMs
        );

        if (!rateLimitCheck.allowed) {
          const retryAfter = rateLimitCheck.retryAfter || 60;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many resend attempts. Please try again in ${retryAfter} seconds.`,
          });
        }

        const user = await getPhoneUserByEmail(input.email);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Generate new OTP
        const code = generateOtpCode();
        const expiresAt = getOtpExpiration();

        await createOtpCode({
          phoneUserId: user.id,
          code,
          expiresAt,
          attempts: 0,
        });

        // In production, send email here
        console.log(`[OTP] Resend OTP for ${input.email}: ${code}`);

        return {
          success: true,
          message: "OTP resent to your email",
          // For development only - remove in production
          devCode: code,
        };
      } catch (error) {
        console.error("Error resending OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend OTP",
        });
      }
    }),
});
