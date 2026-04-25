/**
 * KYC Fact-Finding Forms Router
 * Handles form submission, retrieval, and auto-fill functionality
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { factFindingForms } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const kycFormsRouter = router({
  /**
   * Get previous form data for auto-fill
   * Returns the most recent submitted form for the given product type
   */
  getPreviousFormData: protectedProcedure
    .input(
      z.object({
        product: z.enum(["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const phoneUserId = ctx.user.id;

      // Get the most recent submitted form for this product
      const previousForms = await db
        .select()
        .from(factFindingForms)
        .where(
          and(
            eq(factFindingForms.phoneUserId, phoneUserId),
            eq(factFindingForms.product, input.product),
            eq(factFindingForms.status, "submitted")
          )
        );

      if (previousForms.length === 0 || !previousForms[0].formData) {
        return null;
      }

      try {
        return JSON.parse(previousForms[0].formData);
      } catch {
        return null;
      }
    }),

  /**
   * Save form data (draft or submitted)
   */
  saveForm: protectedProcedure
    .input(
      z.object({
        product: z.enum(["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]),
        formData: z.record(z.string(), z.any()),
        status: z.enum(["draft", "submitted"]),
        policyNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const phoneUserId = ctx.user.id;
      const formDataJson = JSON.stringify(input.formData);

      // Check if a form already exists for this product
      const existingForms = await db
        .select()
        .from(factFindingForms)
        .where(
          and(
            eq(factFindingForms.phoneUserId, phoneUserId),
            eq(factFindingForms.product, input.product)
          )
        );

      if (existingForms.length > 0) {
        // Update existing form
        const existingForm = existingForms[0];
        await db
          .update(factFindingForms)
          .set({
            formData: formDataJson,
            status: input.status,
            policyNumber: input.policyNumber || existingForm.policyNumber,
            submittedAt: input.status === "submitted" ? new Date() : existingForm.submittedAt,
            updatedAt: new Date(),
          })
          .where(eq(factFindingForms.id, existingForm.id));

        return {
          success: true,
          formId: existingForm.id,
          message: "Form updated successfully",
        };
      } else {
        // Create new form
        const insertData: any = {
          phoneUserId,
          product: input.product,
          formData: formDataJson,
          status: input.status,
        };
        if (input.policyNumber) insertData.policyNumber = input.policyNumber;
        if (input.status === "submitted") insertData.submittedAt = new Date();

        const result = await db.insert(factFindingForms).values(insertData);

        return {
          success: true,
          formId: (result as any).insertId,
          message: "Form created successfully",
        };
      }
    }),

  /**
   * Get current form data (draft or submitted)
   */
  getFormData: protectedProcedure
    .input(
      z.object({
        product: z.enum(["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const phoneUserId = ctx.user.id;

      const forms = await db
        .select()
        .from(factFindingForms)
        .where(
          and(
            eq(factFindingForms.phoneUserId, phoneUserId),
            eq(factFindingForms.product, input.product)
          )
        );

      if (forms.length === 0 || !forms[0].formData) {
        return null;
      }

      try {
        return {
          id: forms[0].id,
          formData: JSON.parse(forms[0].formData),
          status: forms[0].status,
          submittedAt: forms[0].submittedAt,
          policyNumber: forms[0].policyNumber,
        };
      } catch {
        return null;
      }
    }),

  /**
   * Get all forms for a user
   */
  getAllForms: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const phoneUserId = ctx.user.id;

    const forms = await db
      .select()
      .from(factFindingForms)
      .where(eq(factFindingForms.phoneUserId, phoneUserId));

    return forms.map((form: any) => ({
      id: form.id,
      product: form.product,
      status: form.status,
      submittedAt: form.submittedAt,
      policyNumber: form.policyNumber,
      updatedAt: form.updatedAt,
      formData: form.formData ? JSON.parse(form.formData) : null,
    }));
  }),

  /**
   * Delete a form (draft only)
   */
  deleteForm: protectedProcedure
    .input(
      z.object({
        product: z.enum(["protection", "pensions", "healthInsurance", "generalInsurance", "investments"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const phoneUserId = ctx.user.id;

      const forms = await db
        .select()
        .from(factFindingForms)
        .where(
          and(
            eq(factFindingForms.phoneUserId, phoneUserId),
            eq(factFindingForms.product, input.product),
            eq(factFindingForms.status, "draft")
          )
        );

      if (forms.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or cannot be deleted" });
      }

      await db.delete(factFindingForms).where(eq(factFindingForms.id, forms[0].id));

      return {
        success: true,
        message: "Form deleted successfully",
      };
    }),

  /**
   * Get form progress for all products
   */
  getFormProgress: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const phoneUserId = ctx.user.id;

    const forms = await db
      .select()
      .from(factFindingForms)
      .where(eq(factFindingForms.phoneUserId, phoneUserId));

    const products = ["protection", "pensions", "healthInsurance", "generalInsurance", "investments"] as const;
    const progress = products.map((product) => {
      const form = forms.find((f: any) => f.product === product);
      return {
        product,
        status: form?.status || "not_started",
        submittedAt: form?.submittedAt,
        policyNumber: form?.policyNumber,
      };
    });

    const completedCount = progress.filter((p) => p.status === "submitted").length;
    const totalCount = products.length;

    return {
      progress,
      completedCount,
      totalCount,
      percentComplete: Math.round((completedCount / totalCount) * 100),
    };
  }),
});
