import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { KYCPdfGenerator } from '../services/kycPdfGenerator';
import { getDb } from '../db';
import { factFindingForms, phoneUsers } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const pdfExportRouter = router({
  /**
   * Generate KYC summary PDF for authenticated user
   * Returns PDF as base64 encoded string for download
   */
  generateKYCSummaryPDF: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Fetch user details
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        const user = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, ctx.user.id as any))
          .limit(1);

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const userData = user[0];

        // Fetch all KYC forms for this user
        const phoneUserId = ctx.user.id;
        const forms: any[] = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.phoneUserId, phoneUserId as any));

        // Parse form data by product type
        const formData: any = {};

        forms.forEach((form: any) => {
          try {
            const parsedData = typeof form.formData === 'string' 
              ? JSON.parse(form.formData) 
              : form.formData;

            switch (form.product) {
              case 'protection':
                formData.lifeProtection = parsedData;
                break;
              case 'pensions':
                formData.pensions = parsedData;
                break;
              case 'healthInsurance':
                formData.healthInsurance = parsedData;
                break;
              case 'generalInsurance':
                formData.generalInsurance = parsedData;
                break;
              case 'investments':
                formData.investments = parsedData;
                break;
            }
          } catch (error) {
            console.error(`Error parsing form data for ${form.product}:`, error);
          }
        });

        // Generate PDF
        const pdfGenerator = new KYCPdfGenerator();
        const pdfBuffer = pdfGenerator.generateKYCSummaryPDF(formData, {
          customerName: userData.name || 'Customer',
          customerEmail: userData.email || undefined,
          customerPhone: userData.phone || undefined,
          generatedDate: new Date(),
        });

        // Convert to base64 for transmission
        const base64Pdf = pdfBuffer.toString('base64');
        const filename = KYCPdfGenerator.generateFilename(
          userData.name || 'Customer',
          new Date()
        );

        return {
          success: true,
          filename,
          pdfBase64: base64Pdf,
          message: 'PDF generated successfully',
        };
      } catch (error) {
        console.error('Error generating KYC PDF:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate PDF',
        });
      }
    }),

  /**
   * Generate PDF for a specific product form
   */
  generateProductFormPDF: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch the specific form
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        const form = await db
          .select()
          .from(factFindingForms)
          .where(eq(factFindingForms.id, parseInt(input.formId) as any))
          .limit(1);

        if (!form || form.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Form not found',
          });
        }

        const formData: any = form[0];

        // Verify user owns this form
        if (formData.phoneUserId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this form',
          });
        }

        // Fetch user details
        const user = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, formData.userId))
          .limit(1);

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const userData = user[0];

        // Parse form data
        const parsedFormData = typeof formData.formData === 'string' 
          ? JSON.parse(formData.formData) 
          : formData.formData;

        // Create form data object with only this product
        const singleProductFormData: any = {};
        switch (formData.product) {
          case 'protection':
            singleProductFormData.lifeProtection = parsedFormData;
            break;
          case 'pensions':
            singleProductFormData.pensions = parsedFormData;
            break;
          case 'healthInsurance':
            singleProductFormData.healthInsurance = parsedFormData;
            break;
          case 'generalInsurance':
            singleProductFormData.generalInsurance = parsedFormData;
            break;
          case 'investments':
            singleProductFormData.investments = parsedFormData;
            break;
        }

        // Generate PDF
        const pdfGenerator = new KYCPdfGenerator();
        const pdfBuffer = pdfGenerator.generateKYCSummaryPDF(singleProductFormData, {
          customerName: userData.name || 'Customer',
          customerEmail: userData.email || undefined,
          customerPhone: userData.phone || undefined,
          generatedDate: new Date(),
        });

        // Convert to base64
        const base64Pdf = pdfBuffer.toString('base64');
        const filename = KYCPdfGenerator.generateFilename(
          userData.name || 'Customer',
          new Date()
        );

        return {
          success: true,
          filename,
          pdfBase64: base64Pdf,
          message: 'PDF generated successfully',
        };
      } catch (error) {
        console.error('Error generating product form PDF:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate PDF',
        });
      }
    }),

  /**
   * Get PDF generation status and available forms
   */
  getExportStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      // Fetch all forms for current user
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const forms: any[] = await db
        .select()
        .from(factFindingForms)
        .where(eq(factFindingForms.phoneUserId, userId as any));

        const completedProducts = forms.map((form: any) => ({
        productType: form.product,
        status: form.status,
        completedAt: form.updatedAt,
      }))

      return {
        success: true,
        totalForms: forms.length,
        completedProducts: completedProducts,
        canExport: forms.length > 0,
      };
    } catch (error) {
      console.error('Error getting export status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get export status',
      });
    }
  }),
});
