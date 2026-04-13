import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
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

export const kycFormRouter = router({
  // Submit KYC form
  submitForm: protectedProcedure
    .input(kycFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
        }

        // Get user ID from context
        const userId = ctx.user?.id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        // Find phoneUser record by userId
        const phoneUserRecords = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.userId, userId));

        if (phoneUserRecords.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found" });
        }

        const phoneUser = phoneUserRecords[0];

        // Update phoneUser with KYC data
        const kycData: any = {
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
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      }

      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const phoneUserRecords = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.userId, userId));

      if (phoneUserRecords.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found" });
      }

      const phoneUser = phoneUserRecords[0];

      return {
        firstName: (phoneUser as any).firstName || "",
        lastName: (phoneUser as any).lastName || "",
        dateOfBirth: (phoneUser as any).dateOfBirth ? (phoneUser as any).dateOfBirth.toISOString().split("T")[0] : "",
        nationality: (phoneUser as any).nationality || "",
        address: (phoneUser as any).address || "",
        city: (phoneUser as any).city || "",
        postalCode: (phoneUser as any).postalCode || "",
        country: (phoneUser as any).country || "",
        idType: (phoneUser as any).idType || "passport",
        idNumber: (phoneUser as any).idNumber || "",
        idIssueDate: (phoneUser as any).idIssueDate ? (phoneUser as any).idIssueDate.toISOString().split("T")[0] : "",
        idExpiryDate: (phoneUser as any).idExpiryDate ? (phoneUser as any).idExpiryDate.toISOString().split("T")[0] : "",
        occupation: (phoneUser as any).occupation || "",
        employerName: (phoneUser as any).employerName || "",
        sourceOfIncome: (phoneUser as any).sourceOfIncome || "employment",
        annualIncome: (phoneUser as any).annualIncome || "",
        politicallyExposed: (phoneUser as any).politicallyExposed === "true",
        pepDetails: (phoneUser as any).pepDetails || "",
        kycStatus: (phoneUser as any).kycStatus || "pending",
        kycSubmittedAt: (phoneUser as any).kycSubmittedAt,
      };
    } catch (error) {
      console.error("Error fetching KYC form:", error);
      throw error;
    }
  }),

  // Get all KYC submissions for admin review
  getSubmissions: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const submissions = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.kycStatus, "submitted"));

      return submissions.map((user: any) => ({
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
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
        }

      const phoneUserRecords = await db
        .select()
        .from(phoneUsers)
        .where(eq(phoneUsers.id, parseInt(input.userId)));

        if (phoneUserRecords.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const phoneUser = phoneUserRecords[0];

        return {
          id: phoneUser.id,
          userId: (phoneUser as any).userId,
          firstName: (phoneUser as any).firstName,
          lastName: (phoneUser as any).lastName,
          email: phoneUser.email,
          phone: phoneUser.phone,
          dateOfBirth: (phoneUser as any).dateOfBirth,
          nationality: (phoneUser as any).nationality,
          address: (phoneUser as any).address,
          city: (phoneUser as any).city,
          postalCode: (phoneUser as any).postalCode,
          country: (phoneUser as any).country,
          idType: (phoneUser as any).idType,
          idNumber: (phoneUser as any).idNumber,
          idIssueDate: (phoneUser as any).idIssueDate,
          idExpiryDate: (phoneUser as any).idExpiryDate,
          occupation: (phoneUser as any).occupation,
          employerName: (phoneUser as any).employerName,
          sourceOfIncome: (phoneUser as any).sourceOfIncome,
          annualIncome: (phoneUser as any).annualIncome,
          politicallyExposed: (phoneUser as any).politicallyExposed === "true",
          pepDetails: (phoneUser as any).pepDetails,
          kycStatus: (phoneUser as any).kycStatus,
          kycSubmittedAt: (phoneUser as any).kycSubmittedAt,
          kycVerifiedAt: (phoneUser as any).kycVerifiedAt,
          kycRejectionReason: (phoneUser as any).kycRejectionReason,
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
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
        }

        const phoneUserRecords = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.userId, parseInt(input.userId)));

        if (phoneUserRecords.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const phoneUser = phoneUserRecords[0];

        await db
          .update(phoneUsers)
          .set({
            kycStatus: "verified" as any,
            clientStatus: "customer" as any,
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
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
        }

        const phoneUserRecords = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.userId, parseInt(input.userId)));

        if (phoneUserRecords.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const phoneUser = phoneUserRecords[0];

        await db
          .update(phoneUsers)
          .set({
            kycStatus: "rejected" as any,
          })
          .where(eq(phoneUsers.id, phoneUser.id));

        return { success: true, message: "KYC rejected" };
      } catch (error) {
        console.error("Error rejecting KYC:", error);
        throw error;
      }
    }),
});
