import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  generateDeviceFingerprint,
  parseDeviceName,
  addTrustedDevice,
  isTrustedDevice,
  getTrustedDevices,
  removeTrustedDevice,
  deactivateTrustedDevice,
  removeAllTrustedDevices,
  getTrustedDeviceCount,
  hasReachedDeviceLimit,
  updateDeviceName,
  cleanupOldDevices,
} from '../services/deviceTrustService';

export const deviceTrustRouter = router({
  /**
   * Get all trusted devices for current user
   */
  getTrustedDevices: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      if (!ctx.user?.phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const devices = await getTrustedDevices(ctx.user.phoneUserId);

      return {
        success: true,
        devices,
        count: devices.length,
      };
    } catch (error: any) {
      console.error('[DeviceTrust] Error getting devices:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve trusted devices',
      });
    }
  }),

  /**
   * Add current device to trusted devices
   */
  addCurrentDevice: protectedProcedure
    .input(
      z.object({
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
        customName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        if (!ctx.user?.phoneUserId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Check device limit
        const hasReachedLimit = await hasReachedDeviceLimit(ctx.user.phoneUserId, 10);
        if (hasReachedLimit) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Maximum trusted devices limit reached (10). Please remove an old device first.',
          });
        }

        // Generate device fingerprint
        const deviceFingerprint = generateDeviceFingerprint(input.userAgent, input.ipAddress);

        // Check if device already trusted
        const isAlreadyTrusted = await isTrustedDevice(ctx.user.phoneUserId, deviceFingerprint);
        if (isAlreadyTrusted) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This device is already trusted',
          });
        }

        // Parse device name
        const deviceName = input.customName || parseDeviceName(input.userAgent);

        // Add device
        const success = await addTrustedDevice({
          phoneUserId: ctx.user.phoneUserId,
          deviceFingerprint,
          deviceName,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
        });

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add trusted device',
          });
        }

        return {
          success: true,
          message: `Device "${deviceName}" added to trusted devices`,
          deviceName,
        };
      } catch (error: any) {
        console.error('[DeviceTrust] Error adding device:', error);
        throw error;
      }
    }),

  /**
   * Check if current device is trusted
   */
  checkDeviceTrust: publicProcedure
    .input(
      z.object({
        phoneUserId: z.number(),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const deviceFingerprint = generateDeviceFingerprint(input.userAgent, input.ipAddress);
        const isTrusted = await isTrustedDevice(input.phoneUserId, deviceFingerprint);

        return {
          isTrusted,
          deviceFingerprint,
        };
      } catch (error: any) {
        console.error('[DeviceTrust] Error checking device trust:', error);
        return {
          isTrusted: false,
          error: 'Failed to check device trust',
        };
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
    .mutation(async ({ input, ctx }: any) => {
      try {
        if (!ctx.user?.phoneUserId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const success = await removeTrustedDevice(ctx.user.phoneUserId, input.deviceId);

        if (!success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Failed to remove device or device not found',
          });
        }

        return {
          success: true,
          message: 'Device removed successfully',
        };
      } catch (error: any) {
        console.error('[DeviceTrust] Error removing device:', error);
        throw error;
      }
    }),

  /**
   * Deactivate a trusted device
   */
  deactivateDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        if (!ctx.user?.phoneUserId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const success = await deactivateTrustedDevice(ctx.user.phoneUserId, input.deviceId);

        if (!success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Failed to deactivate device or device not found',
          });
        }

        return {
          success: true,
          message: 'Device deactivated successfully',
        };
      } catch (error: any) {
        console.error('[DeviceTrust] Error deactivating device:', error);
        throw error;
      }
    }),

  /**
   * Remove all trusted devices
   */
  removeAllDevices: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      if (!ctx.user?.phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const success = await removeAllTrustedDevices(ctx.user.phoneUserId);

      if (!success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove all devices',
        });
      }

      return {
        success: true,
        message: 'All trusted devices removed successfully',
      };
    } catch (error: any) {
      console.error('[DeviceTrust] Error removing all devices:', error);
      throw error;
    }
  }),

  /**
   * Update device name
   */
  updateDeviceName: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
        newName: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        if (!ctx.user?.phoneUserId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const success = await updateDeviceName(ctx.user.phoneUserId, input.deviceId, input.newName);

        if (!success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Failed to update device name or device not found',
          });
        }

        return {
          success: true,
          message: 'Device name updated successfully',
          newName: input.newName,
        };
      } catch (error: any) {
        console.error('[DeviceTrust] Error updating device name:', error);
        throw error;
      }
    }),

  /**
   * Get device count for current user
   */
  getDeviceCount: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      if (!ctx.user?.phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const count = await getTrustedDeviceCount(ctx.user.phoneUserId);
      const hasReachedLimit = count >= 10;

      return {
        count,
        hasReachedLimit,
        maxDevices: 10,
      };
    } catch (error: any) {
      console.error('[DeviceTrust] Error getting device count:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get device count',
      });
    }
  }),

  /**
   * Cleanup old inactive devices
   */
  cleanupOldDevices: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      if (!ctx.user?.phoneUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const deletedCount = await cleanupOldDevices(ctx.user.phoneUserId, 90);

      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old inactive devices`,
      };
    } catch (error: any) {
      console.error('[DeviceTrust] Error cleaning up devices:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cleanup old devices',
      });
    }
  }),
});
