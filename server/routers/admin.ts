import { adminProcedure, managerProcedure, staffProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { phoneUsers, users, userProducts, factFindingForms, policyAssignments, clientDocuments } from "../../drizzle/schema";
import { eq, desc, and, inArray, or, like, ne } from "drizzle-orm";
import { z } from "zod";
import { getRateLimitViolations, whitelistIdentifier, resetRateLimit, getRateLimitStats } from "../rate-limit-logger";

/**
 * Admin router for managing client submissions, configurations, and analytics
 * All procedures require admin role
 */
export const adminRouter = router({
  /**
   * Get dashboard statistics
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalClients: 0,
        totalSubmissions: 0,
        pendingReview: 0,
        completionRate: 0,
      };
    }

    try {
      // Get total clients
      const clientsResult = await db.select({ id: phoneUsers.id }).from(phoneUsers);
      const totalClients = clientsResult.length;

      // Get total submissions
      const submissionsResult = await db.select().from(factFindingForms);
      const totalSubmissions = submissionsResult.length;

      // Get pending review count
      const pendingResult = await db
        .select()
        .from(factFindingForms)
        .where(eq(factFindingForms.status, "submitted"));
      const pendingReview = pendingResult.length;

      // Calculate completion rate
      const completedResult = await db
        .select()
        .from(factFindingForms)
        .where(eq(factFindingForms.status, "submitted"));
      const completionRate =
        totalSubmissions > 0
          ? Math.round((completedResult.length / totalSubmissions) * 100)
          : 0;

      return {
        totalClients,
        totalSubmissions,
        pendingReview,
        completionRate,
      };
    } catch (error: any) {
      console.error("[Admin] Failed to get stats:", error);
      return {
        totalClients: 0,
        totalSubmissions: 0,
        pendingReview: 0,
        completionRate: 0,
      };
    }
  }),

  /**
   * Get product statistics
   */
  getProductStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        protection: 0,
        pensions: 0,
        healthInsurance: 0,
        generalInsurance: 0,
        investments: 0,
      };
    }

    try {
      const stats = {
        protection: 0,
        pensions: 0,
        healthInsurance: 0,
        generalInsurance: 0,
        investments: 0,
      };

      const forms = await db.select().from(factFindingForms);
      forms.forEach((form: any) => {
        if (form.productType === "protection") stats.protection++;
        else if (form.productType === "pensions") stats.pensions++;
        else if (form.productType === "healthInsurance") stats.healthInsurance++;
        else if (form.productType === "generalInsurance") stats.generalInsurance++;
        else if (form.productType === "investments") stats.investments++;
      });

      return stats;
    } catch (error: any) {
      console.error("[Admin] Failed to get product stats:", error);
      return {
        protection: 0,
        pensions: 0,
        healthInsurance: 0,
        generalInsurance: 0,
        investments: 0,
      };
    }
  }),

  /**
   * Get recent activity
   */
  getRecentActivity: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const forms = await db
        .select()
        .from(factFindingForms)
        .orderBy(desc(factFindingForms.createdAt))
        .limit(10);

      return forms.map((form: any) => ({
        id: form.id,
        productType: form.productType,
        status: form.status,
        createdAt: form.createdAt,
      }));
    } catch (error: any) {
      console.error("[Admin] Failed to get recent activity:", error);
      return [];
    }
  }),

  /**
   * Get all clients
   */
  getAllClients: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const clients = await db.select().from(phoneUsers);
      return clients;
    } catch (error: any) {
      console.error("[Admin] Failed to get clients:", error);
      return [];
    }
  }),

  /**
   * Search clients by policy number or name
   */
  searchClients: adminProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const clients = await db
          .select()
          .from(phoneUsers)
          .where(
            or(
              like(phoneUsers.name, `%${input.query}%`),
              like(phoneUsers.email, `%${input.query}%`)
            )
          );

        return clients;
      } catch (error: any) {
        console.error("[Admin] Failed to search clients:", error);
        return [];
      }
    }),

  /**
   * Get KYC reviews
   */
  getKycReviews: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const reviews = await db.select().from(phoneUsers);
      return reviews.filter((u: any) => u.kycStatus === "pending");
    } catch (error: any) {
      console.error("[Admin] Failed to get KYC reviews:", error);
      return [];
    }
  }),

  /**
   * Get clients queue
   */
  getClientsQueue: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const queue = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.clientStatus, "queue"));

      return queue;
    } catch (error: any) {
      console.error("[Admin] Failed to get clients queue:", error);
      return [];
    }
  }),

  /**
   * Get customers
   */
  getCustomers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const customers = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.clientStatus, "customer"));

      return customers;
    } catch (error: any) {
      console.error("[Admin] Failed to get customers:", error);
      return [];
    }
  }),

  /**
   * Get submissions
   */
  getSubmissions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const submissions = await db
        .select()
        .from(factFindingForms)
        .orderBy(desc(factFindingForms.createdAt));

      return submissions;
    } catch (error: any) {
      console.error("[Admin] Failed to get submissions:", error);
      return [];
    }
  }),

  /**
   * Get forms
   */
  getForms: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const forms = await db.select().from(factFindingForms);
      return forms;
    } catch (error: any) {
      console.error("[Admin] Failed to get forms:", error);
      return [];
    }
  }),

  /**
   * Update client status
   */
  updateClientStatus: adminProcedure
    .input(
      z.object({
        clientId: z.string(),
        status: z.enum(["queue", "in_progress", "assigned", "customer"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const clientIdNum = parseInt(input.clientId, 10);
        await db
          .update(phoneUsers)
          .set({ clientStatus: input.status })
          .where(eq(phoneUsers.id, clientIdNum));

        return { success: true };
      } catch (error: any) {
        console.error("[Admin] Failed to update client status:", error);
        throw new Error(error.message || "Failed to update client status");
      }
    }),

  /**
   * Update KYC status
   */
  updateKycStatus: adminProcedure
    .input(
      z.object({
        clientId: z.string(),
        status: z.enum(["pending", "submitted", "verified", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const clientIdNum = parseInt(input.clientId, 10);
        await db
          .update(phoneUsers)
          .set({ kycStatus: input.status })
          .where(eq(phoneUsers.id, clientIdNum));

        return { success: true };
      } catch (error: any) {
        console.error("[Admin] Failed to update KYC status:", error);
        throw new Error(error.message || "Failed to update KYC status");
      }
    }),

  /**
   * Get rate limit violations
   */
  getRateLimitViolations: adminProcedure.query(async () => {
    try {
      const violations = getRateLimitViolations();
      return violations;
    } catch (error: any) {
      console.error("[Admin] Failed to get rate limit violations:", error);
      return [];
    }
  }),

  /**
   * Whitelist identifier
   */
  whitelistIdentifier: adminProcedure
    .input(z.object({ identifier: z.string(), identifierType: z.enum(["phone", "email"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await whitelistIdentifier(input.identifier, input.identifierType, ctx.user.id);
        return { success: true };
      } catch (error: any) {
        console.error("[Admin] Failed to whitelist identifier:", error);
        throw new Error(error.message || "Failed to whitelist identifier");
      }
    }),

  /**
   * Reset rate limit
   */
  resetRateLimit: adminProcedure
    .input(z.object({ identifier: z.string(), identifierType: z.enum(["phone", "email"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await resetRateLimit(input.identifier, input.identifierType, ctx.user.id);
        return { success: true };
      } catch (error: any) {
        console.error("[Admin] Failed to reset rate limit:", error);
        throw new Error(error.message || "Failed to reset rate limit");
      }
    }),

  /**
   * Get rate limit stats
   */
  getRateLimitStats: adminProcedure.query(async () => {
    try {
      const stats = getRateLimitStats();
      return stats;
    } catch (error: any) {
      console.error("[Admin] Failed to get rate limit stats:", error);
      return {};
    }
  }),

  /**
   * Delete a user
   */
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const userIdNum = parseInt(input.id, 10);
        const user = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, userIdNum))
          .then((res: any) => res[0]);

        if (!user) throw new Error("User not found");

        if (ctx.user.role === "admin") {
          if (user.role !== "staff" && user.role !== "support") {
            throw new Error("You cannot delete Admin or Super Admin users");
          }
        } else if (ctx.user.role !== "super_admin") {
          throw new Error("Insufficient permissions");
        }

        await db.delete(phoneUsers).where(eq(phoneUsers.id, userIdNum));
        return { success: true, message: "User deleted" };
      } catch (error: any) {
        console.error("[Admin] Failed to delete user:", error);
        throw new Error(error.message || "Failed to delete user");
      }
    }),
  
  /**
   * Delete all clients except Super Admin (DESTRUCTIVE - use with caution)
   */
  deleteAllClientsExceptSuperAdmin: adminProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
      throw new Error("Insufficient permissions");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Find Super Admin user
      const superAdmin = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"))
        .then((res: any) => res[0]);

      if (!superAdmin) {
        throw new Error("Super Admin user not found");
      }

      console.log("[Admin] Deleting all clients except Super Admin:", superAdmin.id);

      // Delete all phoneUsers except Super Admin
      console.log("[Admin] Deleting phoneUsers...");
      await db
        .delete(phoneUsers)
        .where(ne(phoneUsers.id, superAdmin.id));

      // Delete all related data (forms, documents, etc.)
      console.log("[Admin] Deleting related data...");
      await db.delete(factFindingForms).where(ne(factFindingForms.phoneUserId, superAdmin.id));
      await db.delete(clientDocuments).where(ne(clientDocuments.phoneUserId, superAdmin.id));
      await db.delete(userProducts).where(ne(userProducts.phoneUserId, superAdmin.id));
      await db.delete(policyAssignments).where(ne(policyAssignments.phoneUserId, superAdmin.id));

      // Delete all users except Super Admin
      console.log("[Admin] Deleting users...");
      await db
        .delete(users)
        .where(and(
          // Keep the Super Admin
          ne(users.id, superAdmin.id),
          // Also keep the current admin performing the deletion
          ne(users.id, ctx.user.id)
        ));

      console.log("[Admin] Deletion complete");

      // Get remaining users
      const remaining = await db.select().from(users);
      const remainingPhoneUsers = await db.select().from(phoneUsers);

      return {
        success: true,
        message: `Deleted all clients. ${remaining.length} users and ${remainingPhoneUsers.length} phone users remaining.`,
        remainingUsers: remaining.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
        })),
      };
    } catch (error: any) {
      console.error("[Admin] Failed to delete all clients:", error);
      throw new Error(error.message || "Failed to delete clients");
    }
  }),
});
