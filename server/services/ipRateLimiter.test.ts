import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isIpRateLimited,
  recordIpRequest,
  getIpReputation,
  updateIpReputation,
  whitelistIp,
  blacklistIp,
  isIpWhitelisted,
  isIpBlacklisted,
  IP_RATE_LIMIT_CONFIG,
} from "./ipRateLimiter";

describe("IP Rate Limiter", () => {
  const testIp = "192.168.1.1";
  const testEndpoint = "/api/trpc/auth.verifyOtp";
  const testViolationType = "otp_verification";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("isIpRateLimited", () => {
    it("should return not limited for new IP", async () => {
      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      expect(result.limited).toBe(false);
    });

    it("should return limited after exceeding max attempts", async () => {
      // Record multiple requests
      for (let i = 0; i < IP_RATE_LIMIT_CONFIG.OTP_VERIFICATION.maxAttempts + 1; i++) {
        await recordIpRequest(testIp, testEndpoint, testViolationType);
      }

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      expect(result.limited).toBe(true);
      expect(result.remainingSeconds).toBeGreaterThan(0);
    });

    it("should return remaining seconds for blocked IP", async () => {
      // Record requests to trigger block
      for (let i = 0; i < IP_RATE_LIMIT_CONFIG.OTP_VERIFICATION.maxAttempts + 1; i++) {
        await recordIpRequest(testIp, testEndpoint, testViolationType);
      }

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      expect(result.remainingSeconds).toBeLessThanOrEqual(
        IP_RATE_LIMIT_CONFIG.BLOCK_DURATION_MINUTES * 60
      );
      expect(result.remainingSeconds).toBeGreaterThan(0);
    });
  });

  describe("recordIpRequest", () => {
    it("should record a request without error", async () => {
      await expect(
        recordIpRequest(testIp, testEndpoint, testViolationType, "Mozilla/5.0")
      ).resolves.not.toThrow();
    });

    it("should increment request count on multiple calls", async () => {
      await recordIpRequest(testIp, testEndpoint, testViolationType);
      await recordIpRequest(testIp, testEndpoint, testViolationType);

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      // After 2 requests, should not be limited yet
      expect(result.limited).toBe(false);
    });
  });

  describe("IP Reputation", () => {
    it("should return neutral reputation for new IP", async () => {
      const score = await getIpReputation(testIp);
      expect(score).toBe(50); // Default neutral score
    });

    it("should decrease reputation for failed attempts", async () => {
      await updateIpReputation(testIp, 5, 0, 0); // 5 failed attempts
      const score = await getIpReputation(testIp);
      expect(score).toBeLessThan(50);
    });

    it("should increase reputation for successful logins", async () => {
      await updateIpReputation(testIp, 0, 5, 0); // 5 successful logins
      const score = await getIpReputation(testIp);
      expect(score).toBeGreaterThan(50);
    });

    it("should decrease reputation for suspicious activity", async () => {
      await updateIpReputation(testIp, 0, 0, 3); // 3 suspicious activities
      const score = await getIpReputation(testIp);
      expect(score).toBeLessThan(50);
    });

    it("should clamp reputation score between 0-100", async () => {
      await updateIpReputation(testIp, 100, 0, 0); // Very high failed attempts
      const score = await getIpReputation(testIp);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("IP Whitelist", () => {
    it("should whitelist an IP", async () => {
      await whitelistIp(testIp, "corporate_network", "Test corporate network");
      const isWhitelisted = await isIpWhitelisted(testIp);
      expect(isWhitelisted).toBe(true);
    });

    it("should not rate limit whitelisted IP", async () => {
      await whitelistIp(testIp, "corporate_network");

      // Record many requests
      for (let i = 0; i < IP_RATE_LIMIT_CONFIG.OTP_VERIFICATION.maxAttempts + 5; i++) {
        await recordIpRequest(testIp, testEndpoint, testViolationType);
      }

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      expect(result.limited).toBe(false);
    });
  });

  describe("IP Blacklist", () => {
    it("should blacklist an IP", async () => {
      await blacklistIp(testIp, "brute_force_attack", "high");
      const isBlacklisted = await isIpBlacklisted(testIp);
      expect(isBlacklisted).toBe(true);
    });

    it("should rate limit blacklisted IP", async () => {
      await blacklistIp(testIp, "brute_force_attack", "high");

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      expect(result.limited).toBe(true);
    });

    it("should respect temporary blacklist expiration", async () => {
      const expiresAt = new Date(Date.now() - 1000); // Already expired
      await blacklistIp(testIp, "brute_force_attack", "high", "temporary", expiresAt);

      const result = await isIpRateLimited(testIp, testEndpoint, testViolationType);
      // Should not be limited since the blacklist has expired
      expect(result.limited).toBe(false);
    });
  });

  describe("Rate Limit Configuration", () => {
    it("should have valid configuration for all violation types", () => {
      const violationTypes = [
        "OTP_VERIFICATION",
        "OTP_REQUEST",
        "LOGIN_ATTEMPT",
        "PASSWORD_RESET",
        "ACCOUNT_UNLOCK_REQUEST",
      ];

      violationTypes.forEach((type) => {
        const config = IP_RATE_LIMIT_CONFIG[type as keyof typeof IP_RATE_LIMIT_CONFIG];
        expect(config).toBeDefined();
        if (typeof config !== "number") {
          expect(config.maxAttempts).toBeGreaterThan(0);
          expect(config.windowSeconds).toBeGreaterThan(0);
        }
      });
    });

    it("should have positive block duration", () => {
      expect(IP_RATE_LIMIT_CONFIG.BLOCK_DURATION_MINUTES).toBeGreaterThan(0);
    });
  });

  describe("Different violation types", () => {
    it("should handle OTP_REQUEST violation type", async () => {
      const result = await isIpRateLimited(testIp, testEndpoint, "otp_request");
      expect(result).toHaveProperty("limited");
      expect(typeof result.limited).toBe("boolean");
    });

    it("should handle LOGIN_ATTEMPT violation type", async () => {
      const result = await isIpRateLimited(testIp, testEndpoint, "login_attempt");
      expect(result).toHaveProperty("limited");
      expect(typeof result.limited).toBe("boolean");
    });

    it("should handle PASSWORD_RESET violation type", async () => {
      const result = await isIpRateLimited(testIp, testEndpoint, "password_reset");
      expect(result).toHaveProperty("limited");
      expect(typeof result.limited).toBe("boolean");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty IP address gracefully", async () => {
      const result = await isIpRateLimited("", testEndpoint, testViolationType);
      expect(result).toHaveProperty("limited");
    });

    it("should handle IPv6 addresses", async () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      const result = await isIpRateLimited(ipv6, testEndpoint, testViolationType);
      expect(result).toHaveProperty("limited");
    });

    it("should handle very long endpoint names", async () => {
      const longEndpoint = "/api/trpc/" + "a".repeat(200);
      const result = await isIpRateLimited(testIp, longEndpoint, testViolationType);
      expect(result).toHaveProperty("limited");
    });
  });
});
