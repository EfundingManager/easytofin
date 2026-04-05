import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { phoneUsers, policyAssignments, factFindingForms } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { notifyAdminPolicyAssigned } from "../_core/adminNotification";

export const workflowRouter = router({
  getClientsQueue: adminProcedure
    .input(z.object({ page: z.number().int().positive().default(1), limit: z.number().int().positive().max(100).default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { clients: [], total: 0, page: input.page, limit: input.limit };
      try {
        const offset = (input.page - 1) * input.limit;
        const queueClients: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "queue")).limit(input.limit).offset(offset);
        const totalResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "queue"));
        return {
          clients: queueClients.map((client: any) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            loginMethod: client.loginMethod,
            verified: client.verified === "true",
            createdAt: client.createdAt,
          })),
          total: totalResult.length,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("[Workflow] Failed to get clients queue:", error);
        return { clients: [], total: 0, page: input.page, limit: input.limit };
      }
    }),

  getCustomers: adminProcedure
    .input(z.object({ page: z.number().int().positive().default(1), limit: z.number().int().positive().max(100).default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { customers: [], total: 0, page: input.page, limit: input.limit };
      try {
        const offset = (input.page - 1) * input.limit;
        const customers: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "customer")).limit(input.limit).offset(offset);
        const totalResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "customer"));
        const customersWithPolicies = await Promise.all(
          customers.map(async (customer: any) => {
            const policies: any = await db.select().from(policyAssignments).where(eq(policyAssignments.phoneUserId, customer.id));
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              verified: customer.verified === "true",
              policies: policies.map((p: any) => ({ policyNumber: p.policyNumber, product: p.product, insurerName: p.insurerName, premiumAmount: p.premiumAmount, startDate: p.startDate })),
              createdAt: customer.createdAt,
            };
          })
        );
        return { customers: customersWithPolicies, total: totalResult.length, page: input.page, limit: input.limit };
      } catch (error) {
        console.error("[Workflow] Failed to get customers:", error);
        return { customers: [], total: 0, page: input.page, limit: input.limit };
      }
    }),

  updateClientStatus: adminProcedure
    .input(z.object({ clientId: z.number().int().positive(), status: z.enum(["queue", "in_progress", "assigned", "customer"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        await db.update(phoneUsers).set({ clientStatus: input.status, updatedAt: new Date() }).where(eq(phoneUsers.id, input.clientId));
        return { success: true };
      } catch (error) {
        console.error("[Workflow] Failed to update client status:", error);
        throw error;
      }
    }),

  assignPolicy: adminProcedure
    .input(z.object({
      clientId: z.number().int().positive(),
      policyNumber: z.string().min(1).max(100),
      product: z.enum(["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]),
      insurerName: z.string().optional(),
      premiumAmount: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        // Check if customer has verified KYC status
        const clientResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.clientId));
        if (!clientResult || clientResult.length === 0) {
          throw new Error("Customer not found");
        }
        
        const client = clientResult[0];
        if (client.kycStatus !== "verified") {
          throw new Error(`KYC verification required. Current status: ${client.kycStatus}`);
        }
        
        await db.insert(policyAssignments).values({
          phoneUserId: input.clientId,
          policyNumber: input.policyNumber,
          product: input.product,
          insurerName: input.insurerName,
          premiumAmount: input.premiumAmount,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
        });
        await db.update(phoneUsers).set({ clientStatus: "customer", updatedAt: new Date() }).where(eq(phoneUsers.id, input.clientId));
        await db.update(factFindingForms).set({ policyNumber: input.policyNumber, policyAssignedAt: new Date(), updatedAt: new Date() }).where(eq(factFindingForms.phoneUserId, input.clientId));
        
        // Get client info for notification
        const clientForNotification: any = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.clientId));
        if (clientForNotification && clientForNotification.length > 0) {
          const clientNotif = clientForNotification[0];
          try {
            await notifyAdminPolicyAssigned(
              clientNotif.name || 'Client',
              input.policyNumber,
              input.product,
              input.insurerName || 'N/A'
            );
          } catch (error) {
            console.error('[Workflow] Failed to send policy assignment notification:', error);
          }
        }
        
        return { success: true, policyNumber: input.policyNumber };
      } catch (error) {
        console.error("[Workflow] Failed to assign policy:", error);
        throw error;
      }
    }),

  getClientDetails: adminProcedure
    .input(z.object({ clientId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      try {
        const clientDetailsResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.id, input.clientId));
        if (clientDetailsResult.length === 0) return null;
        const client = clientDetailsResult[0];
        const forms: any = await db.select().from(factFindingForms).where(eq(factFindingForms.phoneUserId, input.clientId));
        const policies: any = await db.select().from(policyAssignments).where(eq(policyAssignments.phoneUserId, input.clientId));
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          verified: client.verified === "true",
          status: client.clientStatus,
          loginMethod: client.loginMethod,
          forms: forms.map((f: any) => ({ id: f.id, product: f.product, status: f.status, submittedAt: f.submittedAt, policyNumber: f.policyNumber })),
          policies: policies.map((p: any) => ({ policyNumber: p.policyNumber, product: p.product, insurerName: p.insurerName, premiumAmount: p.premiumAmount, startDate: p.startDate, endDate: p.endDate, notes: p.notes, assignedAt: p.assignedAt })),
          createdAt: client.createdAt,
        };
      } catch (error) {
        console.error("[Workflow] Failed to get client details:", error);
        return null;
      }
    }),

  getWorkflowStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { queueCount: 0, inProgressCount: 0, assignedCount: 0, customerCount: 0 };
    try {
      const queueResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "queue"));
      const inProgressResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "in_progress"));
      const assignedResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "assigned"));
      const customerResult: any = await db.select().from(phoneUsers).where(eq(phoneUsers.clientStatus, "customer"));
      return { queueCount: queueResult.length, inProgressCount: inProgressResult.length, assignedCount: assignedResult.length, customerCount: customerResult.length };
    } catch (error) {
      console.error("[Workflow] Failed to get workflow stats:", error);
      return { queueCount: 0, inProgressCount: 0, assignedCount: 0, customerCount: 0 };
    }
  }),
});
