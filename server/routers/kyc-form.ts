import { z } from "zod";
import { protectedProcedure, adminProcedure } from "../_core/trpc";
import { db } from "../db";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// KYC Form validation schema
const kycFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  idType: z.enum(["passport", "national_id", "drivers_license", "other"]),
  idNumber: z.string().min(1, "ID number is required"),
  idIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  idExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  occupation: z.string().optional(),
  employerName: z.string().optional(),
  sourceOfIncome: z.enum(["employment", "self_employed", "investment", "pension", "other"]),
  annualIncome: z.string().optional(),
  politicallyExposed: z.boolean().default(false),
  pepDetails: z.string().optional(),
});

export type KYCFormData = z.infer<typeof kycFormSchema>;

export const kycFormRouter = {
  // Submit KYC form
  submitForm: protectedProcedure
    .input(kycFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Get user ID from context
        const userId = ctx.user?.id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        // Find phoneUser record
        const phoneUser = await db.query.phoneUsers.findFirst({
          where: eq(phoneUsers.userId, userId),
        });

        if (!phoneUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found" });
        }

        // Update phoneUser with KYC data
        const kycData = {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: new Date(input.dateOfBirth),
          nationality: input.nationality,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          idType: input.idType,
          idNumber: input.idNumber,
          idIssueDate: new Date(input.idIssueDate),
          idExpiryDate: new Date(input.idExpiryDate),
          occupation: input.occupation || null,
          employerName: input.employerName || null,
          sourceOfIncome: input.sourceOfIncome,
          annualIncome: input.annualIncome || null,
          politicallyExposed: input.politicallyExposed ? "true" : "false",
          pepDetails: input.pepDetails || null,
          kycSubmittedAt: new Date(),
          kycStatus: "submitted",
        };

        await db.update(phoneUsers).set(kycData).where(eq(phoneUsers.id, phoneUser.id));

        return {
          success: true,
          message: "KYC form submitted successfully",
          kycStatus: "submitted",
        };
      } catch (error) {
        console.error("KYC form submission error:", error);
        throw error;
      }
    }),

  // Get KYC form data
  getForm: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const phoneUser = await db.query.phoneUsers.findFirst({
        where: eq(phoneUsers.userId, userId),
      });

      if (!phoneUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found" });
      }

      return {
        firstName: phoneUser.firstName || "",
        lastName: phoneUser.lastName || "",
        dateOfBirth: phoneUser.dateOfBirth ? phoneUser.dateOfBirth.toISOString().split("T")[0] : "",
        nationality: phoneUser.nationality || "",
        address: phoneUser.address || "",
        city: phoneUser.city || "",
        postalCode: phoneUser.postalCode || "",
        country: phoneUser.country || "",
        idType: phoneUser.idType || "passport",
        idNumber: phoneUser.idNumber || "",
        idIssueDate: phoneUser.idIssueDate ? phoneUser.idIssueDate.toISOString().split("T")[0] : "",
        idExpiryDate: phoneUser.idExpiryDate ? phoneUser.idExpiryDate.toISOString().split("T")[0] : "",
        occupation: phoneUser.occupation || "",
        employerName: phoneUser.employerName || "",
        sourceOfIncome: phoneUser.sourceOfIncome || "employment",
        annualIncome: phoneUser.annualIncome || "",
        politicallyExposed: phoneUser.politicallyExposed === "true",
        pepDetails: phoneUser.pepDetails || "",
        kycStatus: phoneUser.kycStatus || "pending",
        kycSubmittedAt: phoneUser.kycSubmittedAt,
      };
    } catch (error) {
      console.error("Error fetching KYC form:", error);
      throw error;
    }
  }),

  // Get all KYC submissions for admin review
  getSubmissions: adminProcedure.query(async () => {
    try {
      const submissions = await db.query.phoneUsers.findMany({
        where: (user: any, { eq: eqFn }: any) => eqFn(user.kycStatus, "submitted"),
      });

      return submissions.map((user) => ({
        id: user.id,
        userId: user.userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        phone: user.phone,
        idType: user.idType,
        idNumber: user.idNumber,
        kycStatus: user.kycStatus,
        kycSubmittedAt: user.kycSubmittedAt,
        clientStatus: user.clientStatus,
      }));
    } catch (error) {
      console.error("Error fetching KYC submissions:", error);
      throw error;
    }
  }),

  // Get KYC submission details for admin
  getSubmissionDetails: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const phoneUser = await db.query.phoneUsers.findFirst({
          where: (user: any) => user.id === parseInt(input.userId),
        });

        if (!phoneUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        return {
          id: phoneUser.id,
          userId: phoneUser.userId,
          firstName: phoneUser.firstName,
          lastName: phoneUser.lastName,
          email: phoneUser.email,
          phone: phoneUser.phone,
          dateOfBirth: phoneUser.dateOfBirth,
          nationality: phoneUser.nationality,
          address: phoneUser.address,
          city: phoneUser.city,
          postalCode: phoneUser.postalCode,
          country: phoneUser.country,
          idType: phoneUser.idType,
          idNumber: phoneUser.idNumber,
          idIssueDate: phoneUser.idIssueDate,
          idExpiryDate: phoneUser.idExpiryDate,
          occupation: phoneUser.occupation,
          employerName: phoneUser.employerName,
          sourceOfIncome: phoneUser.sourceOfIncome,
          annualIncome: phoneUser.annualIncome,
          politicallyExposed: phoneUser.politicallyExposed === "true",
          pepDetails: phoneUser.pepDetails,
          kycStatus: phoneUser.kycStatus,
          kycSubmittedAt: phoneUser.kycSubmittedAt,
          kycVerifiedAt: phoneUser.kycVerifiedAt,
          kycRejectionReason: phoneUser.kycRejectionReason,
          clientStatus: phoneUser.clientStatus,
        };
      } catch (error) {
        console.error("Error fetching KYC submission details:", error);
        throw error;
      }
    }),

  // Verify KYC submission
  verifySubmission: adminProcedure
    .input(z.object({ userId: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const phoneUser = await db.query.phoneUsers.findFirst({
          where: (user: any) => user.id === parseInt(input.userId),
        });

        if (!phoneUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        await db
          .update(phoneUsers)
          .set({
            kycStatus: "verified",
            kycVerifiedAt: new Date(),
            clientStatus: "customer",
          })
          .where(eq(phoneUsers.id, phoneUser.id));

        return { success: true, message: "KYC verified successfully" };
      } catch (error) {
        console.error("Error verifying KYC:", error);
        throw error;
      }
    }),

  // Reject KYC submission
  rejectSubmission: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().min(1, "Rejection reason is required") }))
    .mutation(async ({ input, ctx }) => {
      try {
        const phoneUser = await db.query.phoneUsers.findFirst({
          where: (user: any) => user.id === parseInt(input.userId),
        });

        if (!phoneUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        await db
          .update(phoneUsers)
          .set({
            kycStatus: "rejected",
            kycRejectionReason: input.reason,
          })
          .where(eq(phoneUsers.id, phoneUser.id));

        return { success: true, message: "KYC rejected" };
      } catch (error) {
        console.error("Error rejecting KYC:", error);
        throw error;
      }
    }),
};
