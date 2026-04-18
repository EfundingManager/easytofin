import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { publicProcedure, router } from "../_core/trpc";
import { sendWelcomeEmail } from "../_core/emailService";
import { rateLimiter, RATE_LIMIT_CONFIG } from "../rate-limiter";
import { COOKIE_NAME, ONE_YEAR_MS, THIRTY_DAYS_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  createPhoneUser,
  getPhoneUserByEmail,
  getPhoneUserByPhone,
  updatePhoneUser,
} from "../db";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export const signupRouter = router({
  /**
   * Register a new user with email, phone, and full name
   * Validates input and creates user account
   */
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Invalid phone number"),
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check rate limit for signup requests
        const rateLimitCheck = rateLimiter.isAllowed(
          input.email,
          RATE_LIMIT_CONFIG.EMAIL_REQUEST.maxRequests,
          RATE_LIMIT_CONFIG.EMAIL_REQUEST.windowMs
        );

        if (!rateLimitCheck.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many signup attempts. Please try again later.",
          });
        }

        // Check if email already exists
        const existingEmailUser = await getPhoneUserByEmail(input.email);
        if (existingEmailUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered. Please login or use a different email.",
          });
        }

        // Check if phone already exists
        const existingPhoneUser = await getPhoneUserByPhone(input.phone);
        if (existingPhoneUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Phone number already registered. Please login or use a different number.",
          });
        }

        // Validate full name format (at least first and last name)
        const nameParts = input.fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please provide both first and last name.",
          });
        }

        // Hash the password
        const hashedPassword = hashPassword(input.password);

        // Create new user
        const newUser = await createPhoneUser({
          email: input.email.toLowerCase(),
          phone: input.phone,
          name: input.fullName,
          passwordHash: hashedPassword,
          loginMethod: "password",
          role: "user",
        });

        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user account.",
          });
        }

        // Send welcome email
        try {
          await sendWelcomeEmail(
            input.email,
            input.fullName,
            `${process.env.VITE_FRONTEND_URL || 'https://easytofin.com'}/dashboard`
          );
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the signup if email fails
        }

        // Note: Session creation is handled by the frontend via cookies
        // The backend will set session cookies through response headers if needed

        return {
          success: true,
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          message: "Account created successfully!",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Signup error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to register user.",
        });
      }
    }),

  /**
   * Validate email availability
   */
  checkEmailAvailability: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const existingUser = await getPhoneUserByEmail(input.email);
        return {
          available: !existingUser,
          message: existingUser ? "Email already registered" : "Email available",
        };
      } catch (error) {
        console.error("Email check error:", error);
        return {
          available: false,
          message: "Error checking email availability",
        };
      }
    }),

  /**
   * Validate phone availability
   */
  checkPhoneAvailability: publicProcedure
    .input(z.object({ phone: z.string().min(10) }))
    .query(async ({ input }) => {
      try {
        const existingUser = await getPhoneUserByPhone(input.phone);
        return {
          available: !existingUser,
          message: existingUser ? "Phone already registered" : "Phone available",
        };
      } catch (error) {
        console.error("Phone check error:", error);
        return {
          available: false,
          message: "Error checking phone availability",
        };
      }
    }),
});
