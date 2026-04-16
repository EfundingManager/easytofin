import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { phoneUsers, trustedDevices, deviceVerificationTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "../_core/context";

describe("Device Registration Router", () => {
  let testUserId: number;
  let testEmail: string;
  let db: any;

  beforeAll(async () => {
    db = await getDb();

    // Create test user with unique phone number
    const uniquePhone = "+353871" + Date.now().toString().slice(-6);
    testEmail = "device-test-" + Date.now() + "@example.com";
    
    const result = await db
      .insert(phoneUsers)
      .values({
        email: testEmail,
        name: "Device Test User",
        phone: uniquePhone,
        emailVerified: "true",
        verified: "true",
        role: "user",
        clientStatus: "customer",
        kycStatus: "verified",
      })
      .$returningId();

    testUserId = result[0].id;
  });

  afterAll(async () => {
    if (db && testUserId) {
      await db
        .delete(deviceVerificationTokens)
        .where(eq(deviceVerificationTokens.phoneUserId, testUserId));
      await db
        .delete(trustedDevices)
        .where(eq(trustedDevices.phoneUserId, testUserId));
      await db
        .delete(phoneUsers)
        .where(eq(phoneUsers.id, testUserId));
    }
  });

  describe("verifyDevice", () => {
    it("should return isRecognized: false for unknown device", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(ctx);
      const result = await caller.deviceRegistration.verifyDevice({
        fingerprint: "unknown-fingerprint-12345",
        email: testEmail,
      });

      expect(result.isRecognized).toBe(false);
      expect(result.message).toBe("Device not recognized");
    });

    it("should return isRecognized: false for non-existent user", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(ctx);
      const result = await caller.deviceRegistration.verifyDevice({
        fingerprint: "some-fingerprint",
        email: "nonexistent@example.com",
      });

      expect(result.isRecognized).toBe(false);
      expect(result.message).toBe("User not found");
    });

    it("should generate verification token for recognized device", async () => {
      const deviceFingerprint = "test-fingerprint-" + Date.now();
      const deviceToken = "test-device-token-" + Date.now();

      await db.insert(trustedDevices).values({
        phoneUserId: testUserId,
        deviceFingerprint,
        deviceName: "Test Device",
        deviceToken,
        isActive: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(ctx);
      const result = await caller.deviceRegistration.verifyDevice({
        fingerprint: deviceFingerprint,
        email: testEmail,
      });

      expect(result.isRecognized).toBe(true);
      expect(result.deviceName).toBe("Test Device");
      expect(result.verificationToken).toBeDefined();
      expect(result.verificationToken).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should not recognize inactive devices", async () => {
      const deviceFingerprint = "inactive-device-" + Date.now();
      const deviceToken = "inactive-token-" + Date.now();

      await db.insert(trustedDevices).values({
        phoneUserId: testUserId,
        deviceFingerprint,
        deviceName: "Inactive Device",
        deviceToken,
        isActive: "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(ctx);
      const result = await caller.deviceRegistration.verifyDevice({
        fingerprint: deviceFingerprint,
        email: testEmail,
      });

      expect(result.isRecognized).toBe(false);
    });
  });

  describe("verifyDeviceToken", () => {
    it("should verify valid device token", async () => {
      const deviceFingerprint = "token-test-" + Date.now();
      const deviceToken = "device-token-" + Date.now();
      const verificationToken = "verification-token-" + Date.now();

      await db.insert(trustedDevices).values({
        phoneUserId: testUserId,
        deviceFingerprint,
        deviceName: "Token Test Device",
        deviceToken,
        isActive: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(deviceVerificationTokens).values({
        phoneUserId: testUserId,
        token: verificationToken,
        deviceFingerprint,
        deviceName: "Token Test Device",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        verified: "false",
        createdAt: new Date(),
      });

      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const caller = appRouter.createCaller(ctx);
      const result = await caller.deviceRegistration.verifyDeviceToken({
        token: verificationToken,
      });

      expect(result.success).toBe(true);
      expect(result.phoneUserId).toBe(testUserId);
    });

    it("should reject expired verification token", async () => {
      const expiredToken = "expired-token-" + Date.now();

      await db.insert(deviceVerificationTokens).values({
        phoneUserId: testUserId,
        token: expiredToken,
        deviceFingerprint: "expired-device",
        deviceName: "Expired Device",
        expiresAt: new Date(Date.now() - 1000),
        verified: "false",
        createdAt: new Date(),
      });

      try {
        const ctx: TrpcContext = {
          user: null,
          req: { protocol: "https", headers: {} } as any,
          res: {} as any,
        };
        const caller = appRouter.createCaller(ctx);
        await caller.deviceRegistration.verifyDeviceToken({
          token: expiredToken,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Verification token expired");
      }
    });

    it("should reject invalid verification token", async () => {
      try {
        const ctx: TrpcContext = {
          user: null,
          req: { protocol: "https", headers: {} } as any,
          res: {} as any,
        };
        const caller = appRouter.createCaller(ctx);
        await caller.deviceRegistration.verifyDeviceToken({
          token: "invalid-token-that-does-not-exist",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid or expired verification token");
      }
    });
  });

  describe("listDevices", () => {
    it("should return empty list for user with no devices", async () => {
      const newUser = await db
        .insert(phoneUsers)
        .values({
          email: "no-devices-" + Date.now() + "@example.com",
          name: "No Devices User",
          phone: "+353871" + Date.now().toString().slice(-6),
          emailVerified: "true",
          verified: "true",
          role: "user",
          clientStatus: "customer",
          kycStatus: "verified",
        })
        .$returningId();

      const authCtx: TrpcContext = {
        user: {
          id: newUser[0].id,
          openId: "test",
          email: "test@example.com",
          name: "Test",
          loginMethod: "test",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const authenticatedCaller = appRouter.createCaller(authCtx);

      const result = await authenticatedCaller.deviceRegistration.listDevices();

      expect(result.success).toBe(true);
      expect(result.devices).toEqual([]);

      await db.delete(phoneUsers).where(eq(phoneUsers.id, newUser[0].id));
    });
  });

  describe("deactivateDevice", () => {
    it("should deactivate device for authenticated user", async () => {
      const deviceFingerprint = "deactivate-test-" + Date.now();
      const deviceToken = "deactivate-token-" + Date.now();

      const deviceResult = await db
        .insert(trustedDevices)
        .values({
          phoneUserId: testUserId,
          deviceFingerprint,
          deviceName: "Deactivate Test Device",
          deviceToken,
          isActive: "true",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .$returningId();

      const deviceId = deviceResult[0].id;

      const authCtx: TrpcContext = {
        user: {
          id: testUserId,
          openId: "test",
          email: "test@example.com",
          name: "Test",
          loginMethod: "test",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: { protocol: "https", headers: {} } as any,
        res: {} as any,
      };
      const authenticatedCaller = appRouter.createCaller(authCtx);

      const result = await authenticatedCaller.deviceRegistration.deactivateDevice({
        deviceId,
      });

      expect(result.success).toBe(true);

      const device = await db
        .select()
        .from(trustedDevices)
        .where(eq(trustedDevices.id, deviceId))
        .limit(1);

      expect(device[0].isActive).toBe("false");
    });
  });
});
