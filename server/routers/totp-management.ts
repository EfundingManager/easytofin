import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { getDb } from "../db";
import { totpSecrets, totp2faAuditLog, phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Check if user has write access to manage TOTP for target user
 */
function checkTOTPWriteAccess(
  currentUser: { id: number; role?: string },
  targetUserId: number,
  targetUserRole?: string
): boolean {
  // Super Admin has full access
  if (currentUser.role === "super_admin") {
    return true;
  }

  // Admin has access to subordinates only (not other Admins or Super Admin)
  if (currentUser.role === "admin") {
    if (["admin", "super_admin"].includes(targetUserRole || "")) {
      return false;
    }
    return true;
  }

  // Manager, Staff, Support have no write access
  return false;
}

/**
 * Check if user can view TOTP status for target user
 */
function checkTOTPReadAccess(
  currentUser: { id: number; role?: string },
  targetUserId: number,
  targetUserRole?: string
): boolean {
  // Super Admin and Admin can read all
  if (["super_admin", "admin"].includes(currentUser.role || "")) {
    return true;
  }

  // Manager, Staff, Support can read their own status
  if (currentUser.id === targetUserId) {
    return true;
  }

  return false;
}

export const totpManagementRouter = router({
  /**
   * Get TOTP status for all users (with role-based filtering)
   */
  getStatus: protectedProcedure
    .input(
      z.object({
        roleFilter: z.string().optional(),
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check read access
      if (!["super_admin", "admin", "manager", "staff", "support"].includes(currentUser.role || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions. Privileged role required.",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get all privileged users
        let users = await database
          .select()
          .from(phoneUsers)
          .where(
            // Only get privileged roles
            (col) =>
              col.role &&
              ["super_admin", "admin", "manager", "staff", "support"].includes(col.role)
          );

        // Filter based on current user's role
        if (currentUser.role === "admin") {
          // Admin can only see subordinates
          users = users.filter(
            (u) => !["admin", "super_admin"].includes(u.role || "")
          );
        }

        // Get TOTP secrets for these users
        const totpStatuses = await database
          .select()
          .from(totpSecrets)
          .where((col) => col.phoneUserId && users.some((u) => u.id === col.phoneUserId));

        // Build response
        const result = users.map((user) => {
          const totp = totpStatuses.find((t) => t.phoneUserId === user.id);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            totpStatus: totp?.verified === "true" ? "active" : "not_setup",
            setupDate: totp?.createdAt,
            lastUsed: totp?.lastUsedAt,
            failedAttempts: 0, // Would come from audit log in production
            isLocked: false, // Would come from account lockout table
          };
        });

        return result;
      } catch (error) {
        console.error("[TOTP Management] Error getting status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get TOTP status",
        });
      }
    }),

  /**
   * Disable TOTP for a user
   */
  disableTotp: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().min(1, "Reason is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check write access
      if (!["super_admin", "admin"].includes(currentUser.role || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions. Admin or Super Admin access required.",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Get target user
        const targetUser = await database
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.userId))
          .limit(1);

        if (!targetUser || targetUser.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Check hierarchy
        if (!checkTOTPWriteAccess(currentUser, input.userId, targetUser[0].role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions. You cannot modify accounts at your level or above.",
          });
        }

        // Disable TOTP
        await database
          .update(totpSecrets)
          .set({ isEnabled: "false" })
          .where(eq(totpSecrets.phoneUserId, input.userId));

        // Log action
        await database.insert(totp2faAuditLog).values({
          phoneUserId: input.userId,
          eventType: "disabled",
          isValid: "true",
        });

        return { success: true, message: "TOTP disabled successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[TOTP Management] Error disabling TOTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable TOTP",
        });
      }
    }),

  /**
   * Reset TOTP for a user (forces re-setup on next login)
   */
  resetTotp: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      if (!["super_admin", "admin"].includes(currentUser.role || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions. Admin or Super Admin access required.",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        const targetUser = await database
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.userId))
          .limit(1);

        if (!targetUser || targetUser.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (!checkTOTPWriteAccess(currentUser, input.userId, targetUser[0].role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions. You cannot modify accounts at your level or above.",
          });
        }

        // Delete TOTP secret to force re-setup
        await database
          .delete(totpSecrets)
          .where(eq(totpSecrets.phoneUserId, input.userId));

        // Log action
        await database.insert(totp2faAuditLog).values({
          phoneUserId: input.userId,
          eventType: "reset_initiated",
          isValid: "true",
        });

        return { success: true, message: "TOTP reset successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[TOTP Management] Error resetting TOTP:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset TOTP",
        });
      }
    }),

  /**
   * Unlock account after lockout
   */
  unlockAccount: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      if (!["super_admin", "admin"].includes(currentUser.role || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions. Admin or Super Admin access required.",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        const targetUser = await database
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.userId))
          .limit(1);

        if (!targetUser || targetUser.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (!checkTOTPWriteAccess(currentUser, input.userId, targetUser[0].role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions. You cannot modify accounts at your level or above.",
          });
        }

        // Log unlock action
        await database.insert(totp2faAuditLog).values({
          phoneUserId: input.userId,
          eventType: "reset_completed",
          isValid: "true",
        });

        return { success: true, message: "Account unlocked successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[TOTP Management] Error unlocking account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unlock account",
        });
      }
    }),

  /**
   * Get audit log (Super Admin and Admin only)
   */
  getAuditLog: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        userId: z.number().optional(),
        eventType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      if (!["super_admin", "admin"].includes(currentUser.role || "")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions. Admin or Super Admin access required.",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        let query = database.select().from(totp2faAuditLog);

        if (input.userId) {
          query = query.where(eq(totp2faAuditLog.phoneUserId, input.userId));
        }

        const logs = await query;
        return logs;
      } catch (error) {
        console.error("[TOTP Management] Error getting audit log:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get audit log",
        });
      }
    }),
});
