import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { featureFlags } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const featureFlagsRouter = {
  /**
   * Get all feature flags (public - for frontend to check visibility)
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const flags = await db
      .select({
        flagName: featureFlags.flagName,
        enabled: featureFlags.enabled,
        targetAudience: featureFlags.targetAudience,
        rolloutPercentage: featureFlags.rolloutPercentage,
      })
      .from(featureFlags);

    // Convert to object for easy lookup
    const result: Record<string, { enabled: boolean; targetAudience: string; rolloutPercentage: number }> = {};
    flags.forEach((flag: any) => {
      result[flag.flagName] = {
        enabled: flag.enabled === "true",
        targetAudience: flag.targetAudience || "all",
        rolloutPercentage: flag.rolloutPercentage || 100,
      };
    });

    return result;
  }),

  /**
   * Get a specific feature flag
   */
  getFlag: publicProcedure
    .input(z.object({ flagName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const flag = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.flagName, input.flagName))
        .limit(1);

      if (!flag || flag.length === 0) {
        return null;
      }

      return {
        ...flag[0],
        enabled: (flag[0] as any).enabled === "true",
      };
    }),

  /**
   * Check if a feature flag is enabled (for frontend)
   */
  isEnabled: publicProcedure
    .input(z.object({ flagName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const flag = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.flagName, input.flagName))
        .limit(1);

      if (!flag || flag.length === 0) {
        return false;
      }

      return (flag[0] as any).enabled === "true";
    }),

  /**
   * Get all feature flags with full details (admin only)
   */
  getAllDetailed: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const flags = await db.select().from(featureFlags);
    return flags.map((flag: any) => ({
      ...flag,
      enabled: flag.enabled === "true",
    }));
  }),

  /**
   * Update a feature flag (admin only)
   */
  updateFlag: adminProcedure
    .input(
      z.object({
        flagName: z.string(),
        enabled: z.boolean().optional(),
        targetAudience: z.string().optional(),
        rolloutPercentage: z.number().min(0).max(100).optional(),
        changeReason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updates: Record<string, any> = {
        updatedAt: new Date(),
        changedBy: ctx.user.id,
      };

      if (input.enabled !== undefined) {
        updates.enabled = input.enabled ? "true" : "false";
      }

      if (input.targetAudience !== undefined) {
        updates.targetAudience = input.targetAudience;
      }

      if (input.rolloutPercentage !== undefined) {
        updates.rolloutPercentage = input.rolloutPercentage;
      }

      if (input.changeReason !== undefined) {
        updates.changeReason = input.changeReason;
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db
        .update(featureFlags)
        .set(updates)
        .where(eq(featureFlags.flagName, input.flagName));

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Feature flag '${input.flagName}' not found`,
        });
      }

      return {
        success: true,
        message: `Feature flag '${input.flagName}' updated successfully`,
      };
    }),

  /**
   * Create a new feature flag (admin only)
   */
  createFlag: adminProcedure
    .input(
      z.object({
        flagName: z.string(),
        description: z.string().optional(),
        enabled: z.boolean().default(false),
        targetAudience: z.string().default("all"),
        rolloutPercentage: z.number().min(0).max(100).default(100),
        changeReason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.insert(featureFlags).values({
          flagName: input.flagName,
          description: input.description,
          enabled: input.enabled ? "true" : "false",
          targetAudience: input.targetAudience,
          rolloutPercentage: input.rolloutPercentage,
          changedBy: ctx.user.id,
          changeReason: input.changeReason,
        });

        return {
          success: true,
          message: `Feature flag '${input.flagName}' created successfully`,
        };
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Feature flag '${input.flagName}' already exists`,
          });
        }
        throw error;
      }
    }),

  /**
   * Delete a feature flag (admin only)
   */
  deleteFlag: adminProcedure
    .input(z.object({ flagName: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db
        .delete(featureFlags)
        .where(eq(featureFlags.flagName, input.flagName));

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Feature flag '${input.flagName}' not found`,
        });
      }

      return {
        success: true,
        message: `Feature flag '${input.flagName}' deleted successfully`,
      };
    }),
};
