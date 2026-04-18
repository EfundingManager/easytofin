import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createAccountLink,
  verifyAccountLink,
  getLinkedAccounts,
  revokeAccountLink,
  findUserByLinkedPhone,
  findUserByLinkedEmail,
} from "../services/accountLinkingService";

export const accountLinkingRouter = router({
  /**
   * Initiate account linking request
   * Creates a pending link and generates verification token
   */
  initiateLink: protectedProcedure
    .input(
      z.object({
        phoneUserId: z.number().optional(),
        linkMethod: z.enum(["oauth_to_phone", "oauth_to_email"]),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        const result = await createAccountLink({
          userId: ctx.user?.id,
          phoneUserId: input.phoneUserId,
          linkMethod: input.linkMethod,
        });

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          accountLinkId: result.accountLinkId,
          verificationToken: result.verificationToken,
          message: result.message,
        };
      } catch (error: any) {
        console.error("[Account Linking] Initiate link error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate account linking",
        });
      }
    }),

  /**
   * Verify account link with token and optional verification code
   */
  verifyLink: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Verification token is required"),
        verificationCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const result = await verifyAccountLink(input.token, input.verificationCode);

        if (!result.success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error: any) {
        console.error("[Account Linking] Verify link error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify account link",
        });
      }
    }),

  /**
   * Get all linked accounts for current user
   */
  getLinkedAccounts: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const links = await getLinkedAccounts(ctx.user?.id);

      return {
        success: true,
        links: links || [],
      };
    } catch (error: any) {
      console.error("[Account Linking] Get linked accounts error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch linked accounts",
      });
    }
  }),

  /**
   * Revoke a linked account
   */
  revokeLink: protectedProcedure
    .input(
      z.object({
        accountLinkId: z.number().min(1, "Account link ID is required"),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const result = await revokeAccountLink(input.accountLinkId, input.reason);

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error: any) {
        console.error("[Account Linking] Revoke link error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke account link",
        });
      }
    }),

  /**
   * Find OAuth user by linked phone (for login)
   */
  findUserByPhone: publicProcedure
    .input(
      z.object({
        phone: z.string().min(1, "Phone number is required"),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const user = await findUserByLinkedPhone(input.phone);

        return {
          success: true,
          user: user || null,
          hasLinkedOAuth: !!user,
        };
      } catch (error: any) {
        console.error("[Account Linking] Find user by phone error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find user",
        });
      }
    }),

  /**
   * Find OAuth user by linked email (for login)
   */
  findUserByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const user = await findUserByLinkedEmail(input.email);

        return {
          success: true,
          user: user || null,
          hasLinkedOAuth: !!user,
        };
      } catch (error: any) {
        console.error("[Account Linking] Find user by email error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find user",
        });
      }
    }),
});
