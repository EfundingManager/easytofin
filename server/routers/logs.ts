import { router, protectedProcedure, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dbLogs from "../db-logs";
import { logger } from "../_core/logger";

export const logsRouter = router({
  /**
   * Public endpoint for clients to report errors
   */
  reportError: publicProcedure
    .input(
      z.object({
        message: z.string(),
        stack: z.string().optional(),
        context: z.string().optional(),
        url: z.string().optional(),
        userAgent: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await logger.error(input.message, {
          req: ctx.req,
          userId: ctx.user?.id,
          metadata: {
            clientStack: input.stack,
            clientContext: input.context,
            clientUrl: input.url,
            clientUserAgent: input.userAgent,
            ...input.metadata,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("[logsRouter] Failed to report error:", error);
        return { success: false };
      }
    }),

  /**
   * Admin endpoint to view recent logs
   */
  getRecentLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
        level: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),
        context: z.string().optional(),
        hoursAgo: z.number().min(1).max(720).default(24),
      })
    )
    .query(async ({ input }) => {
      const logs = await dbLogs.getRecentLogs(
        input.limit,
        input.level,
        input.context,
        input.hoursAgo
      );

      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    }),

  /**
   * Admin endpoint to view error logs
   */
  getErrorLogs: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(1000).default(50) }))
    .query(async ({ input }) => {
      const logs = await dbLogs.getErrorLogs(input.limit);

      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    }),

  /**
   * Admin endpoint to view logs for a specific user
   */
  getUserLogs: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(1000).default(50),
      })
    )
    .query(async ({ input }) => {
      const logs = await dbLogs.getUserLogs(input.userId, input.limit);

      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    }),

  /**
   * Admin endpoint to view logs for a specific phone user
   */
  getPhoneUserLogs: adminProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        limit: z.number().min(1).max(1000).default(50),
      })
    )
    .query(async ({ input }) => {
      const logs = await dbLogs.getPhoneUserLogs(input.phoneUserId, input.limit);

      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    }),

  /**
   * Admin endpoint to view logs for a specific request
   */
  getRequestLogs: adminProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ input }) => {
      const logs = await dbLogs.getRequestLogs(input.requestId);

      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    }),

  /**
   * Admin endpoint to get log statistics
   */
  getStatistics: adminProcedure
    .input(z.object({ hoursAgo: z.number().min(1).max(720).default(24) }))
    .query(async ({ input }) => {
      const stats = await dbLogs.getLogStatistics(input.hoursAgo);

      return {
        success: true,
        data: stats,
      };
    }),
});
