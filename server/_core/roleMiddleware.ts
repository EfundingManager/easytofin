/**
 * Role-Based Access Control (RBAC) Middleware for tRPC
 * 
 * Provides middleware functions to enforce role-based permissions on tRPC procedures
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";
import { hasPermission, type UserRole } from "@shared/rolePermissions";

/**
 * Create a role-restricted procedure that requires a specific permission
 * 
 * Usage:
 * ```ts
 * requirePermission("updateKYCStatus").mutation(async ({ ctx, input }) => {
 *   // Only users with updateKYCStatus permission can reach here
 * })
 * ```
 */
export function requirePermission(permission: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;
    
    if (!hasPermission(userRole, permission as any)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have the required permission: ${permission}`,
      });
    }
    
    return next({ ctx });
  });
}

/**
 * Create a role-restricted procedure that requires one of multiple roles
 * 
 * Usage:
 * ```ts
 * requireRole("admin", "super_admin").mutation(async ({ ctx, input }) => {
 *   // Only admins and super admins can reach here
 * })
 * ```
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }
    
    return next({ ctx });
  });
}

/**
 * Create a role-restricted procedure that requires admin or higher
 * 
 * Usage:
 * ```ts
 * requireAdminOrHigher.mutation(async ({ ctx, input }) => {
 *   // Only admin, manager, and super_admin can reach here
 * })
 * ```
 */
export const requireAdminOrHigher = requireRole("admin", "super_admin", "manager");

/**
 * Create a role-restricted procedure that requires super admin
 * 
 * Usage:
 * ```ts
 * requireSuperAdmin.mutation(async ({ ctx, input }) => {
 *   // Only super_admin can reach here
 * })
 * ```
 */
export const requireSuperAdmin = requireRole("super_admin");

/**
 * Create a role-restricted procedure that requires admin (not manager/support)
 * 
 * Usage:
 * ```ts
 * requireAdminExact.mutation(async ({ ctx, input }) => {
 *   // Only admin can reach here (not manager, support, or super_admin)
 * })
 * ```
 */
export const requireAdminExact = requireRole("admin");

/**
 * Create a role-restricted procedure that requires manager or admin
 * 
 * Usage:
 * ```ts
 * requireManagerOrAdmin.mutation(async ({ ctx, input }) => {
 *   // Only manager and admin can reach here
 * })
 * ```
 */
export const requireManagerOrAdmin = requireRole("manager", "admin", "super_admin");

/**
 * Check if a user has a specific permission
 */
export function checkPermission(userRole: UserRole, permission: string): boolean {
  return hasPermission(userRole, permission as any);
}

/**
 * Check if a user has one of multiple roles
 */
export function checkRole(userRole: UserRole, ...allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
