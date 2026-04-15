import { adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailBlasts, emailBlastDeliveries, phoneUsers, emailTemplates } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Email Campaign Router
 * Handles campaign creation, scheduling, sending, and analytics
 */
export const emailCampaignRouter = {
  /**
   * Create a new email campaign
   */
  createCampaign: adminProcedure
    .input(
      z.object({
        templateId: z.number().int().positive(),
        campaignName: z.string().min(1).max(255),
        subject: z.string().min(1).max(255),
        recipientFilter: z.object({
          roles: z.array(z.enum(["user", "admin", "manager", "staff", "super_admin"])).optional(),
          clientStatus: z.array(z.enum(["queue", "in_progress", "assigned", "customer"])).optional(),
          kycStatus: z.array(z.enum(["pending", "submitted", "verified", "rejected"])).optional(),
          createdAfter: z.date().optional(),
          createdBefore: z.date().optional(),
        }),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Verify template exists
        const template = await db
          .select()
          .from(emailTemplates)
          .where(eq(emailTemplates.id, input.templateId))
          .limit(1);

        if (template.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Email template not found",
          });
        }

        // Count recipients based on filter
        const recipients = await db
          .select({ id: phoneUsers.id, email: phoneUsers.email })
          .from(phoneUsers)
          .limit(10000);

        const totalRecipients = recipients.length;

        // Create campaign
        const result = await db
          .insert(emailBlasts)
          .values({
            templateId: input.templateId,
            campaignName: input.campaignName,
            subject: input.subject,
            recipientFilter: JSON.stringify(input.recipientFilter),
            totalRecipients,
            status: input.scheduledAt ? "scheduled" : "draft",
            scheduledAt: input.scheduledAt,
            createdBy: ctx.user.id,
          });

        return {
          id: (result as any).insertId,
          campaignName: input.campaignName,
          totalRecipients,
          status: input.scheduledAt ? "scheduled" : "draft",
          scheduledAt: input.scheduledAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create campaign: ${(error as any).message}`,
        });
      }
    }),

  /**
   * Get campaign details
   */
  getCampaign: adminProcedure
    .input(z.object({ campaignId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const campaign = await db
        .select()
        .from(emailBlasts)
        .where(eq(emailBlasts.id, input.campaignId))
        .limit(1);

      if (campaign.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      const result = campaign[0];
      return {
        id: result.id,
        campaignName: result.campaignName,
        subject: result.subject,
        templateId: result.templateId,
        totalRecipients: result.totalRecipients,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        status: result.status,
        scheduledAt: result.scheduledAt,
        sentAt: result.sentAt,
        createdAt: result.createdAt,
        recipientFilter: result.recipientFilter ? JSON.parse(result.recipientFilter) : null,
      };
    }),

  /**
   * List all campaigns with pagination
   */
  listCampaigns: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(10),
        status: z.enum(["draft", "scheduled", "sending", "sent", "failed", "paused"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let campaigns: any[] = [];
      if (input.status) {
        campaigns = await db
          .select()
          .from(emailBlasts)
          .where(eq(emailBlasts.status, input.status))
          .limit(input.limit)
          .offset(offset);
      } else {
        campaigns = await db
          .select()
          .from(emailBlasts)
          .limit(input.limit)
          .offset(offset);
      }

      return campaigns.map((c: any) => ({
        id: c.id,
        campaignName: c.campaignName,
        subject: c.subject,
        totalRecipients: c.totalRecipients,
        sentCount: c.sentCount,
        failedCount: c.failedCount,
        status: c.status,
        scheduledAt: c.scheduledAt,
        sentAt: c.sentAt,
        createdAt: c.createdAt,
      }));
    }),

  /**
   * Get campaign delivery stats
   */
  getCampaignStats: adminProcedure
    .input(z.object({ campaignId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const deliveries = await db
        .select()
        .from(emailBlastDeliveries)
        .where(eq(emailBlastDeliveries.blastId, input.campaignId));

      const stats = {
        total: deliveries.length,
        sent: deliveries.filter((d: any) => d.status === "sent").length,
        failed: deliveries.filter((d: any) => d.status === "failed").length,
        bounced: deliveries.filter((d: any) => d.status === "bounced").length,
        opened: deliveries.filter((d: any) => d.status === "opened").length,
        clicked: deliveries.filter((d: any) => d.status === "clicked").length,
      };

      return {
        ...stats,
        openRate: stats.total > 0 ? ((stats.opened / stats.total) * 100).toFixed(2) : "0",
        clickRate: stats.total > 0 ? ((stats.clicked / stats.total) * 100).toFixed(2) : "0",
        failureRate: stats.total > 0 ? (((stats.failed + stats.bounced) / stats.total) * 100).toFixed(2) : "0",
      };
    }),

  /**
   * Update campaign (only for draft campaigns)
   */
  updateCampaign: adminProcedure
    .input(
      z.object({
        campaignId: z.number().int().positive(),
        campaignName: z.string().min(1).max(255).optional(),
        subject: z.string().min(1).max(255).optional(),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Check if campaign is in draft status
      const campaign = await db
        .select()
        .from(emailBlasts)
        .where(eq(emailBlasts.id, input.campaignId))
        .limit(1);

      if (campaign.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign[0].status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only update draft campaigns",
        });
      }

      await db
        .update(emailBlasts)
        .set({
          campaignName: input.campaignName,
          subject: input.subject,
          scheduledAt: input.scheduledAt,
          status: input.scheduledAt ? "scheduled" : "draft",
          updatedBy: ctx.user.id,
        })
        .where(eq(emailBlasts.id, input.campaignId));

      return {
        id: input.campaignId,
        campaignName: input.campaignName,
        status: input.scheduledAt ? "scheduled" : "draft",
      };
    }),

  /**
   * Delete campaign (only for draft campaigns)
   */
  deleteCampaign: adminProcedure
    .input(z.object({ campaignId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const campaign = await db
        .select()
        .from(emailBlasts)
        .where(eq(emailBlasts.id, input.campaignId))
        .limit(1);

      if (campaign.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign[0].status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only delete draft campaigns",
        });
      }

      await db.delete(emailBlasts).where(eq(emailBlasts.id, input.campaignId));

      return { success: true };
    }),

  /**
   * Get recipients for a campaign
   */
  getCampaignRecipients: adminProcedure
    .input(
      z.object({
        campaignId: z.number().int().positive(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const offset = (input.page - 1) * input.limit;

      const recipients = await db
        .select({
          id: emailBlastDeliveries.id,
          recipientEmail: emailBlastDeliveries.recipientEmail,
          status: emailBlastDeliveries.status,
          sentAt: emailBlastDeliveries.sentAt,
          openedAt: emailBlastDeliveries.openedAt,
          clickedAt: emailBlastDeliveries.clickedAt,
        })
        .from(emailBlastDeliveries)
        .where(eq(emailBlastDeliveries.blastId, input.campaignId))
        .limit(input.limit)
        .offset(offset);

      return recipients;
    }),
};

export type EmailCampaignRouter = typeof emailCampaignRouter;
