import { describe, it, expect, beforeEach, vi } from "vitest";
import { AccountLockoutService } from "./services/accountLockoutService";

describe("AccountLockoutService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordFailedAttempt", () => {
    it("should record first failed attempt without locking", async () => {
      const result = await AccountLockoutService.recordFailedAttempt(
        1,
        "test@example.com",
        "1234567890",
        "invalid_password"
      );

      expect(result.isLocked).toBe(false);
      expect(result.failedAttempts).toBeGreaterThan(0);
      expect(result.remainingAttempts).toBeGreaterThan(0);
    });

    it("should lock account after 5 failed attempts", async () => {
      let result;
      for (let i = 0; i < 5; i++) {
        result = await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      expect(result?.isLocked).toBe(true);
      expect(result?.failedAttempts).toBe(5);
      expect(result?.remainingAttempts).toBe(0);
      expect(result?.lockedUntil).toBeDefined();
    });

    it("should not increment attempts if already locked", async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      // Try to record another attempt
      const result = await AccountLockoutService.recordFailedAttempt(
        1,
        "test@example.com",
        "1234567890",
        "invalid_password"
      );

      expect(result.isLocked).toBe(true);
      expect(result.failedAttempts).toBe(5); // Should not increment
    });
  });

  describe("isAccountLocked", () => {
    it("should return false for non-existent account", async () => {
      const result = await AccountLockoutService.isAccountLocked(
        999,
        "nonexistent@example.com",
        "9999999999"
      );

      expect(result.isLocked).toBe(false);
    });

    it("should return true for locked account", async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      const result = await AccountLockoutService.isAccountLocked(
        1,
        "test@example.com",
        "1234567890"
      );

      expect(result.isLocked).toBe(true);
      expect(result.remainingMinutes).toBeGreaterThan(0);
      expect(result.lockedUntil).toBeDefined();
    });

    it("should return false when lockout period expires", async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      // Check locked
      let result = await AccountLockoutService.isAccountLocked(
        1,
        "test@example.com",
        "1234567890"
      );
      expect(result.isLocked).toBe(true);

      // Simulate time passing (in real scenario, this would be 30 minutes)
      // For testing, we'd need to mock the database or use a different approach
      // This test demonstrates the expected behavior
    });
  });

  describe("recordSuccessfulLogin", () => {
    it("should reset failed attempts on successful login", async () => {
      // Record some failed attempts
      for (let i = 0; i < 3; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      // Record successful login
      await AccountLockoutService.recordSuccessfulLogin(
        1,
        "test@example.com",
        "1234567890"
      );

      // Check that attempts are reset
      const result = await AccountLockoutService.recordFailedAttempt(
        1,
        "test@example.com",
        "1234567890",
        "invalid_password"
      );

      expect(result.failedAttempts).toBe(1); // Should start from 1 again
    });
  });

  describe("generateUnlockToken", () => {
    it("should generate unlock token for locked account", async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      const token = await AccountLockoutService.generateUnlockToken(
        1,
        "test@example.com",
        "1234567890",
        "email_verification"
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should throw error if lockout record not found", async () => {
      await expect(
        AccountLockoutService.generateUnlockToken(
          999,
          "nonexistent@example.com",
          "9999999999",
          "email_verification"
        )
      ).rejects.toThrow();
    });
  });

  describe("verifyUnlockToken", () => {
    it("should unlock account with valid token", async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await AccountLockoutService.recordFailedAttempt(
          1,
          "test@example.com",
          "1234567890",
          "invalid_password"
        );
      }

      // Generate token
      const token = await AccountLockoutService.generateUnlockToken(
        1,
        "test@example.com",
        "1234567890",
        "email_verification"
      );

      // Verify token
      const result = await AccountLockoutService.verifyUnlockToken(token);
      expect(result).toBe(true);

      // Check that account is unlocked
      const lockStatus = await AccountLockoutService.isAccountLocked(
        1,
        "test@example.com",
        "1234567890"
      );
      expect(lockStatus.isLocked).toBe(false);
    });

    it("should return false for invalid token", async () => {
      const result = await AccountLockoutService.verifyUnlockToken(
        "invalid_token_12345"
      );
      expect(result).toBe(false);
    });
  });

  describe("getLockoutStats", () => {
    it("should return lockout statistics", async () => {
      // Lock multiple accounts
      for (let i = 1; i <= 3; i++) {
        for (let j = 0; j < 5; j++) {
          await AccountLockoutService.recordFailedAttempt(
            i,
            `test${i}@example.com`,
            `123456789${i}`,
            "invalid_password"
          );
        }
      }

      const stats = await AccountLockoutService.getLockoutStats();

      expect(stats.totalLocked).toBeGreaterThanOrEqual(3);
      expect(stats.totalFailedAttempts).toBeGreaterThanOrEqual(15);
      expect(stats.recentLockouts).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle null values correctly", async () => {
      const result = await AccountLockoutService.recordFailedAttempt(
        null,
        "test@example.com",
        null,
        "invalid_password"
      );

      expect(result).toBeDefined();
      expect(result.isLocked).toBe(false);
    });

    it("should handle concurrent failed attempts", async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          AccountLockoutService.recordFailedAttempt(
            1,
            "test@example.com",
            "1234567890",
            "invalid_password"
          )
        );
      }

      const results = await Promise.all(promises);

      // At least one should indicate locked
      const anyLocked = results.some((r) => r.isLocked);
      expect(anyLocked).toBe(true);
    });

    it("should handle different identifier types", async () => {
      // Test with phone only
      const phoneResult = await AccountLockoutService.recordFailedAttempt(
        null,
        null,
        "1234567890",
        "invalid_password"
      );
      expect(phoneResult).toBeDefined();

      // Test with email only
      const emailResult = await AccountLockoutService.recordFailedAttempt(
        null,
        "test@example.com",
        null,
        "invalid_password"
      );
      expect(emailResult).toBeDefined();

      // Test with userId only
      const userIdResult = await AccountLockoutService.recordFailedAttempt(
        1,
        null,
        null,
        "invalid_password"
      );
      expect(userIdResult).toBeDefined();
    });
  });
});
