import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { phoneUsers, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { THIRTY_DAYS_MS, DEFAULT_SESSION_MS } from "../../shared/const";
import crypto from "crypto";
import { trackLoginAttempt } from "../services/loginAttemptService";
import { AccountLockoutService } from "../services/accountLockoutService";

export const passwordLoginRouter = router({
  /**
   * Login with phone/email and password
   * Returns session token and redirect URL
   */
  loginWithPassword: publicProcedure
    .input(
      z.object({
        phoneOrEmail: z.string().min(1, "Phone or email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        rememberMe: z.boolean().optional().default(false),
        rememberDevice: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      try {
        // Check if account is locked
        const lockStatus = await AccountLockoutService.isAccountLocked(
          null,
          input.phoneOrEmail.includes("@") ? input.phoneOrEmail : null,
          !input.phoneOrEmail.includes("@") ? input.phoneOrEmail : null
        );

        if (lockStatus.isLocked) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Account is temporarily locked. Please try again in ${lockStatus.remainingMinutes} minutes or use the unlock option.`,
          });
        }

        // Find user by phone or email in phoneUsers table
        let phoneUser = null;
        const phoneUserResult = await db
          .select()
          .from(phoneUsers)
          .where(
            input.phoneOrEmail.includes("@")
              ? eq(phoneUsers.email, input.phoneOrEmail)
              : eq(phoneUsers.phone, input.phoneOrEmail)
          )
          .limit(1);

        if (phoneUserResult && phoneUserResult.length > 0) {
          phoneUser = phoneUserResult[0];
        }

        // If not found in phoneUsers and it's an email, check main users table
        if (!phoneUser && input.phoneOrEmail.includes("@")) {
          const mainUserResult = await db
            .select()
            .from(users)
            .where(eq(users.email, input.phoneOrEmail))
            .limit(1);

          if (mainUserResult && mainUserResult.length > 0) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please use your OAuth login method to sign in.",
            });
          }
        }

        if (!phoneUser) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid phone/email or password",
          });
        }

        // Verify password
        if (!phoneUser.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No password set for this account. Please use OTP login.",
          });
        }

        // Verify password using crypto (simple hash comparison)
        const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
        const passwordMatch = passwordHash === phoneUser.passwordHash;
        if (!passwordMatch) {
          // Record failed attempt and check lockout
          const lockoutResult = await AccountLockoutService.recordFailedAttempt(
            phoneUser.id,
            phoneUser.email || null,
            phoneUser.phone || null,
            'invalid_password',
            ctx.req?.ip
          );

          // Track failed login attempt
          await trackLoginAttempt({
            phoneUserId: phoneUser.id,
            email: phoneUser.email || undefined,
            phone: phoneUser.phone || undefined,
            attemptType: 'password',
            status: 'failed',
            failureReason: 'invalid_password',
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers?.['user-agent'],
          });

          // If account is now locked, return specific message
          if (lockoutResult.isLocked) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Too many failed attempts. Account locked for 30 minutes. Remaining attempts: ${lockoutResult.remainingAttempts}`,
            });
          }

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `Invalid phone/email or password. Remaining attempts: ${lockoutResult.remainingAttempts}`,
          });
        }

        // Record successful login
        await AccountLockoutService.recordSuccessfulLogin(
          phoneUser.id,
          phoneUser.email || null,
          phoneUser.phone || null
        );

        // Create session token
        const sessionDuration = input.rememberMe ? THIRTY_DAYS_MS : DEFAULT_SESSION_MS;
        const sessionToken = crypto.randomBytes(32).toString("hex");

        // Set session cookie
        const cookieOptions = {
          httpOnly: true,
          secure: ctx.req.protocol === "https",
          sameSite: "none" as const,
          maxAge: sessionDuration,
          path: "/",
        };

        if (ctx.res && ctx.res.cookie) {
          ctx.res.cookie("session", sessionToken, cookieOptions);
        }

        // Determine redirect URL based on user role
        let redirectUrl = "/dashboard";
        if (phoneUser.role === "admin" || phoneUser.role === "super_admin") {
          redirectUrl = "/admin";
        } else if (phoneUser.role === "manager" || phoneUser.role === "staff") {
          redirectUrl = "/admin";
        } else if (phoneUser.clientStatus === "customer") {
          redirectUrl = `/customer/${phoneUser.id}`;
        } else {
          redirectUrl = `/user/${phoneUser.id}`;
        }

        // Track successful login attempt
        await trackLoginAttempt({
          phoneUserId: phoneUser.id,
          email: phoneUser.email || undefined,
          phone: phoneUser.phone || undefined,
          attemptType: 'password',
          status: 'success',
          ipAddress: ctx.req?.ip,
          userAgent: ctx.req?.headers?.['user-agent'],
        });

        return {
          success: true,
          sessionToken,
          redirectUrl,
          user: {
            id: phoneUser.id,
            email: phoneUser.email,
            name: phoneUser.name,
            role: phoneUser.role,
          },
        };
      } catch (error: any) {
        console.error("[Password Login] Error:", error);
        // Return user-friendly error message instead of exposing database details
        if (error.code === "UNAUTHORIZED" || error.code === "TOO_MANY_REQUESTS") {
          throw error; // Re-throw TRPC errors
        }
        // For any other errors (database, etc), return generic message
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid phone/email or password",
        });
      }
    }),

  /**
   * Validate if user has password set
   */
  hasPassword: publicProcedure
    .input(
      z.object({
        phoneOrEmail: z.string().min(1, "Phone or email is required"),
      })
    )
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      try {
        const user = await db
          .select()
          .from(phoneUsers)
          .where(
            input.phoneOrEmail.includes("@")
              ? eq(phoneUsers.email, input.phoneOrEmail)
              : eq(phoneUsers.phone, input.phoneOrEmail)
          )
          .limit(1);

        if (!user || user.length === 0) {
          return { hasPassword: false, exists: false };
        }

        return {
          hasPassword: !!user[0].passwordHash,
          exists: true,
          name: user[0].name,
        };
      } catch (error: any) {
        console.error("[Has Password] Error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to check password" });
      }
    }),
});
