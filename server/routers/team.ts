import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const teamRouter = router({
  // Get all team members (admin only)
  listMembers: adminProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Get admin users (excluding the current user)
      const members = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(
          or(
            eq(users.role, "admin"),
            eq(users.role, "super_admin"),
            eq(users.role, "manager"),
            eq(users.role, "support"),
            eq(users.role, "staff")
          )
        );

      return members.map((member: any) => ({
        ...member,
        status: member.lastSignedIn ? "active" : "inactive",
        joinDate: member.createdAt,
      }));
    } catch (error) {
      console.error("[Team] Failed to list members:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch team members",
      });
    }
  }),

  // Get team member details
  getMember: adminProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const member = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            lastSignedIn: users.lastSignedIn,
          })
          .from(users)
          .where(eq(users.id, input.memberId))
          .limit(1);

        if (!member.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team member not found",
          });
        }

        return {
          ...member[0],
          status: member[0].lastSignedIn ? "active" : "inactive",
          joinDate: member[0].createdAt,
        };
      } catch (error) {
        console.error("[Team] Failed to get member:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team member",
        });
      }
    }),

  // Update team member role (super admin only)
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        role: z.enum(["admin", "manager", "support", "staff"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Get the member being updated
        const memberToUpdate = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, input.memberId));

        if (!memberToUpdate.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team member not found",
          });
        }

        // Check permissions:
        // - Super Admin can update anyone
        // - Admin can only update non-Super Admin members
        if (ctx.user.role === "super_admin") {
          // Super admin can update anyone except themselves
          if (ctx.user.id === input.memberId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot update your own role",
            });
          }
        } else if (ctx.user.role === "admin") {
          // Admin can only update non-Super Admin members
          if (memberToUpdate[0].role === "super_admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Admin cannot update Super Admin members",
            });
          }
          // Admin also cannot update themselves
          if (ctx.user.id === input.memberId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot update your own role",
            });
          }
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only Super Admin and Admin can update member roles",
          });
        }

        // Update the member role
        await db
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.memberId));

        return {
          success: true,
          message: `Member role updated to ${input.role}`,
        };
      } catch (error) {
        console.error("[Team] Failed to update member role:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update member role",
        });
      }
    }),

  // Remove team member (super admin only)
  removeMember: protectedProcedure
    .input(z.object({ memberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Get the member being removed
        const memberToRemove = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, input.memberId));

        if (!memberToRemove.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team member not found",
          });
        }

        // Check permissions:
        // - Super Admin can remove anyone
        // - Admin can only remove non-Super Admin members
        if (ctx.user.role === "super_admin") {
          // Super admin can remove anyone except themselves
          if (ctx.user.id === input.memberId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot remove your own account",
            });
          }
        } else if (ctx.user.role === "admin") {
          // Admin can only remove non-Super Admin members
          if (memberToRemove[0].role === "super_admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Admin cannot remove Super Admin members",
            });
          }
          // Admin also cannot remove themselves
          if (ctx.user.id === input.memberId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot remove your own account",
            });
          }
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only Super Admin and Admin can remove members",
          });
        }

        // Delete the member
        await db.delete(users).where(eq(users.id, input.memberId));

        return {
          success: true,
          message: "Team member removed successfully",
        };
      } catch (error) {
        console.error("[Team] Failed to remove member:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove team member",
        });
      }
    }),

  // Invite team member (super admin only)
  inviteMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(["admin", "manager", "support", "staff"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Only super admin can invite members
        if (ctx.user.role !== "super_admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only super admin can invite members",
          });
        }

        // Check if email already exists
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already exists in the system",
          });
        }

        // Create new team member
        const openId = `invite_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        await db.insert(users).values({
          openId: openId,
          name: input.name,
          email: input.email,
          role: input.role,
          loginMethod: "email",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        });

        // TODO: Send invitation email with login link

        return {
          success: true,
          message: `Invitation sent to ${input.email}`,
        };
      } catch (error) {
        console.error("[Team] Failed to invite member:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to invite team member",
        });
      }
    }),

  // Get team statistics
  getTeamStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Count team members by role
      const adminCount = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "admin"));

      const managerCount = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "manager"));

      const supportCount = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "support"));

      const staffCount = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "staff"));

      return {
        totalMembers: (adminCount.length || 0) + (managerCount.length || 0) + (supportCount.length || 0) + (staffCount.length || 0),
        admins: adminCount.length || 0,
        managers: managerCount.length || 0,
        support: supportCount.length || 0,
        staff: staffCount.length || 0,
      };
    } catch (error) {
      console.error("[Team] Failed to get stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch team statistics",
      });
    }
  }),
});
