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
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
      })
    )
    .mutation(async ({ input }) => {
      try {
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
          const smsResult = await sendSMSVerification(input.phone);
          if (!smsResult.success) {
            console.error(`[SMS] Failed to send SMS to ${input.phone}:`, smsResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to send verification SMS",
            });
          }

          console.log(`[OTP] Login OTP sent via SMS to ${input.phone}`);

          return {
            success: true,
            message: "OTP sent to your phone",
            phoneUserId: existingUser.id,
            // For development only - remove in production
            devCode: code,
          };
        } else {
          // New user - we'll create the account after OTP verification
          // For now, just generate and return OTP
          // The actual user account will be created during verification

          console.log(`[OTP] Registration OTP for ${input.phone}: ${code}`);

          return {
            success: true,
            message: "OTP sent to your phone",
            isNewUser: true,
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
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
        code: z.string().length(6, "OTP must be 6 digits"),
        email: z.string().email().optional(),
        name: z.string().min(2).optional(),
        isNewUser: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
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

          return {
            success: true,
            message: "Login successful",
            userId: user.id,
            user: {
              id: user.id,
              phone: user.phone,
              email: user.email,
              name: user.name,
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

          return {
            success: true,
            message: "Registration successful",
            userId: newUser.id,
            isNewRegistration: true,
            user: {
              id: newUser.id,
              phone: newUser.phone,
              email: newUser.email,
              name: newUser.name,
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
   * Logout phone user
   */
  logoutPhone: publicProcedure.mutation(async () => {
    // This would clear the session cookie
    return { success: true };
  }),
});
