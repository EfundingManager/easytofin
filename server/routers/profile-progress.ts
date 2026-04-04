import { z } from 'zod';
import { getDb } from '../db';
import { factFindingForms } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, router } from '../_core/trpc';

export const profileProgressRouter = router({
  /**
   * Get form progress for user
   */
  getFormProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const submittedForms: any = await db.select().from(factFindingForms).where(eq(factFindingForms.phoneUserId, ctx.user.id));
      
      const products = ['protection', 'pensions', 'healthInsurance', 'generalInsurance', 'investments'];
      const progress = products.map(product => {
        const submitted = submittedForms.some((f: any) => f.product === product && f.status === 'submitted');
        return {
          product,
          completed: submitted,
          submittedAt: submitted ? submittedForms.find((f: any) => f.product === product)?.submittedAt : null,
        };
      });

      const completedCount = progress.filter((p: any) => p.completed).length;
      const totalCount = products.length;
      const completionPercentage = Math.round((completedCount / totalCount) * 100);

      return {
        success: true,
        data: {
          progress,
          completedCount,
          totalCount,
          completionPercentage,
        },
      };
    } catch (error) {
      console.log('[Profile] Failed to get form progress:', error);
      return { success: false, error: 'Failed to fetch form progress' };
    }
  }),

  /**
   * Update form progress
   */
  updateFormProgress: protectedProcedure
    .input(
      z.object({
        product: z.enum(['protection', 'pensions', 'healthInsurance', 'generalInsurance', 'investments']),
        status: z.enum(['started', 'in_progress', 'submitted']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Check if form exists
        const existingForm: any = await db.select().from(factFindingForms).where(
          and(
            eq(factFindingForms.phoneUserId, ctx.user.id),
            eq(factFindingForms.product, input.product as any)
          )
        );

        if (existingForm && existingForm.length > 0) {
          // Update existing form
          await db.update(factFindingForms).set({
            status: input.status as any,
            updatedAt: new Date(),
          }).where(
            and(
              eq(factFindingForms.phoneUserId, ctx.user.id),
              eq(factFindingForms.product, input.product as any)
            )
          );
        } else {
          // Create new form entry
          await db.insert(factFindingForms).values({
            phoneUserId: ctx.user.id,
            product: input.product as any,
            status: input.status as any,
            formData: '{}',
          });
        }

        return {
          success: true,
          message: `Form progress updated for ${input.product}`,
        };
      } catch (error) {
        console.log('[Profile] Failed to update form progress:', error);
        return { success: false, error: 'Failed to update form progress' };
      }
    }),
});
