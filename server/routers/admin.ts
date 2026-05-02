import { adminProcedure, managerProcedure, staffProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { phoneUsers, users, userProducts, factFindingForms, policyAssignments, clientDocuments, userRoles, firstLoginTracking, userManagementAuditLog } from "../../drizzle/schema";
import { eq, desc, and, inArray, or, like, ne } from "drizzle-orm";
import { z } from "zod";
import { getRateLimitViolations, whitelistIdentifier, resetRateLimit, getRateLimitStats } from "../rate-limit-logger";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { sendKycApprovalEmail, sendKycRejectionEmail } from "../_core/emailService";
import { ENV } from "../_core/env";


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

      const forms = await db
        .select({
          id: factFindingForms.id,
          product: factFindingForms.product,
        })
        .from(factFindingForms);
      forms.forEach((form: any) => {
        if (form.product === "protection") stats.protection++;
        else if (form.product === "pensions") stats.pensions++;
        else if (form.product === "healthInsurance") stats.healthInsurance++;
        else if (form.product === "generalInsurance") stats.generalInsurance++;
        else if (form.product === "investments") stats.investments++;
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
    if (!db) return { reviews: [], total: 0 };

    try {
      const reviews = await db
        .select({
          id: factFindingForms.id,
          phoneUserId: factFindingForms.phoneUserId,
          clientName: phoneUsers.name,
          clientEmail: phoneUsers.email,
          clientPhone: phoneUsers.phone,
          product: factFindingForms.product,
          status: factFindingForms.status,
          formData: factFindingForms.formData,
          submittedAt: factFindingForms.submittedAt,
          createdAt: factFindingForms.createdAt,
        })
        .from(factFindingForms)
        .innerJoin(phoneUsers, eq(factFindingForms.phoneUserId, phoneUsers.id))
        .where(eq(factFindingForms.status, "submitted"))
        .orderBy(desc(factFindingForms.createdAt)) as any;

      return {
        reviews: reviews.map((row: any) => ({
          id: row.id,
          phoneUserId: row.phoneUserId,
          clientName: row.clientName,
          clientEmail: row.clientEmail,
          clientPhone: row.clientPhone,
          product: row.product,
          status: row.status,
          formData: row.formData,
          submittedAt: row.submittedAt,
          createdAt: row.createdAt,
        })),
        total: reviews.length,
      };
    } catch (error: any) {
      console.error("[Admin] Failed to get KYC reviews:", error);
      return { reviews: [], total: 0 };
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
        .select({
          id: factFindingForms.id,
          userId: factFindingForms.userId,
          phoneUserId: factFindingForms.phoneUserId,
          policyNumber: factFindingForms.policyNumber,
          product: factFindingForms.product,
          formData: factFindingForms.formData,
          status: factFindingForms.status,
          submittedAt: factFindingForms.submittedAt,
          policyAssignedAt: factFindingForms.policyAssignedAt,
          createdAt: factFindingForms.createdAt,
          updatedAt: factFindingForms.updatedAt,
        })
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
      const forms = await db
        .select({
          id: factFindingForms.id,
          userId: factFindingForms.userId,
          phoneUserId: factFindingForms.phoneUserId,
          policyNumber: factFindingForms.policyNumber,
          product: factFindingForms.product,
          formData: factFindingForms.formData,
          status: factFindingForms.status,
          submittedAt: factFindingForms.submittedAt,
          policyAssignedAt: factFindingForms.policyAssignedAt,
          createdAt: factFindingForms.createdAt,
          updatedAt: factFindingForms.updatedAt,
        })
        .from(factFindingForms);
      return forms;
    } catch (error: any) {
      console.error("[Admin] Failed to get forms:", error);
      return [];
    }
  }),

  /**
   * Get client submissions with pagination and search
   */
  getClientSubmissions: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { submissions: [], total: 0, limit: input.limit, page: input.page };

      try {
        // Get clients who have submitted forms
        let query = db
          .selectDistinct({
            id: phoneUsers.id,
            name: phoneUsers.name,
            email: phoneUsers.email,
            phone: phoneUsers.phone,
            verified: phoneUsers.verified,
            createdAt: phoneUsers.createdAt,
          })
          .from(phoneUsers)
          .innerJoin(factFindingForms, eq(phoneUsers.id, factFindingForms.phoneUserId)) as any;

        // Apply search filter if provided
        if (input.search) {
          query = query.where(
            or(
              like(phoneUsers.email, `%${input.search}%`),
              like(phoneUsers.phone, `%${input.search}%`),
              like(phoneUsers.name, `%${input.search}%`)
            )
          );
        }

        // Get total count
        let countQuery = db
          .selectDistinct({ id: phoneUsers.id })
          .from(phoneUsers)
          .innerJoin(factFindingForms, eq(phoneUsers.id, factFindingForms.phoneUserId));
        
        if (input.search) {
          countQuery = countQuery.where(
            or(
              like(phoneUsers.email, `%${input.search}%`),
              like(phoneUsers.phone, `%${input.search}%`),
              like(phoneUsers.name, `%${input.search}%`)
            )
          );
        }
        const countResult = await countQuery;
        const total = countResult.length;

        // Apply pagination
        const offset = (input.page - 1) * input.limit;
        const submissions = await query
          .orderBy(desc(phoneUsers.createdAt))
          .limit(input.limit)
          .offset(offset);

        return {
          submissions: submissions.map((row: any) => {
            // Handle both flat and nested result structures
            const phoneUserData = row.phoneUsers || row;
            return {
              id: phoneUserData.id || row.id,
              name: phoneUserData.name || row.name,
              email: phoneUserData.email || row.email,
              phone: phoneUserData.phone || row.phone,
              verified: phoneUserData.verified || row.verified,
              createdAt: phoneUserData.createdAt || row.createdAt,
            };
          }),
          total,
          limit: input.limit,
          page: input.page,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to get client submissions:", error);
        return { submissions: [], total: 0, limit: input.limit, page: input.page };
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
   * Old deleteUser - removed (replaced by new implementation below)
   */
  /**
   * Delete all clients except Super Adminin (DESTRUCTIVE - use with caution)
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

  /**
   * Create a new user with roles
   */
  createUser: adminProcedure
    .input(z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      name: z.string(),
      roles: z.array(z.enum(["super_admin", "admin", "manager", "staff", "support", "user", "customer"])),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Check if user already exists (select only existing columns to avoid schema mismatch)
        const existingUser = await db.select({ id: phoneUsers.id, email: phoneUsers.email }).from(phoneUsers).where(eq(phoneUsers.email, input.email));
        if (existingUser.length > 0) {
          throw new Error("User with this email already exists");
        }

        // Create phoneUser
        const result = await db.insert(phoneUsers).values({
          email: input.email,
          phone: input.phone,
          name: input.name,
          role: "user", // Default role
          verified: "true",
          emailVerified: "true",
        });

        const phoneUserId = (result as any)[0]?.id || (result as any).insertId;
        if (!phoneUserId) throw new Error("Failed to create user");

        // Update the user's role in phoneUsers table
        const primaryRole = input.roles[0] || "user";
        await db.update(phoneUsers).set({ role: primaryRole }).where(eq(phoneUsers.id, phoneUserId));

        // Try to assign roles to userRoles table (if it exists)
        try {
          for (const role of input.roles) {
            await db.insert(userRoles).values({
              phoneUserId,
              role,
              assignedBy: ctx.user.id,
            });
          }
        } catch (roleError: any) {
          console.debug(`[Admin] userRoles table not available, roles stored in phoneUsers.role`);
        }

        // Try to initialize first login tracking (if table exists)
        try {
          const requiresTOTP = ["super_admin", "admin", "manager", "staff", "support"].includes(input.roles[0]);
          await db.insert(firstLoginTracking).values({
            phoneUserId,
            requiresTOTP2FA: requiresTOTP ? "true" : "false",
          });
        } catch (trackingError: any) {
          console.debug(`[Admin] firstLoginTracking table not available`);
        }

        return {
          success: true,
          userId: phoneUserId,
          message: `User ${input.name} created successfully with roles: ${input.roles.join(", ")}`,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to create user:", error);
        throw new Error(error.message || "Failed to create user");
      }
    }),

  /**
   * Assign roles to an existing user with role-based permission checks
   */
  assignRoles: adminProcedure
    .input(z.object({
      phoneUserId: z.number(),
      roles: z.array(z.enum(["super_admin", "admin", "manager", "staff", "support", "user", "customer"])),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Import permission helpers
        const { canAssignRoles, isProtectedRole } = await import("../role-permissions");

        // Check if user exists
        const user = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.phoneUserId));
        if (user.length === 0) throw new Error("User not found");
        
        const targetRole = user[0].role as any;
        const targetUserId = user[0].id;
        const loggedInUserId = ctx.user.id;
        const loggedInRole = ctx.user.role as any;
        const newRoles = input.roles as any[];

        // Check 1: Cannot assign roles to self
        if (loggedInUserId === targetUserId) {
          console.warn(`[Admin] Unauthorized role assignment: User ${loggedInUserId} tried to assign roles to themselves`);
          throw new Error("You cannot change your own roles");
        }

        // Check 2: Cannot assign protected roles
        if (newRoles.some(role => isProtectedRole(role))) {
          console.warn(`[Admin] Unauthorized role assignment: User ${loggedInUserId} tried to assign protected roles`);
          throw new Error("You cannot assign Super Admin or Admin roles");
        }

        // Check 3: Verify role hierarchy permission
        if (!canAssignRoles(loggedInRole, loggedInUserId, targetUserId, targetRole, newRoles)) {
          console.warn(`[Admin] Unauthorized role assignment: User ${loggedInUserId} (${loggedInRole}) tried to assign roles to ${targetRole} user ${targetUserId}`);
          throw new Error(`You do not have permission to assign roles to this user`);
        }

        // Delete existing roles
        await db.delete(userRoles).where(eq(userRoles.phoneUserId, input.phoneUserId));

        // Assign new roles
        for (const role of input.roles) {
          await db.insert(userRoles).values({
            phoneUserId: input.phoneUserId,
            role,
            assignedBy: ctx.user.id,
          });
        }

        // Update first login tracking if needed
        const requiresTOTP = input.roles.some(r => ["super_admin", "admin", "manager", "staff", "support"].includes(r));
        const tracking = await db.select().from(firstLoginTracking).where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));
        
        if (tracking.length > 0) {
          await db.update(firstLoginTracking)
            .set({ requiresTOTP2FA: requiresTOTP ? "true" : "false" })
            .where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));
        } else {
          await db.insert(firstLoginTracking).values({
            phoneUserId: input.phoneUserId,
            requiresTOTP2FA: requiresTOTP ? "true" : "false",
          });
        }

        return {
          success: true,
          message: `Roles assigned to user. New roles: ${input.roles.join(", ")}`,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to assign roles:", error);
        throw new Error(error.message || "Failed to assign roles");
      }
    }),

  /**
   * Get all users with their roles
   */
  listUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      // Fetch all active (non-deleted) users
      // Handle case where isDeleted column doesn't exist yet
      let allUsers: any[] = [];
      try {
        allUsers = await db.select({
          id: phoneUsers.id,
          email: phoneUsers.email,
          phone: phoneUsers.phone,
          name: phoneUsers.name,
          role: phoneUsers.role,
          status: phoneUsers.clientStatus,
          createdAt: phoneUsers.createdAt,
        }).from(phoneUsers).where(ne(phoneUsers.isDeleted, "true"));
      } catch (error: any) {
        console.debug(`[Admin] Error fetching users with soft-delete filter, using fallback`);
        // Fallback: fetch all users without any filter
        allUsers = await db.select({
          id: phoneUsers.id,
          email: phoneUsers.email,
          phone: phoneUsers.phone,
          name: phoneUsers.name,
          role: phoneUsers.role,
          status: phoneUsers.clientStatus,
          createdAt: phoneUsers.createdAt,
        }).from(phoneUsers);
      }
      const usersWithRoles = await Promise.all(
        allUsers.map(async (user: any) => {
          let primaryRole = user.role || "user";
          let allRoles = [primaryRole];
          
          try {
            const roles = await db.select().from(userRoles).where(eq(userRoles.phoneUserId, user.id));
            if (roles.length > 0) {
              primaryRole = roles[0].role;
              allRoles = roles.map((r: any) => r.role);
            }
          } catch (roleError: any) {
            console.debug(`[Admin] userRoles table not available, using phoneUsers.role for user ${user.id}`);
          }
          
          return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: primaryRole,
            allRoles: allRoles,
            status: user.status,
            createdAt: user.createdAt,
          };
        })
      );
      return usersWithRoles;
    } catch (error: any) {
      console.error("[Admin] Failed to list users:", error);
      try {
        const allUsers = await db.select().from(phoneUsers);
        return allUsers.map((user: any) => ({
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role || "user",
          allRoles: [user.role || "user"],
          status: user.status,
          createdAt: user.createdAt,
        }));
      } catch (fallbackError: any) {
        console.error("[Admin] Fallback also failed:", fallbackError);
        return [];
      }
    }
  }),

  /**
   * Get all soft-deleted users
   */
  listDeletedUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      // Fetch all soft-deleted users
      let deletedUsers: any[] = [];
      try {
        deletedUsers = await db.select({
          id: phoneUsers.id,
          email: phoneUsers.email,
          phone: phoneUsers.phone,
          name: phoneUsers.name,
          role: phoneUsers.role,
          status: phoneUsers.clientStatus,
          createdAt: phoneUsers.createdAt,
          deletedAt: phoneUsers.deletedAt,
          deletedBy: phoneUsers.deletedBy,
        }).from(phoneUsers).where(eq(phoneUsers.isDeleted, "true"));
      } catch (error: any) {
        console.debug(`[Admin] isDeleted column not available, no deleted users to fetch`);
        deletedUsers = [];
      }
      
      const usersWithRoles = await Promise.all(
        deletedUsers.map(async (user: any) => {
          let primaryRole = user.role || "user";
          let allRoles = [primaryRole];
          
          try {
            const roles = await db.select().from(userRoles).where(eq(userRoles.phoneUserId, user.id));
            if (roles.length > 0) {
              primaryRole = roles[0].role;
              allRoles = roles.map((r: any) => r.role);
            }
          } catch (roleError: any) {
            console.debug(`[Admin] userRoles table not available for deleted user ${user.id}`);
          }
          
          return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: primaryRole,
            allRoles: allRoles,
            status: user.status,
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            deletedBy: user.deletedBy,
          };
        })
      );
      return usersWithRoles;
    } catch (error: any) {
      console.error("[Admin] Failed to list deleted users:", error);
      return [];
    }
  }),

  /**
   * Permanently delete a soft-deleted user (hard delete)
   * This is only available for already soft-deleted users
   */
  permanentlyDeleteUser: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get user details - select only existing columns
        const user = await db
          .select({
            id: phoneUsers.id,
            email: phoneUsers.email,
            phone: phoneUsers.phone,
            name: phoneUsers.name,
            role: phoneUsers.role,
            status: phoneUsers.clientStatus,
            isDeleted: phoneUsers.isDeleted,
          })
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.phoneUserId));
        if (!user || user.length === 0) {
          throw new Error("User not found");
        }

        // Verify user is actually soft-deleted
        if (user[0].isDeleted !== "true") {
          throw new Error("User is not deleted. Only soft-deleted users can be permanently deleted.");
        }

        // Hard delete user from phoneUsers table
        await db.delete(phoneUsers).where(eq(phoneUsers.id, input.phoneUserId));

        // Try to delete user roles (if table exists)
        try {
          await db.delete(userRoles).where(eq(userRoles.phoneUserId, input.phoneUserId));
        } catch (roleError: any) {
          console.debug(`[Admin] userRoles table not available for permanent deletion`);
        }

        // Try to delete first login tracking (if table exists)
        try {
          await db.delete(firstLoginTracking).where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));
        } catch (trackingError: any) {
          console.debug(`[Admin] firstLoginTracking table not available for permanent deletion`);
        }

        return {
          success: true,
          message: `User ${user[0].name} permanently deleted`,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to permanently delete user:", error);
        throw new Error(error.message || "Failed to permanently delete user");
      }
    }),

  /**
   * Get user details with roles
   */
  getUserDetails: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const user = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.phoneUserId));
        if (user.length === 0) throw new Error("User not found");

        const roles = await db.select().from(userRoles).where(eq(userRoles.phoneUserId, input.phoneUserId));
        const tracking = await db.select().from(firstLoginTracking).where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));

        return {
          id: user[0].id,
          email: user[0].email,
          phone: user[0].phone,
          name: user[0].name,
          roles: roles.map((r: any) => r.role),
          verified: user[0].verified,
          requiresTOTP2FA: tracking[0]?.requiresTOTP2FA === "true",
          totpSetupCompleted: tracking[0]?.totpSetupCompletedAt ? true : false,
          createdAt: user[0].createdAt,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to get user details:", error);
        throw new Error(error.message || "Failed to get user details");
      }
    }),

  /**
   * Delete a user with role-based permission checks
   */
  deleteUser: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Import permission helpers
        const { canDeleteUser, isProtectedRole } = await import("../role-permissions");

        // Get target user - select only existing columns to avoid schema mismatch
        const user = await db
          .select({
            id: phoneUsers.id,
            email: phoneUsers.email,
            phone: phoneUsers.phone,
            name: phoneUsers.name,
            role: phoneUsers.role,
            status: phoneUsers.clientStatus,
          })
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.phoneUserId));
        if (user.length === 0) throw new Error("User not found");
        
        const targetRole = user[0].role as any;
        const targetUserId = user[0].id;
        const loggedInUserId = ctx.user.id;
        const loggedInRole = ctx.user.role as any;

        // Check 1: Cannot delete self
        if (loggedInUserId === targetUserId) {
          console.warn(`[Admin] Unauthorized delete attempt: User ${loggedInUserId} tried to delete themselves`);
          throw new Error("You cannot delete your own account");
        }

        // Check 2: Cannot delete protected roles
        if (isProtectedRole(targetRole)) {
          console.warn(`[Admin] Unauthorized delete attempt: User ${loggedInUserId} (${loggedInRole}) tried to delete protected role ${targetRole}`);
          throw new Error(`Cannot delete ${targetRole} accounts. This role is protected.`);
        }

        // Check 3: Verify role hierarchy permission
        if (!canDeleteUser(loggedInRole, loggedInUserId, targetUserId, targetRole)) {
          console.warn(`[Admin] Unauthorized delete attempt: User ${loggedInUserId} (${loggedInRole}) tried to delete ${targetRole} user ${targetUserId}`);
          throw new Error(`You do not have permission to delete ${targetRole} accounts`);
        }

        // Try to delete user roles (if table exists)
        try {
          await db.delete(userRoles).where(eq(userRoles.phoneUserId, input.phoneUserId));
        } catch (roleError: any) {
          console.debug(`[Admin] userRoles table not available for deletion`);
        }

        // Try to delete first login tracking (if table exists)
        try {
          await db.delete(firstLoginTracking).where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));
        } catch (trackingError: any) {
          console.debug(`[Admin] firstLoginTracking table not available for deletion`);
        }

        // Soft delete user from phoneUsers table
        // Mark as deleted instead of removing the record
        const deletedAt = new Date();
        await db
          .update(phoneUsers)
          .set({
            isDeleted: "true",
            deletedAt: deletedAt.getTime(),
            deletedBy: ctx.user.email,
          })
          .where(eq(phoneUsers.id, input.phoneUserId));

        // Log the deletion in audit log
        try {
          await db.insert(userManagementAuditLog).values({
            phoneUserId: input.phoneUserId,
            actionType: "delete",
            actionBy: ctx.user.id,
            actionByEmail: ctx.user.email,
            targetUserEmail: user[0].email,
            targetUserName: user[0].name,
            changeDetails: `Deleted ${targetRole} user`,
            status: "success",
            createdAt: new Date(),
          });
        } catch (auditError: any) {
          console.debug(`[Admin] Failed to log deletion in audit log:`, auditError);
        }

        return {
          success: true,
          message: `User ${user[0].name} deleted successfully`,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to delete user:", error);
        throw new Error(error.message || "Failed to delete user");
      }
    }),

  /**
   * Restore a soft-deleted user
   */
  restoreUser: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get user details - select only existing columns
        const user = await db
          .select({
            id: phoneUsers.id,
            email: phoneUsers.email,
            phone: phoneUsers.phone,
            name: phoneUsers.name,
            role: phoneUsers.role,
            status: phoneUsers.clientStatus,
          })
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.phoneUserId));
        if (!user || user.length === 0) {
          throw new Error("User not found");
        }

        // Restore user by clearing soft-delete fields
        await db
          .update(phoneUsers)
          .set({
            isDeleted: "false",
            deletedAt: null,
            deletedBy: null,
          })
          .where(eq(phoneUsers.id, input.phoneUserId));

        return {
          success: true,
          message: `User ${user[0].name} restored successfully`,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to restore user:", error);
        throw new Error(error.message || "Failed to restore user");
      }
    }),

  /**
   * Generate TOTP secret and QR code for 2FA setup
   */
  generateTotpSecret: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Generate TOTP secret
        const secret = speakeasy.generateSecret({
          name: `EasyToFin (${input.phoneUserId})`,
          issuer: "EasyToFin",
          length: 32,
        });

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

        // Generate 8 backup codes
        const backupCodes = Array.from({ length: 8 }, () =>
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );

        return {
          secret: secret.base32,
          qrCode,
          backupCodes,
          otpauthUrl: secret.otpauth_url,
        };
      } catch (error: any) {
        console.error("[TOTP] Failed to generate secret:", error);
        throw new Error("Failed to generate TOTP secret");
      }
    }),

  /**
   * Verify TOTP code and save secret if valid
   */
  verifyAndSaveTotpSecret: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        totpCode: z.string(),
        secret: z.string(),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Verify TOTP code
        const isValid = speakeasy.totp.verify({
          secret: input.secret,
          encoding: "base32",
          token: input.totpCode,
          window: 2,
        });

        if (!isValid) {
          // Log failed attempt
          await db.insert(totp2faAuditLog).values({
            phoneUserId: input.phoneUserId,
            eventType: "verification_failed",
            code: input.totpCode,
            isValid: "false",
          });
          throw new Error("Invalid TOTP code");
        }

        // Save TOTP secret
        await db
          .insert(totpSecrets)
          .values({
            phoneUserId: input.phoneUserId,
            secret: input.secret,
            backupCodes: JSON.stringify(input.backupCodes),
            isEnabled: "true",
          })
          .onDuplicateKeyUpdate({
            set: {
              secret: input.secret,
              backupCodes: JSON.stringify(input.backupCodes),
              isEnabled: "true",
            },
          });

        // Mark first login as complete
        await db
          .insert(firstLoginTracking)
          .values({
            phoneUserId: input.phoneUserId,
            hasCompletedFirstLogin: "true",
            requiresTOTP2FA: "true",
            totpSetupCompletedAt: new Date(),
          })
          .onDuplicateKeyUpdate({
            set: {
              hasCompletedFirstLogin: "true",
              requiresTOTP2FA: "true",
              totpSetupCompletedAt: new Date(),
            },
          });

        // Log successful setup
        await db.insert(totp2faAuditLog).values({
          phoneUserId: input.phoneUserId,
          eventType: "setup_completed",
          isValid: "true",
        });

        return {
          success: true,
          message: "TOTP 2FA setup completed successfully",
        };
      } catch (error: any) {
        console.error("[TOTP] Failed to verify and save secret:", error);
        throw new Error(error.message || "Failed to setup TOTP 2FA");
      }
    }),

  /**
   * Verify TOTP code during login
   */
  verifyTotpCode: adminProcedure
    .input(z.object({ phoneUserId: z.number(), totpCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get TOTP secret
        const totpRecord = await db
          .select()
          .from(totpSecrets)
          .where(eq(totpSecrets.phoneUserId, input.phoneUserId))
          .limit(1);

        if (!totpRecord || totpRecord.length === 0) {
          throw new Error("TOTP 2FA not configured");
        }

        const secret = totpRecord[0].secret;
        const backupCodes = JSON.parse(totpRecord[0].backupCodes || "[]");

        // Check if it's a backup code
        if (backupCodes.includes(input.totpCode)) {
          // Remove used backup code
          const updatedBackupCodes = backupCodes.filter(
            (code: string) => code !== input.totpCode
          );
          await db
            .update(totpSecrets)
            .set({ backupCodes: JSON.stringify(updatedBackupCodes) })
            .where(eq(totpSecrets.phoneUserId, input.phoneUserId));

          // Log backup code usage
          await db.insert(totp2faAuditLog).values({
            phoneUserId: input.phoneUserId,
            eventType: "backup_code_used",
            isValid: "true",
          });

          return { success: true, message: "Authentication successful" };
        }

        // Verify TOTP code
        const isValid = speakeasy.totp.verify({
          secret,
          encoding: "base32",
          token: input.totpCode,
          window: 2,
        });

        if (!isValid) {
          // Log failed attempt
          await db.insert(totp2faAuditLog).values({
            phoneUserId: input.phoneUserId,
            eventType: "verification_failed",
            code: input.totpCode,
            isValid: "false",
          });
          throw new Error("Invalid TOTP code");
        }

        // Log successful verification
        await db.insert(totp2faAuditLog).values({
          phoneUserId: input.phoneUserId,
          eventType: "verification_success",
          code: input.totpCode,
          isValid: "true",
        });

        return { success: true, message: "Authentication successful" };
      } catch (error: any) {
        console.error("[TOTP] Failed to verify code:", error);
        throw new Error(error.message || "Failed to verify TOTP code");
      }
    }),

  /**
   * Reset TOTP 2FA for a user (Super Admin only)
   */
  resetTotpForUser: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Delete TOTP secret
        await db.delete(totpSecrets).where(eq(totpSecrets.phoneUserId, input.phoneUserId));

        // Reset first login tracking
        await db
          .update(firstLoginTracking)
          .set({
            hasCompletedFirstLogin: "false",
            requiresTOTP2FA: "false",
            totpSetupCompletedAt: null,
          })
          .where(eq(firstLoginTracking.phoneUserId, input.phoneUserId));

        // Log TOTP reset
        await db.insert(totp2faAuditLog).values({
          phoneUserId: input.phoneUserId,
          eventType: "reset_completed",
          isValid: "true",
        });

        return {
          success: true,
          message: "TOTP 2FA reset successfully",
        };
      } catch (error: any) {
        console.error("[TOTP] Failed to reset TOTP:", error);
        throw new Error(error.message || "Failed to reset TOTP 2FA");
      }
    }),
  /**
   * Get TOTP status for a user (for frontend redirect logic)
   */
  getTotpStatus: adminProcedure
    .input(z.object({ phoneUserId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      try {
        let totpSecretData: any = null;
        let firstLoginTrackingData: any = null;

        // Try to get TOTP secret (if table exists)
        try {
          totpSecretData = await db.query.totpSecrets.findFirst({
            where: eq(totpSecrets.phoneUserId, input.phoneUserId),
          });
        } catch (e: any) {
          console.debug("[TOTP] totpSecrets table not available");
        }

        // Try to get first login tracking (if table exists)
        try {
          firstLoginTrackingData = await db.query.firstLoginTracking.findFirst({
            where: eq(firstLoginTracking.phoneUserId, input.phoneUserId),
          });
        } catch (e: any) {
          console.debug("[TOTP] firstLoginTracking table not available");
        }

        return {
          totpEnabled: totpSecretData?.isEnabled === "true",
          totpSetupCompleted: !!totpSecretData,
          isFirstLogin: firstLoginTrackingData?.hasCompletedFirstLogin !== "true",
          requiresTOTP: firstLoginTrackingData?.requiresTOTP2FA === "true",
        };
      } catch (error: any) {
        console.error("[TOTP] Error getting TOTP status:", error);
        // Return default status if query fails
        return {
          totpEnabled: false,
          totpSetupCompleted: false,
          isFirstLogin: false,
          requiresTOTP: false,
        };
      }
    }),

  /**
   * Get audit trail logs with filtering and pagination
   */
  getAuditLogs: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      actionType: z.string().optional(),
      phoneUserId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      searchQuery: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      try {
        let query = db.select().from(userManagementAuditLog);
        const conditions = [];
        
        if (input.actionType) {
          conditions.push(eq(userManagementAuditLog.actionType, input.actionType as any));
        }
        
        if (input.phoneUserId) {
          conditions.push(eq(userManagementAuditLog.phoneUserId, input.phoneUserId));
        }
        
        if (input.searchQuery) {
          conditions.push(
            or(
              like(userManagementAuditLog.targetUserEmail, `%${input.searchQuery}%`),
              like(userManagementAuditLog.targetUserName, `%${input.searchQuery}%`),
              like(userManagementAuditLog.actionByEmail, `%${input.searchQuery}%`)
            )
          );
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        
        const logs = await query
          .orderBy(desc(userManagementAuditLog.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        
        const totalResult = await db.select({ count: userManagementAuditLog.id }).from(userManagementAuditLog);
        const total = totalResult.length;
        
        return {
          logs,
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error: any) {
        console.error("[Audit] Failed to get audit logs:", error);
        return {
          logs: [],
          total: 0,
          limit: input.limit,
          offset: input.offset,
        };
      }
    }),

  /**
   * Approve a fact-finding form submission
   */
  approveSubmission: adminProcedure
    .input(z.object({
      submissionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Update the submission status to 'reviewed'
        await db
          .update(factFindingForms)
          .set({ status: "reviewed" })
          .where(eq(factFindingForms.id, input.submissionId));

        // Get the submission to retrieve client info for notification
        const submission = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.id, input.submissionId))
          .limit(1);

        if (submission.length === 0) {
          throw new Error("Submission not found");
        }

        const submissionData = submission[0];

        // Get client details for email notification
        const clientResult = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, submissionData.userId))
          .limit(1);

        if (clientResult.length > 0) {
          const client = clientResult[0];
          if (client.email) {
            const dashboardUrl = "https://easytofin.com/dashboard";
            
            // Send approval email
            await sendKycApprovalEmail(
              client.email,
              client.name || "Valued Client",
              submissionData.product || "Your Application",
              dashboardUrl
            );
            
            console.log(`[Admin] Sent approval email to ${client.email}`);
          }
        }

        console.log(`[Admin] Approved submission ${input.submissionId}`);

        return { success: true, message: "Submission approved and client notified" };
      } catch (error: any) {
        console.error("[Admin] Failed to approve submission:", error);
        throw new Error(error.message || "Failed to approve submission");
      }
    }),

  /**
   * Reject a fact-finding form submission
   */
  rejectSubmission: adminProcedure
    .input(z.object({
      submissionId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Update the submission status to 'archived' (or create a 'rejected' status if needed)
        await db
          .update(factFindingForms)
          .set({ status: "archived" })
          .where(eq(factFindingForms.id, input.submissionId));

        // Get the submission to retrieve client info for notification
        const submission = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.id, input.submissionId))
          .limit(1);

        if (submission.length === 0) {
          throw new Error("Submission not found");
        }

        const submissionData = submission[0];

        // Get client details for email notification
        const clientResult = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, submissionData.userId))
          .limit(1);

        if (clientResult.length > 0) {
          const client = clientResult[0];
          if (client.email) {
            const dashboardUrl = "https://easytofin.com/dashboard";
            
            // Send rejection email
            await sendKycRejectionEmail(
              client.email,
              client.name || "Valued Client",
              submissionData.product || "Your Application",
              input.reason,
              dashboardUrl
            );
            
            console.log(`[Admin] Sent rejection email to ${client.email}`);
          }
        }

        console.log(`[Admin] Rejected submission ${input.submissionId}: ${input.reason || 'No reason provided'}`);

        return { success: true, message: "Submission rejected and client notified" };
      } catch (error: any) {
        console.error("[Admin] Failed to reject submission:", error);
        throw new Error(error.message || "Failed to reject submission");
      }
    }),

});
