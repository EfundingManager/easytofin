import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  createPhoneUser,
  getPhoneUserByPhone,
  createOtpCode,
  getValidOtpCode,
  incrementOtpAttempts,
  deleteOtpCode,
  updatePhoneUser,
  getPhoneUserById,
} from "../db";
import { sendSMSVerification, verifySMSCode } from "../verification";
import { rateLimiter, RATE_LIMIT_CONFIG } from "../rate-limiter";
import { COOKIE_NAME, ONE_YEAR_MS, THIRTY_DAYS_MS, PENDING_2FA_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

// Generate a random 6-digit OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate OTP expiration (5 minutes from now)
function getOtpExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000);
}

export const phoneAuthRouter = router({
  /**
   * Request OTP for phone registration or login
   * In production, this would send an SMS via a service like Twilio
   */
  requestOtp: publicProcedure
    .input(
      z.object({
        phone: z.string()
          .trim()
          .transform(phone => phone.replace(/[\s\-()]/g, ''))
          .refine(phone => /^\+?[1-9]\d{1,14}$/.test(phone), "Invalid phone number"),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check rate limit for SMS requests
        const rateLimitCheck = rateLimiter.isAllowed(
          input.phone,
          RATE_LIMIT_CONFIG.SMS_REQUEST.maxRequests,
          RATE_LIMIT_CONFIG.SMS_REQUEST.windowMs
        );

        if (!rateLimitCheck.allowed) {
          const retryAfter = rateLimitCheck.retryAfter || 3600;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many SMS requests. Please try again in ${retryAfter} seconds.`,
          });
        }

        // Check if user already exists
        const existingUser = await getPhoneUserByPhone(input.phone);

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

          // Send SMS verification using Twilio
          // NOTE: We don't fail if SMS sending fails - OTP is still created and can be verified
          // This allows the OTP page to load even if SMS delivery has temporary issues
          const smsResult = await sendSMSVerification(input.phone);
          if (!smsResult.success) {
            console.warn(`[SMS] Failed to send SMS to ${input.phone}:`, smsResult.error);
            console.log(`[OTP] OTP created but SMS delivery failed. Dev code for testing: ${code}`);
          } else {
            console.log(`[OTP] Login OTP sent via SMS to ${input.phone}`);
          }

          return {
            success: true,
            message: "OTP sent to your phone",
            phoneUserId: existingUser.id,
            // For development only - remove in production
            devCode: code,
          };
        } else {
          // New user - create temporary user record to store the OTP
          const tempUser = await createPhoneUser({
            phone: input.phone,
            email: null,
            name: null,
            verified: "false",
            loginMethod: "phone",
            role: "user",
          });

          // Create OTP code for new user
          const otp = await createOtpCode({
            phoneUserId: tempUser.id,
            code,
            expiresAt,
            attempts: 0,
          });

          // Send SMS verification using Twilio
          // NOTE: We don't fail if SMS sending fails - OTP is still created and can be verified
          // This allows the OTP page to load even if SMS delivery has temporary issues
          const smsResult = await sendSMSVerification(input.phone);
          if (!smsResult.success) {
            console.warn(`[SMS] Failed to send SMS to ${input.phone}:`, smsResult.error);
            console.log(`[OTP] OTP created but SMS delivery failed. Dev code for testing: ${code}`);
          } else {
            console.log(`[OTP] Registration OTP sent via SMS to ${input.phone}`);
          }

          return {
            success: true,
            message: "OTP sent to your phone",
            isNewUser: true,
            phoneUserId: tempUser.id,
            // For development only - remove in production
            devCode: code,
          };
        }
      } catch (error) {
        console.error("[Phone Auth] Failed to request OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send OTP",
        });
      }
    }),

  /**
   * Verify OTP and complete registration or login
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: z.string()
          .trim()
          .transform(phone => phone.replace(/[\s\-()]/g, ''))
          .refine(phone => /^\+?[1-9]\d{1,14}$/.test(phone), "Invalid phone number"),
        code: z.string().length(6, "OTP must be 6 digits"),
        email: z.string().email().optional(),
        name: z.string().min(2).optional(),
        isNewUser: z.boolean().optional(),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx: opts }) => {
      try {
        // Check rate limit for verification attempts
        const rateLimitCheck = rateLimiter.isVerificationAllowed(
          `${input.phone}-verify`,
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

        const user = await getPhoneUserByPhone(input.phone);

        if (!user && !input.isNewUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user) {
          // Existing user - verify OTP
          const otp = await getValidOtpCode(user.id, input.code);

          if (!otp) {
            // Try to verify with Twilio Verify API
            const twilioResult = await verifySMSCode(input.phone, input.code);
            if (!twilioResult.success) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid or expired OTP",
              });
            }
          } else {
            // Check attempt limit for database OTP
            if (otp.attempts >= 3) {
              await deleteOtpCode(otp.id);
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Too many failed attempts. Please request a new OTP.",
              });
            }

            // Mark OTP as used and update user login time
            await deleteOtpCode(otp.id);
          }
          await updatePhoneUser(user.id, {
            lastSignedIn: new Date(),
            verified: "true",
          });

          // Create session token and set cookie
          const sessionDuration = input.rememberMe ? THIRTY_DAYS_MS : ONE_YEAR_MS;
          const openId = user.googleId || user.email || user.phone || `phone-${user.id}`;
          const sessionToken = await sdk.createSessionToken(
            openId,
            { expiresInMs: sessionDuration, name: user.name || "User" }
          );
          
          const cookieOptions = getSessionCookieOptions(opts.req);
          console.log("[Phone Auth] Setting session cookie:", { COOKIE_NAME, sessionDuration });
          console.log("[Phone Auth] Cookie options:", cookieOptions);
          opts.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: sessionDuration,
          } as any);
          console.log("[Phone Auth] Session cookie set successfully");

          // Determine redirect URL based on role and user status
          const userRole = user.role || 'user';
          let redirectUrl: string;
          let requiresSMS2FA = false;
          let twoFASessionToken: string | undefined;
          
          // Existing users: redirect based on role (role-based routing)
          if (userRole === 'admin' || userRole === 'super_admin') {
            // Admin and super admin require SMS 2FA
            requiresSMS2FA = true;
            redirectUrl = '/2fa';
            // Create 2FA session token for admin users
            twoFASessionToken = await sdk.createSessionToken(
              openId,
              { expiresInMs: 15 * 60 * 1000, name: user.name || 'Admin' }
            );
            opts.res.cookie(PENDING_2FA_COOKIE_NAME, twoFASessionToken, {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            } as any);
          } else if (userRole === 'manager' || userRole === 'staff' || userRole === 'support') {
            // Manager, staff, and support require SMS 2FA
            requiresSMS2FA = true;
            redirectUrl = '/2fa';
            // Create 2FA session token for manager/staff/support users
            twoFASessionToken = await sdk.createSessionToken(
              openId,
              { expiresInMs: 15 * 60 * 1000, name: user.name || 'Staff' }
            );
            opts.res.cookie(PENDING_2FA_COOKIE_NAME, twoFASessionToken, {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            } as any);
          } else {
            // Regular users: redirect based on role and clientStatus
            if (userRole === 'customer' || user.clientStatus === 'customer') {
              redirectUrl = '/customer/dashboard';
            } else {
              redirectUrl = '/user/dashboard';
            }
          }

          return {
            success: true,
            message: "Login successful",
            userId: user.id,
            clientStatus: user.clientStatus,
            userRole,
            requiresSMS2FA,
            redirectUrl,
            twoFASessionToken,
            user: {
              id: user.id,
              phone: user.phone,
              email: user.email,
              name: user.name,
              role: userRole,
            },
          };
        } else {
          // New user registration
          if (!input.name || !input.email) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Name and email required for new registration",
            });
          }

          // Create new phone user
          const newUser = await createPhoneUser({
            phone: input.phone,
            email: input.email,
            name: input.name,
            verified: "true",
            role: "user",
          });

          // Create session token and set cookie for new user
          const sessionDuration = input.rememberMe ? THIRTY_DAYS_MS : ONE_YEAR_MS;
          const sessionToken = await sdk.createSessionToken(
            newUser.googleId || newUser.email || newUser.phone || `phone-${newUser.id}`,
            { expiresInMs: sessionDuration }
          );
          
          const cookieOptions = getSessionCookieOptions(opts.req);
          opts.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: sessionDuration,
          } as any);

          // New users always go to user dashboard
          const newUserRedirectUrl = `/user/dashboard`;

          return {
            success: true,
            message: "Registration successful",
            userId: newUser.id,
            clientStatus: newUser.clientStatus,
            userRole: 'user',
            requiresSMS2FA: false,
            redirectUrl: newUserRedirectUrl,
            isNewRegistration: true,
            user: {
              id: newUser.id,
              phone: newUser.phone,
              email: newUser.email,
              name: newUser.name,
              role: 'user',
            },
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[Phone Auth] Failed to verify OTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify OTP",
        });
      }
    }),

  /**
   * Get current phone user session
   */
  getPhoneSession: publicProcedure.query(async ({ ctx }) => {
    // This would typically check a session cookie or token
    // For now, return null as we'll implement session management later
    return null;
  }),

  /**
   * Resend OTP code with rate limiting and cooldown
   */
  resendOtp: publicProcedure
    .input(
      z.object({
        phone: z.string()
          .trim()
          .transform(phone => phone.replace(/[\s\-()]/g, ''))
          .refine(phone => /^\+?[1-9]\d{1,14}$/.test(phone), "Invalid phone number"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check rate limit for resend requests (stricter than initial request)
        const resendLimitKey = `resend-${input.phone}`;
        const rateLimitCheck = rateLimiter.isAllowed(
          resendLimitKey,
          RATE_LIMIT_CONFIG.SMS_RESEND.maxRequests,
          RATE_LIMIT_CONFIG.SMS_RESEND.windowMs
        );

        if (!rateLimitCheck.allowed) {
          const retryAfter = rateLimitCheck.retryAfter || 60;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many resend attempts. Please try again in ${retryAfter} seconds.`,
          });
        }

        // Get the phone user
        const user = await getPhoneUserByPhone(input.phone);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Phone number not registered",
          });
        }

        // Generate new OTP code
        const code = generateOtpCode();
        const expiresAt = getOtpExpiration();

        // Delete any existing OTP codes for this user
        // (In a real app, you'd have a deleteOtpCodesByUserId function)
        const newOtp = await createOtpCode({
          phoneUserId: user.id,
          code,
          expiresAt,
          attempts: 0,
        });

        if (!newOtp) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate OTP code",
          });
        }

        // Send SMS
        try {
          await sendSMSVerification(input.phone);
        } catch (smsError) {
          console.error("[Phone Auth] SMS send failed:", smsError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send verification SMS",
          });
        }

        console.log(`[OTP] Resend OTP sent via SMS to ${input.phone}`);

        return {
          success: true,
          message: "OTP resent to your phone",
          // For development only - remove in production
          devCode: code,
        };
      } catch (error) {
        console.error("[Phone Auth] Failed to resend OTP:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend OTP",
        });
      }
    }),

  /**
   * Logout phone user
   */
  logoutPhone: publicProcedure.mutation(async () => {
    // This would clear the session cookie
    return { success: true };
  }),
});
