import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  isIpRateLimited,
  recordIpRequest,
  getIpReputation,
  updateIpReputation,
  whitelistIp,
  blacklistIp,
  removeIpFromWhitelist,
  removeIpFromBlacklist,
  isIpWhitelisted,
  isIpBlacklisted,
} from "../services/ipRateLimiter";

export const ipRateLimitRouter = router({
  /**
   * Check if IP is rate limited
   */
  checkRateLimit: publicProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        endpoint: z.string(),
        violationType: z.enum([
          "otp_verification",
          "otp_request",
          "login_attempt",
          "password_reset",
          "account_unlock_request",
        ]),
      })
    )
    .query(async ({ input }) => {
      const result = await isIpRateLimited(
        input.ipAddress,
        input.endpoint,
        input.violationType
      );
      return result;
    }),

  /**
   * Record an IP request
   */
  recordRequest: publicProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        endpoint: z.string(),
        violationType: z.enum([
          "otp_verification",
          "otp_request",
          "login_attempt",
          "password_reset",
          "account_unlock_request",
        ]),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await recordIpRequest(
        input.ipAddress,
        input.endpoint,
        input.violationType,
        input.userAgent
      );
      return { success: true };
    }),

  /**
   * Get IP reputation score
   */
  getReputation: publicProcedure
    .input(z.object({ ipAddress: z.string() }))
    .query(async ({ input }) => {
      const score = await getIpReputation(input.ipAddress);
      return { reputationScore: score };
    }),

  /**
   * Update IP reputation
   */
  updateReputation: publicProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        failedAttempts: z.number().optional().default(0),
        successfulLogins: z.number().optional().default(0),
        suspiciousActivity: z.number().optional().default(0),
      })
    )
    .mutation(async ({ input }) => {
      await updateIpReputation(
        input.ipAddress,
        input.failedAttempts,
        input.successfulLogins,
        input.suspiciousActivity
      );
      return { success: true };
    }),

  /**
   * Check if IP is whitelisted
   */
  isWhitelisted: publicProcedure
    .input(z.object({ ipAddress: z.string() }))
    .query(async ({ input }) => {
      const whitelisted = await isIpWhitelisted(input.ipAddress);
      return { whitelisted };
    }),

  /**
   * Check if IP is blacklisted
   */
  isBlacklisted: publicProcedure
    .input(z.object({ ipAddress: z.string() }))
    .query(async ({ input }) => {
      const blacklisted = await isIpBlacklisted(input.ipAddress);
      return { blacklisted };
    }),

  /**
   * Whitelist an IP (admin only)
   */
  whitelistIp: adminProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        reason: z.enum([
          "corporate_network",
          "partner_integration",
          "internal_testing",
          "api_partner",
          "other",
        ]),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await whitelistIp(
        input.ipAddress,
        input.reason,
        input.description,
        input.expiresAt,
        ctx.user?.id
      );
      return { success: true };
    }),

  /**
   * Blacklist an IP (admin only)
   */
  blacklistIp: adminProcedure
    .input(
      z.object({
        ipAddress: z.string(),
        reason: z.enum([
          "brute_force_attack",
          "credential_stuffing",
          "account_takeover_attempt",
          "ddos_attack",
          "malware_distribution",
          "spam",
          "manual_block",
          "other",
        ]),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        blockType: z.enum(["temporary", "permanent"]).optional(),
        blockedUntil: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await blacklistIp(
        input.ipAddress,
        input.reason,
        input.severity || "medium",
        input.blockType || "temporary",
        input.blockedUntil,
        input.notes,
        ctx.user?.id
      );
      return { success: true };
    }),

  /**
   * Remove IP from whitelist (admin only)
   */
  removeFromWhitelist: adminProcedure
    .input(z.object({ ipAddress: z.string() }))
    .mutation(async ({ input }) => {
      await removeIpFromWhitelist(input.ipAddress);
      return { success: true };
    }),

  /**
   * Remove IP from blacklist (admin only)
   */
  removeFromBlacklist: adminProcedure
    .input(z.object({ ipAddress: z.string() }))
    .mutation(async ({ input }) => {
      await removeIpFromBlacklist(input.ipAddress);
      return { success: true };
    }),
});
