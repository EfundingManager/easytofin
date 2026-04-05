import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { policyAssignments, phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const policiesRouter = router({
  getUpcomingRenewals: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          data: [],
          message: "Database not available",
        };
      }

      const user = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.id, ctx.user.id))
        .limit(1);

      if (!user || user.length === 0) {
        return {
          success: false,
          data: [],
          message: "User not found",
        };
      }

      const phoneUserId = user[0].id;

      const policies = await db
        .select()
        .from(policyAssignments)
        .where(eq(policyAssignments.phoneUserId, phoneUserId));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingRenewals = policies
        .map((policy: any) => {
          const renewalDate = new Date(policy.renewalDate);
          renewalDate.setHours(0, 0, 0, 0);
          const daysUntilRenewal = Math.floor(
            (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: policy.id,
            policyNumber: policy.policyNumber,
            policyType: policy.policyType,
            insurerName: policy.insurerName,
            renewalDate: policy.renewalDate,
            daysUntilRenewal,
            status: policy.status,
          };
        })
        .filter((p: any) => p.daysUntilRenewal <= 90)
        .sort((a: any, b: any) => a.daysUntilRenewal - b.daysUntilRenewal);

      return {
        success: true,
        data: upcomingRenewals,
      };
    } catch (error) {
      console.error("[Policies] Error fetching upcoming renewals:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch upcoming renewals",
      };
    }
  }),
  getClientPolicies: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          data: [],
          message: "Database not available",
        };
      }

      // Get the current user's phone user ID
      const user = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.id, ctx.user.id))
        .limit(1);

      if (!user || user.length === 0) {
        return {
          success: false,
          data: [],
          message: "User not found",
        };
      }

      const phoneUserId = user[0].id;

      // Get all policies assigned to this user
      const policies = await db
        .select()
        .from(policyAssignments)
        .where(eq(policyAssignments.phoneUserId, phoneUserId));

      // Format the policies data
      const formattedPolicies = policies.map((policy: any) => ({
        id: policy.id,
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        insurerName: policy.insurerName,
        premium: policy.premium,
        effectiveDate: policy.effectiveDate,
        renewalDate: policy.renewalDate,
        status: policy.status,
        advisorName: policy.advisorName,
        advisorPhone: policy.advisorPhone,
        advisorEmail: policy.advisorEmail,
      }));

      return {
        success: true,
        data: formattedPolicies,
      };
    } catch (error) {
      console.error("[Policies] Error fetching client policies:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch policies",
      };
    }
  }),
});
