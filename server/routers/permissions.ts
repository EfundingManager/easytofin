import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { rolePermissions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const permissionsRouter = router({
  /**
   * Get all role permissions
   * Super Admin only
   */
  getAllPermissions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "super_admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only Super Admins can view permissions",
      });
    }

    const database = await getDb();
    if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    const permissions = await database.select().from(rolePermissions);
    return permissions;
  }),

  /**
   * Get permissions for a specific role
   * Super Admin only
   */
  getRolePermissions: protectedProcedure
    .input(z.object({ role: z.enum(["admin", "manager", "support", "staff"]) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can view permissions",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const permission = await database
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.role, input.role));

      if (!permission.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Permissions not found for role: ${input.role}`,
        });
      }

      return permission[0];
    }),

  /**
   * Update permissions for a specific role
   * Super Admin only
   */
  updateRolePermissions: protectedProcedure
    .input(
      z.object({
        role: z.enum(["admin", "manager", "support", "staff"]),
        permissions: z.record(z.boolean()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can update permissions",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Build update object from permissions
      const updateData: any = {
        ...input.permissions,
        updatedBy: ctx.user.id,
        updatedAt: new Date(),
      };

      // Convert boolean values to "true"/"false" strings for enum fields
      const enumFields = [
        "canViewClients",
        "canEditClients",
        "canDeleteClients",
        "canArchiveClients",
        "canRestoreClients",
        "canViewKYC",
        "canApproveKYC",
        "canRejectKYC",
        "canReviewDocuments",
        "canViewPolicies",
        "canEditPolicies",
        "canDeletePolicies",
        "canViewForms",
        "canEditForms",
        "canCreateForms",
        "canDeleteForms",
        "canViewCampaigns",
        "canCreateCampaigns",
        "canSendCampaigns",
        "canDeleteCampaigns",
        "canManageTeam",
        "canInviteMembers",
        "canRemoveMembers",
        "canChangeRoles",
        "canAccessConfiguration",
        "canManagePermissions",
        "canViewAuditLogs",
        "canExportData",
      ];

      for (const field of enumFields) {
        if (field in updateData) {
          updateData[field] = updateData[field] ? "true" : "false";
        }
      }

      await database
        .update(rolePermissions)
        .set(updateData)
        .where(eq(rolePermissions.role, input.role));
      return {
        success: true,
        message: `Permissions updated for role: ${input.role}`,
      };
    }),

  /**
   * Reset permissions to defaults for a specific role
   * Super Admin only
   */
  resetRolePermissions: protectedProcedure
    .input(z.object({ role: z.enum(["admin", "manager", "support", "staff"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can reset permissions",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Define default permissions for each role
      const defaultPermissions: Record<string, any> = {
        admin: {
          canViewClients: "true",
          canEditClients: "true",
          canDeleteClients: "false",
          canArchiveClients: "true",
          canRestoreClients: "true",
          canViewKYC: "true",
          canApproveKYC: "true",
          canRejectKYC: "true",
          canReviewDocuments: "true",
          canViewPolicies: "true",
          canEditPolicies: "true",
          canDeletePolicies: "false",
          canViewForms: "true",
          canEditForms: "true",
          canCreateForms: "true",
          canDeleteForms: "false",
          canViewCampaigns: "true",
          canCreateCampaigns: "true",
          canSendCampaigns: "true",
          canDeleteCampaigns: "false",
          canManageTeam: "false",
          canInviteMembers: "false",
          canRemoveMembers: "false",
          canChangeRoles: "false",
          canAccessConfiguration: "false",
          canManagePermissions: "false",
          canViewAuditLogs: "true",
          canExportData: "true",
        },
        manager: {
          canViewClients: "true",
          canEditClients: "true",
          canDeleteClients: "false",
          canArchiveClients: "false",
          canRestoreClients: "false",
          canViewKYC: "true",
          canApproveKYC: "true",
          canRejectKYC: "false",
          canReviewDocuments: "true",
          canViewPolicies: "true",
          canEditPolicies: "false",
          canDeletePolicies: "false",
          canViewForms: "true",
          canEditForms: "false",
          canCreateForms: "false",
          canDeleteForms: "false",
          canViewCampaigns: "true",
          canCreateCampaigns: "false",
          canSendCampaigns: "false",
          canDeleteCampaigns: "false",
          canManageTeam: "false",
          canInviteMembers: "false",
          canRemoveMembers: "false",
          canChangeRoles: "false",
          canAccessConfiguration: "false",
          canManagePermissions: "false",
          canViewAuditLogs: "true",
          canExportData: "true",
        },
        support: {
          canViewClients: "true",
          canEditClients: "false",
          canDeleteClients: "false",
          canArchiveClients: "false",
          canRestoreClients: "false",
          canViewKYC: "true",
          canApproveKYC: "false",
          canRejectKYC: "false",
          canReviewDocuments: "false",
          canViewPolicies: "true",
          canEditPolicies: "false",
          canDeletePolicies: "false",
          canViewForms: "true",
          canEditForms: "false",
          canCreateForms: "false",
          canDeleteForms: "false",
          canViewCampaigns: "true",
          canCreateCampaigns: "false",
          canSendCampaigns: "false",
          canDeleteCampaigns: "false",
          canManageTeam: "false",
          canInviteMembers: "false",
          canRemoveMembers: "false",
          canChangeRoles: "false",
          canAccessConfiguration: "false",
          canManagePermissions: "false",
          canViewAuditLogs: "false",
          canExportData: "false",
        },
        staff: {
          canViewClients: "true",
          canEditClients: "false",
          canDeleteClients: "false",
          canArchiveClients: "false",
          canRestoreClients: "false",
          canViewKYC: "true",
          canApproveKYC: "false",
          canRejectKYC: "false",
          canReviewDocuments: "false",
          canViewPolicies: "true",
          canEditPolicies: "false",
          canDeletePolicies: "false",
          canViewForms: "true",
          canEditForms: "false",
          canCreateForms: "false",
          canDeleteForms: "false",
          canViewCampaigns: "true",
          canCreateCampaigns: "false",
          canSendCampaigns: "false",
          canDeleteCampaigns: "false",
          canManageTeam: "false",
          canInviteMembers: "false",
          canRemoveMembers: "false",
          canChangeRoles: "false",
          canAccessConfiguration: "false",
          canManagePermissions: "false",
          canViewAuditLogs: "false",
          canExportData: "false",
        },
      };

      const defaults = defaultPermissions[input.role];
      if (!defaults) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid role: ${input.role}`,
        });
      }

      await database
        .update(rolePermissions)
        .set({
          ...defaults,
          updatedBy: ctx.user.id,
          updatedAt: new Date(),
        })
        .where(eq(rolePermissions.role, input.role));
      return {
        success: true,
        message: `Permissions reset to defaults for role: ${input.role}`,
      };
    }),
});
