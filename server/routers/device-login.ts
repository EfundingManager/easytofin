/**
 * Device-Based Login Router
 * Handles device fingerprinting, trusted device registration, and one-click login
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import {
  checkTrustedDevice,
  getRecentLoginUsers,
  registerTrustedDevice,
  verifyDeviceLogin,
  removeTrustedDevice,
  getUserTrustedDevices,
  logoutAllDevices,
} from '../_core/device-login';
import { generateDeviceFingerprint, extractDeviceInfo } from '../_core/device-fingerprint';
import { getPhoneUserById } from '../db';

export const deviceLoginRouter = router({
  /**
   * Check if current device is trusted for a user
   */
  checkTrustedDevice: publicProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        deviceFingerprint: z.string(),
        ipAddress: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const ipAddress = input.ipAddress || ctx.req?.ip || '0.0.0.0';

        const result = await checkTrustedDevice(
          input.phoneUserId,
          input.deviceFingerprint,
          ipAddress
        );

        return {
          isTrusted: result.isTrusted,
          deviceName: result.deviceName,
          lastUsedAt: result.lastUsedAt,
          requiresVerification: result.requiresVerification || false,
        };
      } catch (error) {
        console.error('[Device Login Router] Error checking trusted device:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check device trust status',
        });
      }
    }),

  /**
   * Get recently logged-in users on this device
   * Used for "Continue as [user]" login flow
   */
  getRecentUsers: publicProcedure
    .input(
      z.object({
        deviceFingerprint: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const users = await getRecentLoginUsers(input.deviceFingerprint);

        return {
          users: users.map(u => ({
            phoneUserId: u.phoneUserId,
            email: u.email,
            phone: u.phone,
            name: u.name || 'User',
            lastUsedAt: u.lastUsedAt,
          })),
        };
      } catch (error) {
        console.error('[Device Login Router] Error getting recent users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get recent users',
        });
      }
    }),

  /**
   * Verify device-based login (one-click login)
   * Skips OTP verification for trusted devices
   */
  verifyDeviceLogin: publicProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        deviceFingerprint: z.string(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = input.ipAddress || ctx.req?.ip || '0.0.0.0';

        const result = await verifyDeviceLogin(
          input.phoneUserId,
          input.deviceFingerprint,
          ipAddress
        );

        if (!result.allowed) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: result.reason || 'Device verification failed',
          });
        }

        // Get user details
        const user = await getPhoneUserById(input.phoneUserId);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return {
          success: true,
          phoneUserId: result.phoneUserId,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
          },
          deviceName: result.deviceName,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[Device Login Router] Error verifying device login:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Device verification failed',
        });
      }
    }),

  /**
   * Register a new trusted device after OTP verification
   */
  registerDevice: publicProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        deviceFingerprint: z.string(),
        userAgent: z.string(),
        ipAddress: z.string().optional(),
        deviceName: z.string().optional(),
        trustDevice: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.trustDevice) {
          return { success: false, message: 'Device trust not requested' };
        }

        const ipAddress = input.ipAddress || ctx.req?.ip || '0.0.0.0';

        const deviceToken = await registerTrustedDevice(
          input.phoneUserId,
          input.deviceFingerprint,
          input.userAgent,
          ipAddress,
          input.deviceName
        );

        if (!deviceToken) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to register device',
          });
        }

        return {
          success: true,
          deviceToken,
          message: 'Device registered successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[Device Login Router] Error registering device:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register device',
        });
      }
    }),

  /**
   * Get all trusted devices for the current user
   */
  getUserDevices: protectedProcedure.query(async ({ ctx }) => {
    try {
      const phoneUserId = (ctx.user as any)?.phoneUserId;
      if (!phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const devices = await getUserTrustedDevices(phoneUserId);

      return {
        devices: devices.map(d => ({
          id: d.id,
          deviceName: d.deviceName,
          lastUsedAt: d.lastUsedAt,
          createdAt: d.createdAt,
        })),
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('[Device Login Router] Error getting user devices:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get devices',
      });
    }
  }),

  /**
   * Remove a trusted device
   */
  removeDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const phoneUserId = (ctx.user as any)?.phoneUserId;
        if (!phoneUserId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const success = await removeTrustedDevice(phoneUserId, input.deviceId);

        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Device not found or unauthorized',
          });
        }

        return { success: true, message: 'Device removed successfully' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[Device Login Router] Error removing device:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove device',
        });
      }
    }),

  /**
   * Logout from all devices
   */
  logoutAllDevices: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const phoneUserId = (ctx.user as any)?.phoneUserId;
      if (!phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      await logoutAllDevices(phoneUserId);

      return { success: true, message: 'Logged out from all devices' };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('[Device Login Router] Error logging out from all devices:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to logout from all devices',
      });
    }
  }),
});
