import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { trustedDevices, deviceVerificationTokens, phoneUsers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { generateDeviceFingerprint } from "../_core/deviceFingerprint";
import { randomBytes } from "crypto";

/**
 * Device Registration and Recognition Router
 * Handles device fingerprinting, registration, and automatic recognition
 * to bypass OTP verification for trusted devices.
 */
export const deviceRegistrationRouter = router({
  /**
   * Register a new trusted device for a user
   * Called after successful OTP verification with rememberDevice flag
   */
  registerDevice: protectedProcedure
    .input(
      z.object({
        fingerprint: z.string().min(1, "Device fingerprint is required"),
        deviceName: z.string().min(1, "Device name is required").max(100),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Check if device already registered for this user
        const existingDevice = await db
          .select()
          .from(trustedDevices)
          .where(
            and(
              eq(trustedDevices.phoneUserId, ctx.user.id),
              eq(trustedDevices.deviceFingerprint, input.fingerprint)
            )
          )
          .limit(1);

        if (existingDevice.length > 0) {
        // Update last used timestamp
        await db
          .update(trustedDevices)
          .set({ lastUsedAt: new Date(), updatedAt: new Date() })
          .where(
            and(
              eq(trustedDevices.phoneUserId, ctx.user.id),
              eq(trustedDevices.deviceFingerprint, input.fingerprint)
            )
          );

          return {
            success: true,
            message: "Device already registered",
            deviceId: existingDevice[0].id,
          };
        }

        // Register new device
        const deviceToken = randomBytes(32).toString("hex");
        const result = await db
          .insert(trustedDevices)
          .values({
            phoneUserId: ctx.user.id,
            deviceFingerprint: input.fingerprint,
            deviceName: input.deviceName,
            deviceToken,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
            isActive: "true" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .$returningId();

        return {
          success: true,
          message: "Device registered successfully",
          deviceId: result[0].id,
        };
      } catch (error: any) {
        console.error("[Device Registration] Error registering device:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register device",
        });
      }
    }),

  /**
   * Check if a device is registered and trusted
   * Used during login to determine if OTP can be bypassed
   */
  verifyDevice: publicProcedure
    .input(
      z.object({
        fingerprint: z.string().min(1, "Device fingerprint is required"),
        email: z.string().email("Invalid email"),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Find user by email
        const user = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, input.email))
          .limit(1);

        if (user.length === 0) {
          return {
            isRecognized: false,
            message: "User not found",
          };
        }

        // Check if device is registered and active
        const device = await db
          .select()
          .from(trustedDevices)
          .where(
            and(
              eq(trustedDevices.phoneUserId, user[0].id),
              eq(trustedDevices.deviceFingerprint, input.fingerprint),
              eq(trustedDevices.isActive, "true" as const)
            )
          )
          .limit(1);

        if (device.length === 0) {
          return {
            isRecognized: false,
            message: "Device not recognized",
          };
        }

        // Generate verification token for this login session
        const verificationToken = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await db.insert(deviceVerificationTokens).values({
          phoneUserId: user[0].id,
          token: verificationToken,
          deviceFingerprint: input.fingerprint,
          deviceName: device[0].deviceName,
          userAgent: device[0].userAgent,
          ipAddress: device[0].ipAddress,
          expiresAt,
          verified: "false" as const,
          createdAt: new Date(),
        });

        // Update last used timestamp
        await db
          .update(trustedDevices)
          .set({ lastUsedAt: new Date(), updatedAt: new Date() })
          .where(eq(trustedDevices.id, device[0].id));

        return {
          isRecognized: true,
          message: "Device recognized",
          deviceId: device[0].id,
          deviceName: device[0].deviceName,
          verificationToken,
          lastUsedAt: device[0].lastUsedAt,
        };
      } catch (error: any) {
        console.error("[Device Verification] Error verifying device:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify device",
        });
      }
    }),

  /**
   * Get list of registered devices for authenticated user
   */
  listDevices: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    try {
      const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

      const devices = await db
        .select()
        .from(trustedDevices)
        .where(eq(trustedDevices.phoneUserId, ctx.user.id))
        .orderBy(trustedDevices.lastUsedAt);

      return {
        success: true,
        devices: devices.map((device: any) => ({
          id: device.id,
          deviceName: device.deviceName,
          userAgent: device.userAgent,
          ipAddress: device.ipAddress,
          isActive: device.isActive === "true",
          createdAt: device.createdAt,
          lastUsedAt: device.lastUsedAt,
        })),
      };
    } catch (error: any) {
      console.error("[Device List] Error fetching devices:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch devices",
      });
    }
  }),

  /**
   * Deactivate a trusted device
   */
  deactivateDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.number().int().positive("Invalid device ID"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Verify device belongs to user
        const device = await db
          .select()
          .from(trustedDevices)
          .where(
            and(
              eq(trustedDevices.id, input.deviceId),
              eq(trustedDevices.phoneUserId, ctx.user.id)
            )
          )
          .limit(1);

        if (device.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Device not found",
          });
        }

        // Deactivate device
        await db
          .update(trustedDevices)
          .set({ isActive: "false" as const, updatedAt: new Date() })
          .where(eq(trustedDevices.id, input.deviceId));

        return {
          success: true,
          message: "Device deactivated successfully",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("[Device Deactivation] Error deactivating device:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to deactivate device",
        });
      }
    }),

  /**
   * Verify device verification token (used after OTP bypass)
   */
  verifyDeviceToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Verification token is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Find and validate token
        const tokenRecord = await db
          .select()
          .from(deviceVerificationTokens)
          .where(
            and(
              eq(deviceVerificationTokens.token, input.token),
              eq(deviceVerificationTokens.verified, "false" as const)
            )
          )
          .limit(1);

        if (tokenRecord.length === 0) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired verification token",
          });
        }

        const token = tokenRecord[0];

        // Check if token is expired
        if (new Date() > token.expiresAt) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Verification token expired",
          });
        }

        // Mark token as verified
        await db
          .update(deviceVerificationTokens)
          .set({ verified: "true" as const, verifiedAt: new Date() })
          .where(eq(deviceVerificationTokens.id, token.id));

        return {
          success: true,
          message: "Device verified successfully",
          phoneUserId: token.phoneUserId,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("[Device Token Verification] Error verifying token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify device token",
        });
      }
    }),

  /**
   * Get device fingerprint from browser
   * Returns fingerprint string for client-side use
   */
  getFingerprint: publicProcedure.query(() => {
    try {
      // This is called from the frontend to get the device fingerprint
      // The actual fingerprinting happens on the client side using the utility
      return {
        success: true,
        message: "Use generateDeviceFingerprint() on client to get fingerprint",
      };
    } catch (error: any) {
      console.error("[Get Fingerprint] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get fingerprint",
      });
    }
  }),
});
