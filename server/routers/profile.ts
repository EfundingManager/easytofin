import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { phoneUsers, userProducts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notifyAdminNewProfile } from '../_core/adminNotification';

export const profileRouter = router({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const user: any = await db.select().from(phoneUsers).where(eq(phoneUsers.id, ctx.user.id));
      
      if (!user || user.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const selectedServices: any = await db.select().from(userProducts).where(eq(userProducts.phoneUserId, ctx.user.id));

      return {
        success: true,
        data: {
          user: user[0],
          selectedServices: selectedServices.map((s: any) => s.product),
        },
      };
    } catch (error) {
      console.log('[Profile] Failed to get profile:', error);
      return { success: false, error: 'Failed to fetch profile' };
    }
  }),

  /**
   * Update user profile information
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().min(1, 'Phone is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        await db.update(phoneUsers).set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          updatedAt: new Date(),
        }).where(eq(phoneUsers.id, ctx.user.id));

        return { success: true, message: 'Profile updated successfully' };
      } catch (error) {
        console.log('[Profile] Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
      }
    }),

  /**
   * Select services (can be multiple)
   */
  selectServices: protectedProcedure
    .input(
      z.object({
        services: z.array(z.enum(['protection', 'pensions', 'healthInsurance', 'generalInsurance', 'investments'])),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Delete existing selections
        await db.delete(userProducts).where(eq(userProducts.phoneUserId, ctx.user.id));

        // Insert new selections
        for (const service of input.services) {
          await db.insert(userProducts).values({
            phoneUserId: ctx.user.id,
            product: service as any,
            status: 'selected',
          });
        }

        return { success: true, message: 'Services selected successfully', selectedCount: input.services.length };
      } catch (error) {
        console.log('[Profile] Failed to select services:', error);
        return { success: false, error: 'Failed to select services' };
      }
    }),

  /**
   * Submit profile and services (complete registration)
   */
  submitProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().min(1, 'Phone is required'),
        services: z.array(z.enum(['protection', 'pensions', 'healthInsurance', 'generalInsurance', 'investments'])),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, error: 'Database not available' };
        }

        // Update user profile
        await db.update(phoneUsers).set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          clientStatus: 'in_progress',
          updatedAt: new Date(),
        }).where(eq(phoneUsers.id, ctx.user.id));

        // Delete existing service selections
        await db.delete(userProducts).where(eq(userProducts.phoneUserId, ctx.user.id));

        // Insert new service selections
        for (const service of input.services) {
          await db.insert(userProducts).values({
            phoneUserId: ctx.user.id,
            product: service as any,
            status: 'selected',
          });
        }

        // Send admin notification
        try {
          await notifyAdminNewProfile({
            clientName: input.name,
            clientEmail: input.email,
            clientPhone: input.phone,
            selectedServices: input.services,
            submittedAt: new Date(),
          });
        } catch (error) {
          console.error('[Profile] Failed to send admin notification:', error);
          // Don't fail the submission if notification fails
        }

        return {
          success: true,
          message: 'Profile submitted successfully',
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            servicesCount: input.services.length,
          },
        };
      } catch (error) {
        console.log('[Profile] Failed to submit profile:', error);
        return { success: false, error: 'Failed to submit profile' };
      }
    }),
});
