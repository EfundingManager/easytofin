import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { phoneUsers, userProducts, factFindingForms, policyAssignments, clientDocuments } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

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
      const clientsResult = await db.select().from(phoneUsers);
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
    } catch (error) {
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
   * Get all client submissions with pagination
   */
  getClientSubmissions: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          submissions: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      }

      try {
        let query = db.select().from(phoneUsers);

        // Apply search filter if provided
        if (input.search) {
          // Note: This is a simplified search. For production, consider using full-text search
          const searchTerm = `%${input.search}%`;
          // In a real scenario, you'd use a proper search mechanism
        }

        const offset = (input.page - 1) * input.limit;
        const submissions = await query.limit(input.limit).offset(offset);

        const totalResult = await db.select().from(phoneUsers);
        const total = totalResult.length;

        return {
          submissions: submissions.map((sub) => ({
            id: sub.id,
            name: sub.name || "N/A",
            email: sub.email || "N/A",
            phone: sub.phone || "N/A",
            verified: sub.verified === "true",
            createdAt: sub.createdAt,
            lastSignedIn: sub.lastSignedIn,
          })),
          total,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("[Admin] Failed to get client submissions:", error);
        return {
          submissions: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      }
    }),

  /**
   * Get fact-finding form responses by product
   */
  getFormResponsesByProduct: adminProcedure
    .input(
      z.object({
        product: z.enum([
          "protection",
          "pensions",
          "healthInsurance",
          "generalInsurance",
          "investments",
        ]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          product: input.product,
          responses: [],
          total: 0,
        };
      }

      try {
        const responses = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.product, input.product));

        return {
          product: input.product,
          responses: responses.map((form) => ({
            id: form.id,
            phoneUserId: form.phoneUserId,
            userId: form.userId,
            status: form.status,
            submittedAt: form.submittedAt,
            createdAt: form.createdAt,
            formData: form.formData ? JSON.parse(form.formData) : null,
          })),
          total: responses.length,
        };
      } catch (error) {
        console.error("[Admin] Failed to get form responses:", error);
        return {
          product: input.product,
          responses: [],
          total: 0,
        };
      }
    }),

  /**
   * Get all form responses with pagination
   */
  getAllFormResponses: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(10),
        status: z
          .enum(["draft", "submitted", "reviewed", "archived"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          responses: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      }

      try {
        let query: any = db.select().from(factFindingForms);

        // Apply status filter if provided
        if (input.status) {
          query = query.where(eq(factFindingForms.status, input.status));
        }

        const offset = (input.page - 1) * input.limit;
        const responses = await query
          .orderBy(desc(factFindingForms.submittedAt))
          .limit(input.limit)
          .offset(offset);

        const totalResult: any = await db.select().from(factFindingForms);
        const total = totalResult ? totalResult.length : 0;

        return {
          responses: responses.map((form: any) => ({
            id: form.id,
            product: form.product,
            status: form.status,
            submittedAt: form.submittedAt,
            createdAt: form.createdAt,
          })),
          total,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("[Admin] Failed to get form responses:", error);
        return {
          responses: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      }
    }),

  /**
   * Get detailed form response
   */
  getFormResponse: adminProcedure
    .input(z.object({ formId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return null;
      }

      try {
        const result = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.id, input.formId));

        if (result.length === 0) {
          return null;
        }

        const form = result[0];
        return {
          id: form.id,
          product: form.product,
          status: form.status,
          submittedAt: form.submittedAt,
          createdAt: form.createdAt,
          formData: form.formData ? JSON.parse(form.formData) : null,
          phoneUserId: form.phoneUserId,
          userId: form.userId,
        };
      } catch (error) {
        console.error("[Admin] Failed to get form response:", error);
        return null;
      }
    }),

  /**
   * Update form response status
   */
  updateFormStatus: adminProcedure
    .input(
      z.object({
        formId: z.number().int().positive(),
        status: z.enum(["draft", "submitted", "reviewed", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        await db
          .update(factFindingForms)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(factFindingForms.id, input.formId));

        return { success: true };
      } catch (error) {
        console.error("[Admin] Failed to update form status:", error);
        throw error;
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
      const products = [
        "protection",
        "pensions",
        "healthInsurance",
        "generalInsurance",
        "investments",
      ] as const;

      const stats: Record<string, number> = {};

      for (const product of products) {
        const result = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.product, product));
        stats[product] = result.length;
      }

      return stats;
    } catch (error) {
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
  getRecentActivity: adminProcedure
    .input(z.object({ limit: z.number().int().positive().max(50).default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      try {
        const recentForms = await db
          .select()
          .from(factFindingForms)
          .orderBy(desc(factFindingForms.submittedAt))
          .limit(input.limit);

        return recentForms.map((form) => ({
          id: form.id,
          type: "form_submission",
          product: form.product,
          status: form.status,
          timestamp: form.submittedAt || form.createdAt,
        }));
      } catch (error) {
        console.error("[Admin] Failed to get recent activity:", error);
        return [];
      }
    }),

  /**
   * Get detailed customer information
   */
  getCustomerDetail: adminProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return null;
      }

      try {
        const customer: any = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, input.customerId))
          .then((res) => res[0]);

        if (!customer) {
          return null;
        }

        // Fetch policies from policyAssignments table
        const policies: any = await db
          .select()
          .from(policyAssignments)
          .where(eq(policyAssignments.phoneUserId, input.customerId));

        // Fetch documents from clientDocuments table
        const documents: any = await db
          .select()
          .from(clientDocuments)
          .where(eq(clientDocuments.phoneUserId, input.customerId));

        // Fetch forms from factFindingForms table
        const forms: any = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.phoneUserId, input.customerId));

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || "",
          kycStatus: customer.kycStatus || "pending",
          emailVerified: customer.emailVerified === "true",
          createdAt: customer.createdAt,
          status: customer.clientStatus || "active",
          policies: policies.map((p: any) => ({
            id: p.id,
            policyNumber: p.policyNumber,
            product: p.product,
            insurerName: p.insurerName,
            premium: p.premiumAmount,
            status: "active",
            startDate: p.startDate,
            endDate: p.endDate,
            advisorName: p.advisorName,
            advisorPhone: p.advisorPhone,
          })),
          documents: documents.map((d: any) => ({
            id: d.id,
            documentType: d.documentType,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            status: d.status,
            uploadedAt: d.uploadedAt,
          })),
          forms: forms.map((f: any) => ({
            id: f.id,
            product: f.product,
            status: f.status,
            submittedAt: f.submittedAt,
            policyNumber: f.policyNumber,
          })),
        };
      } catch (error) {
        console.error("[Admin] Failed to get customer details:", error);
        return null;
      }
    }),

  /**
   * Global search by policy number or client name
   */
  globalSearch: adminProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          forms: [],
          clients: [],
          total: 0,
        };
      }

      try {
        // Search forms by policy number
        const formsResult: any = await db.select().from(factFindingForms);
        const matchedForms = formsResult
          .filter((form: any) => form.policyNumber && form.policyNumber.includes(input.query))
          .map((form: any) => ({
            id: form.id,
            type: "form",
            policyNumber: form.policyNumber,
            product: form.product,
            status: form.status,
            submittedAt: form.submittedAt,
          }));

        // Search clients by name
        const clientsResult: any = await db.select().from(phoneUsers);
        const matchedClients = clientsResult
          .filter(
            (client: any) =>
              client.name?.toLowerCase().includes(input.query.toLowerCase()) ||
              client.email?.toLowerCase().includes(input.query.toLowerCase())
          )
          .map((client: any) => ({
            id: client.id,
            type: "client",
            name: client.name,
            email: client.email,
            phone: client.phone,
            verified: client.verified === "true",
          }));

        return {
          forms: matchedForms,
          clients: matchedClients,
          total: matchedForms.length + matchedClients.length,
        };
      } catch (error) {
        console.error("[Admin] Failed to perform global search:", error);
        return {
          forms: [],
          clients: [],
          total: 0,
        };
      }
    }),
  /**
   * Update KYC status for a customer
   */
  updateKycStatus: adminProcedure
    .input(z.object({
      customerId: z.number(),
      kycStatus: z.enum(["pending", "verified", "rejected"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        await db
          .update(phoneUsers)
          .set({ kycStatus: input.kycStatus })
          .where(eq(phoneUsers.id, input.customerId));

        return { success: true, message: `KYC status updated to ${input.kycStatus}` };
      } catch (error) {
        console.error("[Admin] Failed to update KYC status:", error);
        throw new Error("Failed to update KYC status");
      }
    }),
});
