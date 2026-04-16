import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { THIRTY_DAYS_MS, DEFAULT_SESSION_MS } from "../../shared/const";
import crypto from "crypto";

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
        // Find user by phone or email
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
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid phone/email or password",
          });
        }

        const phoneUser = user[0];

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
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid phone/email or password",
          });
        }

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
        throw error;
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
