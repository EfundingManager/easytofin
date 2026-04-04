import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
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
      })
    )
    .mutation(async ({ input }) => {
      try {
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

          return {
            success: true,
            message: "OTP sent to your email",
            userId: existingUser.id,
            // For development only - remove in production
            devCode: code,
          };
        } else {
          // New user - we'll create the account after OTP verification
          console.log(`[OTP] Registration OTP for ${input.email}: ${code}`);

          return {
            success: true,
            message: "OTP sent to your email",
            isNewUser: true,
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
      })
    )
    .mutation(async ({ input }) => {
      try {
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

        return {
          success: true,
          message: "Email verified successfully",
          userId: user.id,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            emailVerified: user.emailVerified,
            clientStatus: user.clientStatus,
          },
          isNewRegistration: input.isNewUser,
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
