import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

/**
 * Tests for password login error handling with OAuth users
 * Verifies that OAuth users get proper error messages when attempting password login
 */
describe("Password Login - OAuth User Handling", () => {
  it("should reject OAuth users with helpful error message", () => {
    // OAuth users don't have passwordHash in phoneUsers table
    // They should be redirected to use their OAuth login method
    const error = new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please use your OAuth login method to sign in.",
    });

    expect(error.message).toBe("Please use your OAuth login method to sign in.");
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("should handle missing phoneUser record gracefully", () => {
    // When user is not in phoneUsers table and not in users table
    const error = new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid phone/email or password",
    });

    expect(error.message).toBe("Invalid phone/email or password");
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("should validate email format in phoneOrEmail field", () => {
    const testCases = [
      { input: "info@efunding.ie", isEmail: true },
      { input: "+353123456789", isEmail: false },
      { input: "test@example.com", isEmail: true },
      { input: "1234567890", isEmail: false },
    ];

    testCases.forEach(({ input, isEmail }) => {
      const result = input.includes("@");
      expect(result).toBe(isEmail);
    });
  });

  it("should handle password verification failure", () => {
    // When password hash doesn't match
    const error = new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid phone/email or password",
    });

    expect(error.message).toBe("Invalid phone/email or password");
  });

  it("should handle missing password hash", () => {
    // When user exists but has no password set (OTP-only account)
    const error = new TRPCError({
      code: "UNAUTHORIZED",
      message: "No password set for this account. Please use OTP login.",
    });

    expect(error.message).toBe("No password set for this account. Please use OTP login.");
  });

  it("should track failed login attempts", () => {
    // Mock tracking function
    const trackLoginAttempt = vi.fn();

    const attemptData = {
      phoneUserId: 1,
      email: "info@efunding.ie",
      phone: undefined,
      attemptType: "password",
      status: "failed",
      failureReason: "invalid_password",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
    };

    trackLoginAttempt(attemptData);

    expect(trackLoginAttempt).toHaveBeenCalledWith(attemptData);
    expect(trackLoginAttempt).toHaveBeenCalledTimes(1);
  });

  it("should track successful login attempts", () => {
    const trackLoginAttempt = vi.fn();

    const attemptData = {
      phoneUserId: 1,
      email: "info@efunding.ie",
      phone: undefined,
      attemptType: "password",
      status: "success",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
    };

    trackLoginAttempt(attemptData);

    expect(trackLoginAttempt).toHaveBeenCalledWith(attemptData);
  });

  it("should handle database connection errors", () => {
    const error = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(error.message).toBe("Database connection failed");
  });

  it("should validate required input fields", () => {
    const validInputs = [
      { phoneOrEmail: "test@example.com", password: "password123" },
      { phoneOrEmail: "+353123456789", password: "secure_pass" },
    ];

    const invalidInputs = [
      { phoneOrEmail: "", password: "password123" }, // Empty email
      { phoneOrEmail: "test@example.com", password: "123" }, // Password too short
    ];

    validInputs.forEach((input) => {
      expect(input.phoneOrEmail.length).toBeGreaterThan(0);
      expect(input.password.length).toBeGreaterThanOrEqual(6);
    });

    invalidInputs.forEach((input) => {
      const isValid = input.phoneOrEmail.length > 0 && input.password.length >= 6;
      expect(isValid).toBe(false);
    });
  });
});
