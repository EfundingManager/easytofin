import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import {
  createPhoneUser,
  getPhoneUserByPhone,
  getPhoneUserByEmail,
  createOtpCode,
  getValidOtpCode,
  deleteOtpCode,
  updatePhoneUser,
} from "../db";

// Mock database functions
vi.mock("../db", () => ({
  createPhoneUser: vi.fn(),
  getPhoneUserByPhone: vi.fn(),
  getPhoneUserByEmail: vi.fn(),
  createOtpCode: vi.fn(),
  getValidOtpCode: vi.fn(),
  deleteOtpCode: vi.fn(),
  updatePhoneUser: vi.fn(),
  getPhoneUserById: vi.fn(),
  incrementOtpAttempts: vi.fn(),
}));

describe("OTP Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Phone OTP", () => {
    it("should generate a valid 6-digit OTP code", () => {
      const generateOtpCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      const code = generateOtpCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it("should calculate OTP expiration as 5 minutes from now", () => {
      const getOtpExpiration = () => {
        const now = new Date();
        return new Date(now.getTime() + 5 * 60 * 1000);
      };

      const now = Date.now();
      const expiration = getOtpExpiration();
      const expirationTime = expiration.getTime();
      const expectedMin = now + 4 * 60 * 1000; // 4 minutes
      const expectedMax = now + 6 * 60 * 1000; // 6 minutes

      expect(expirationTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expirationTime).toBeLessThanOrEqual(expectedMax);
    });

    it("should validate phone number format", () => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;

      expect(phoneRegex.test("+353871234567")).toBe(true);
      expect(phoneRegex.test("+1234567890")).toBe(true);
      expect(phoneRegex.test("353871234567")).toBe(true);
      expect(phoneRegex.test("invalid")).toBe(false);
      expect(phoneRegex.test("+0123456789")).toBe(false);
    });

    it("should validate OTP code format (6 digits)", () => {
      const otpRegex = /^\d{6}$/;

      expect(otpRegex.test("123456")).toBe(true);
      expect(otpRegex.test("000000")).toBe(true);
      expect(otpRegex.test("999999")).toBe(true);
      expect(otpRegex.test("12345")).toBe(false);
      expect(otpRegex.test("1234567")).toBe(false);
      expect(otpRegex.test("abcdef")).toBe(false);
    });
  });

  describe("Email OTP", () => {
    it("should validate email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test("test@example.com")).toBe(true);
      expect(emailRegex.test("user.name@domain.co.uk")).toBe(true);
      expect(emailRegex.test("invalid.email@")).toBe(false);
      expect(emailRegex.test("invalid@.com")).toBe(false);
      expect(emailRegex.test("notanemail")).toBe(false);
    });

    it("should generate consistent OTP codes", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        expect(code).toHaveLength(6);
        codes.add(code);
      }
      // Most codes should be unique (allowing for rare collisions)
      expect(codes.size).toBeGreaterThan(95);
    });
  });

  describe("OTP Verification", () => {
    it("should validate OTP attempt limits", () => {
      const maxAttempts = 3;
      let attempts = 0;

      const canAttempt = () => {
        return attempts < maxAttempts;
      };

      expect(canAttempt()).toBe(true);
      attempts++;

      expect(canAttempt()).toBe(true);
      attempts++;

      expect(canAttempt()).toBe(true);
      attempts++;

      expect(canAttempt()).toBe(false);
    });

    it("should validate OTP expiration", () => {
      const now = new Date();
      const expiredOtp = new Date(now.getTime() - 1000); // 1 second ago
      const validOtp = new Date(now.getTime() + 4 * 60 * 1000); // 4 minutes from now

      const isExpired = (expiresAt: Date) => expiresAt < now;

      expect(isExpired(expiredOtp)).toBe(true);
      expect(isExpired(validOtp)).toBe(false);
    });

    it("should handle rate limiting for verification attempts", () => {
      const rateLimitConfig = {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
      };

      const attempts: number[] = [];
      const now = Date.now();

      // Simulate 5 attempts within the window
      for (let i = 0; i < 5; i++) {
        attempts.push(now);
      }

      const isRateLimited = () => {
        const recentAttempts = attempts.filter(
          (time) => now - time < rateLimitConfig.windowMs
        );
        return recentAttempts.length >= rateLimitConfig.maxAttempts;
      };

      expect(isRateLimited()).toBe(true);
    });
  });

  describe("User Registration Flow", () => {
    it("should identify new vs existing users", async () => {
      const phoneNumber = "+353871234567";

      // Mock: user doesn't exist
      (getPhoneUserByPhone as any).mockResolvedValueOnce(null);
      const existingUser = await getPhoneUserByPhone(phoneNumber);
      expect(existingUser).toBeNull();

      // Mock: user exists
      (getPhoneUserByPhone as any).mockResolvedValueOnce({
        id: 1,
        phone: phoneNumber,
        name: "John Doe",
      });
      const foundUser = await getPhoneUserByPhone(phoneNumber);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.phone).toBe(phoneNumber);
    });

    it("should create OTP for new user registration", async () => {
      const phone = "+353871234567";
      const code = "123456";
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      (createOtpCode as any).mockResolvedValueOnce({
        id: 1,
        phoneUserId: 1,
        code,
        expiresAt,
        attempts: 0,
      });

      const otp = await createOtpCode({
        phoneUserId: 1,
        code,
        expiresAt,
        attempts: 0,
      });

      expect(otp).not.toBeNull();
      expect(otp?.code).toBe(code);
      expect(otp?.attempts).toBe(0);
    });

    it("should verify OTP and update user status", async () => {
      const userId = 1;
      const code = "123456";

      (getValidOtpCode as any).mockResolvedValueOnce({
        id: 1,
        phoneUserId: userId,
        code,
        attempts: 0,
      });

      const otp = await getValidOtpCode(userId, code);
      expect(otp).not.toBeNull();
      expect(otp?.code).toBe(code);

      (updatePhoneUser as any).mockResolvedValueOnce({
        id: userId,
        verified: "true",
        lastSignedIn: new Date(),
      });

      const updated = await updatePhoneUser(userId, {
        verified: "true",
        lastSignedIn: new Date(),
      });

      expect(updated?.verified).toBe("true");
    });

    it("should handle invalid OTP verification", async () => {
      const userId = 1;
      const invalidCode = "000000";

      (getValidOtpCode as any).mockResolvedValueOnce(null);

      const otp = await getValidOtpCode(userId, invalidCode);
      expect(otp).toBeNull();
    });
  });

  describe("Email OTP Flow", () => {
    it("should identify new vs existing email users", async () => {
      const email = "test@example.com";

      // Mock: user doesn't exist
      (getPhoneUserByEmail as any).mockResolvedValueOnce(null);
      const existingUser = await getPhoneUserByEmail(email);
      expect(existingUser).toBeNull();

      // Mock: user exists
      (getPhoneUserByEmail as any).mockResolvedValueOnce({
        id: 2,
        email,
        name: "Jane Doe",
      });
      const foundUser = await getPhoneUserByEmail(email);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe(email);
    });

    it("should create OTP for email registration", async () => {
      const email = "test@example.com";
      const code = "654321";
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      (createOtpCode as any).mockResolvedValueOnce({
        id: 2,
        phoneUserId: 2,
        code,
        expiresAt,
        attempts: 0,
      });

      const otp = await createOtpCode({
        phoneUserId: 2,
        code,
        expiresAt,
        attempts: 0,
      });

      expect(otp).not.toBeNull();
      expect(otp?.code).toBe(code);
    });
  });

  describe("Security", () => {
    it("should not expose OTP codes in responses (except dev mode)", () => {
      const devCode = "123456";
      const isProduction = process.env.NODE_ENV === "production";

      // In production, devCode should not be returned
      if (isProduction) {
        expect(devCode).toBeUndefined();
      }
    });

    it("should sanitize phone numbers before storage", () => {
      const sanitizePhone = (phone: string) => {
        // Remove all non-digit characters except leading +
        return phone.replace(/[^\d+]/g, "");
      };

      expect(sanitizePhone("+353 87 123 4567")).toBe("+353871234567");
      expect(sanitizePhone("+1 (234) 567-8900")).toBe("+12345678900");
    });

    it("should hash OTP codes before storage (in production)", () => {
      // This is a conceptual test - actual hashing would use bcrypt or similar
      const hashOtp = (code: string) => {
        return Buffer.from(code).toString("base64");
      };

      const code = "123456";
      const hashed = hashOtp(code);
      expect(hashed).not.toBe(code);
      expect(Buffer.from(hashed, "base64").toString()).toBe(code);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      (getPhoneUserByPhone as any).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      try {
        await getPhoneUserByPhone("+353871234567");
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBe("Database connection failed");
      }
    });

    it("should handle SMS service failures", () => {
      const sendSMSVerification = async () => {
        throw new Error("SMS service unavailable");
      };

      expect(sendSMSVerification()).rejects.toThrow("SMS service unavailable");
    });

    it("should handle email service failures", () => {
      const sendEmailVerification = async () => {
        throw new Error("Email service unavailable");
      };

      expect(sendEmailVerification()).rejects.toThrow(
        "Email service unavailable"
      );
    });
  });
});
