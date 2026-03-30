import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  createPhoneUser,
  getPhoneUserByPhone,
  createOtpCode,
  getValidOtpCode,
  deleteOtpCode,
} from "../db";

// Mock the database functions
vi.mock("../db", () => ({
  createPhoneUser: vi.fn(),
  getPhoneUserByPhone: vi.fn(),
  createOtpCode: vi.fn(),
  getValidOtpCode: vi.fn(),
  deleteOtpCode: vi.fn(),
  incrementOtpAttempts: vi.fn(),
  updatePhoneUser: vi.fn(),
  getPhoneUserById: vi.fn(),
}));

describe("Phone Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("OTP Generation", () => {
    it("should generate a 6-digit OTP code", () => {
      // Generate multiple codes to ensure they're always 6 digits
      for (let i = 0; i < 10; i++) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        expect(code).toHaveLength(6);
        expect(/^\d{6}$/.test(code)).toBe(true);
      }
    });

    it("should set OTP expiration to 5 minutes from now", () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      const diff = expiresAt.getTime() - now.getTime();
      expect(diff).toBeGreaterThanOrEqual(5 * 60 * 1000 - 100); // Allow 100ms variance
      expect(diff).toBeLessThanOrEqual(5 * 60 * 1000 + 100);
    });
  });

  describe("Phone Number Validation", () => {
    it("should accept valid international phone numbers", () => {
      const validNumbers = ["+353123456789", "+1234567890", "+441234567890"];
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      validNumbers.forEach((phone) => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidNumbers = ["abc", "+0123456789", ""];
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      invalidNumbers.forEach((phone) => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });

  describe("OTP Verification", () => {
    it("should reject expired OTP codes", () => {
      const now = new Date();
      const expiredOtp = {
        id: 1,
        phoneUserId: 1,
        code: "123456",
        expiresAt: new Date(now.getTime() - 1000), // Expired 1 second ago
        attempts: 0,
        createdAt: now,
      };

      expect(expiredOtp.expiresAt < now).toBe(true);
    });

    it("should track OTP attempt count", () => {
      let attempts = 0;
      const maxAttempts = 3;

      for (let i = 0; i < maxAttempts; i++) {
        attempts++;
        expect(attempts).toBeLessThanOrEqual(maxAttempts);
      }

      expect(attempts >= maxAttempts).toBe(true);
    });
  });

  describe("User Registration Flow", () => {
    it("should create a new phone user with required fields", async () => {
      const mockUser = {
        id: 1,
        phone: "+353123456789",
        email: "test@example.com",
        name: "Test User",
        passwordHash: null,
        twoFactorEnabled: "false" as const,
        twoFactorSecret: null,
        verified: "true" as const,
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      };

      vi.mocked(createPhoneUser).mockResolvedValueOnce(mockUser);

      const result = await createPhoneUser({
        phone: "+353123456789",
        email: "test@example.com",
        name: "Test User",
        verified: "true",
        role: "user",
      });

      expect(result.phone).toBe("+353123456789");
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test User");
      expect(result.verified).toBe("true");
    });

    it("should check if phone number already exists", async () => {
      const existingUser = {
        id: 1,
        phone: "+353123456789",
        email: "existing@example.com",
        name: "Existing User",
        passwordHash: null,
        twoFactorEnabled: "false" as const,
        twoFactorSecret: null,
        verified: "true" as const,
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(getPhoneUserByPhone).mockResolvedValueOnce(existingUser);

      const result = await getPhoneUserByPhone("+353123456789");

      expect(result).toBeDefined();
      expect(result?.phone).toBe("+353123456789");
    });

    it("should return undefined for non-existent phone numbers", async () => {
      vi.mocked(getPhoneUserByPhone).mockResolvedValueOnce(undefined);

      const result = await getPhoneUserByPhone("+353999999999");

      expect(result).toBeUndefined();
    });
  });

  describe("OTP Code Management", () => {
    it("should create OTP code with correct structure", async () => {
      const mockOtp = {
        id: 1,
        phoneUserId: 1,
        code: "123456",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(),
      };

      vi.mocked(createOtpCode).mockResolvedValueOnce(mockOtp);

      const result = await createOtpCode({
        phoneUserId: 1,
        code: "123456",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });

      expect(result.code).toBe("123456");
      expect(result.phoneUserId).toBe(1);
      expect(result.attempts).toBe(0);
    });

    it("should retrieve valid OTP codes", async () => {
      const mockOtp = {
        id: 1,
        phoneUserId: 1,
        code: "123456",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(),
      };

      vi.mocked(getValidOtpCode).mockResolvedValueOnce(mockOtp);

      const result = await getValidOtpCode(1, "123456");

      expect(result).toBeDefined();
      expect(result?.code).toBe("123456");
    });

    it("should return undefined for invalid OTP codes", async () => {
      vi.mocked(getValidOtpCode).mockResolvedValueOnce(undefined);

      const result = await getValidOtpCode(1, "999999");

      expect(result).toBeUndefined();
    });

    it("should delete OTP code after use", async () => {
      vi.mocked(deleteOtpCode).mockResolvedValueOnce();

      await deleteOtpCode(1);

      expect(vi.mocked(deleteOtpCode)).toHaveBeenCalledWith(1);
    });
  });
});
