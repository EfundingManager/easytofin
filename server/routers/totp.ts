/**
 * TOTP (Time-based One-Time Password) Router
 * 
 * Handles TOTP 2FA setup and verification for privileged roles:
 * - Admin, Manager, Staff, Super Admin
 * 
 * Endpoints:
 *  - setupTotp: Generate TOTP secret and QR code for first-time setup
 *  - verifyTotp: Verify TOTP token and complete 2FA
 *  - getStatus: Get TOTP status for current user
 *  - disableTotp: Disable TOTP for a user
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { totpSecrets, firstLoginTracking, totp2faAuditLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createTotpSetup,
  verifyTotpCode,
  generateBackupCodes,
} from "../_core/totp-service";
import { hasPrivilegedRole } from "../_core/totp-auth-integration";

export const totpRouter = router({
  /**
   * Setup TOTP for the first time
   * Returns QR code, secret, and backup codes
   */
  setupTotp: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // Check if user has privileged role
    if (!hasPrivilegedRole(user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "TOTP setup is only available for privileged roles",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    try {
      // Check if TOTP is already enabled
      const existingTotp = await db
        .select()
        .from(totpSecrets)
        .where(eq(totpSecrets.phoneUserId, user.id))
        .limit(1);

      if (existingTotp.length > 0 && existingTotp[0].isEnabled === "true") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "TOTP is already set up for this account",
        });
      }

      // Generate new TOTP setup
      const totpSetup = await createTotpSetup(user.email || `user-${user.id}@easytofin.com`);
      const backupCodesJson = JSON.stringify(totpSetup.backupCodes);

      // Store the temporary secret (not enabled yet)
      if (existingTotp.length > 0) {
        await db
          .update(totpSecrets)
          .set({
            secret: totpSetup.secret,
            backupCodes: backupCodesJson,
            updatedAt: new Date(),
          })
          .where(eq(totpSecrets.phoneUserId, user.id));
      } else {
        await db.insert(totpSecrets).values({
          phoneUserId: user.id,
          secret: totpSetup.secret,
          backupCodes: backupCodesJson,
          isEnabled: "false",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Log the setup attempt
      await db.insert(totp2faAuditLog).values({
        phoneUserId: user.id,
        eventType: "setup_initiated",
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.get("user-agent") || "unknown",
        createdAt: new Date(),
      });

      return {
        qrCode: totpSetup.qrCode,
        secret: totpSetup.secret,
        manualEntryKey: totpSetup.manualEntryKey,
        backupCodes: totpSetup.backupCodes,
      };
    } catch (error) {
      console.error("[TOTP] Setup failed:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to set up TOTP",
      });
    }
  }),

  /**
   * Verify TOTP token to complete setup
   * Marks TOTP as enabled
   */
  verifyTotp: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6, "Token must be 6 digits").regex(/^\d+$/, "Token must contain only digits"),
        backupCodesAcknowledged: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      if (!input.backupCodesAcknowledged) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must acknowledge that you have saved your backup codes",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get the temporary TOTP secret
        const totpRecord = await db
          .select()
          .from(totpSecrets)
          .where(eq(totpSecrets.phoneUserId, user.id))
          .limit(1);

        if (totpRecord.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "TOTP setup not found. Please start setup again.",
          });
        }

        const totp = totpRecord[0];

        // Verify the token
        const isValid = verifyTotpCode(totp.secret, input.token);
        if (!isValid) {
          // Log failed attempt
          await db.insert(totp2faAuditLog).values({
            phoneUserId: user.id,
            eventType: "verification_failed",
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.get("user-agent") || "unknown",
            createdAt: new Date(),
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid TOTP token. Please try again.",
          });
        }

        // Mark TOTP as enabled
        await db
          .update(totpSecrets)
          .set({
            isEnabled: "true",
            enabledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(totpSecrets.phoneUserId, user.id));

        // Update first login tracking
        await db
          .update(firstLoginTracking)
          .set({
            totpSetupCompletedAt: new Date(),
            hasCompletedFirstLogin: "true",
          })
          .where(eq(firstLoginTracking.phoneUserId, user.id));

        // Log successful verification
        await db.insert(totp2faAuditLog).values({
          phoneUserId: user.id,
          eventType: "verification_success",
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.get("user-agent") || "unknown",
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "TOTP has been successfully enabled",
        };
      } catch (error) {
        console.error("[TOTP] Verification failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify TOTP",
        });
      }
    }),

  /**
   * Verify TOTP token for login
   * Used during login to verify the user's TOTP token
   */
  verifyLoginTotp: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6, "Token must be 6 digits").regex(/^\d+$/, "Token must contain only digits"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get TOTP secret
        const totpRecord = await db
          .select()
          .from(totpSecrets)
          .where(eq(totpSecrets.phoneUserId, user.id))
          .limit(1);

        if (totpRecord.length === 0 || totpRecord[0].isEnabled !== "true") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "TOTP is not set up for this account",
          });
        }

        const totp = totpRecord[0];

        // Verify the token
        const isValid = verifyTotpCode(totp.secret, input.token);
        if (!isValid) {
          // Log failed attempt
          await db.insert(totp2faAuditLog).values({
            phoneUserId: user.id,
            eventType: "verification_failed",
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.get("user-agent") || "unknown",
            createdAt: new Date(),
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid TOTP token",
          });
        }

        // Update last used timestamp
        await db
          .update(totpSecrets)
          .set({
            lastUsedAt: new Date(),
          })
          .where(eq(totpSecrets.phoneUserId, user.id));

        // Log successful login verification
        await db.insert(totp2faAuditLog).values({
          phoneUserId: user.id,
          eventType: "verification_success",
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.get("user-agent") || "unknown",
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "TOTP verification successful",
        };
      } catch (error) {
        console.error("[TOTP] Login verification failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify TOTP",
        });
      }
    }),

  /**
   * Get TOTP status for current user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const db = await getDb();
    if (!db) {
      return {
        isSetup: false,
        isEnabled: false,
      };
    }

    try {
      const totpRecord = await db
        .select()
        .from(totpSecrets)
        .where(eq(totpSecrets.phoneUserId, user.id))
        .limit(1);

      if (totpRecord.length === 0) {
        return {
          isSetup: false,
          isEnabled: false,
        };
      }

      const totp = totpRecord[0];
      return {
        isSetup: true,
        isEnabled: totp.isEnabled === "true",
      };
    } catch (error) {
      console.error("[TOTP] Failed to get status:", error);
      return {
        isSetup: false,
        isEnabled: false,
      };
    }
  }),

  /**
   * Disable TOTP for current user
   * Requires confirmation
   */
  disableTotp: protectedProcedure
    .input(
      z.object({
        confirmDisable: z.boolean().refine((val) => val === true, "You must confirm to disable TOTP"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Update TOTP to disabled
        await db
          .update(totpSecrets)
          .set({
            isEnabled: "false",
            disabledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(totpSecrets.phoneUserId, user.id));

        // Log the disable action
        await db.insert(totp2faAuditLog).values({
          phoneUserId: user.id,
          eventType: "disabled",
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.get("user-agent") || "unknown",
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "TOTP has been disabled",
        };
      } catch (error) {
        console.error("[TOTP] Failed to disable:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable TOTP",
        });
      }
    }),
});
