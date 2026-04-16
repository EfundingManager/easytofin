import { describe, it, expect } from "vitest";
import {
  generateDeviceFingerprint,
  parseUserAgent,
  generateDeviceToken,
  isValidDeviceToken,
  createDeviceDisplayName,
  isFingerprintMatch,
  generateDeviceVerificationCode,
  extractDeviceInfoFromRequest,
} from "./deviceFingerprint";

describe("Device Fingerprinting", () => {
  describe("generateDeviceFingerprint", () => {
    it("should generate consistent fingerprint for same input", () => {
      const input = {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        acceptLanguage: "en-US,en;q=0.9",
        timezone: "UTC",
        screenResolution: "1920x1080",
        platform: "MacIntel",
        hardwareConcurrency: 8,
        deviceMemory: 16,
      };

      const fingerprint1 = generateDeviceFingerprint(input);
      const fingerprint2 = generateDeviceFingerprint(input);

      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });

    it("should generate different fingerprints for different inputs", () => {
      const input1 = {
        userAgent: "Mozilla/5.0 Chrome/91.0",
        acceptLanguage: "en-US",
      };

      const input2 = {
        userAgent: "Mozilla/5.0 Firefox/89.0",
        acceptLanguage: "fr-FR",
      };

      const fingerprint1 = generateDeviceFingerprint(input1);
      const fingerprint2 = generateDeviceFingerprint(input2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it("should handle missing optional fields", () => {
      const input = {
        userAgent: "Mozilla/5.0 Chrome/91.0",
      };

      const fingerprint = generateDeviceFingerprint(input);
      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("parseUserAgent", () => {
    it("should detect Chrome browser", () => {
      const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Chrome");
      expect(result.os).toBe("Windows");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Safari browser", () => {
      const ua =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Safari");
      expect(result.os).toBe("macOS");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Firefox browser", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Firefox");
      expect(result.os).toBe("Linux");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Edge browser", () => {
      const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Edge");
      expect(result.os).toBe("Windows");
    });

    it("should detect iOS device", () => {
      const ua =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
      const result = parseUserAgent(ua);

      expect(result.os).toBe("macOS");
      expect(result.deviceType).toBe("mobile");
    });

    it("should detect Android device", () => {
      const ua =
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.os).toBe("Linux");
      expect(result.deviceType).toBe("mobile");
    });

    it("should detect iPad as mobile", () => {
      const ua =
        "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
      const result = parseUserAgent(ua);

      expect(result.deviceType).toBe("mobile");
    });

    it("should return valid device name", () => {
      const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.deviceName).toContain("Chrome");
      expect(result.deviceName).toContain("Windows");
    });

    it("should generate fingerprint for parsed user agent", () => {
      const ua =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("generateDeviceToken", () => {
    it("should generate valid device token", () => {
      const token = generateDeviceToken();
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate unique tokens", () => {
      const token1 = generateDeviceToken();
      const token2 = generateDeviceToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate 64-character hex string", () => {
      const token = generateDeviceToken();
      expect(token.length).toBe(64);
    });
  });

  describe("isValidDeviceToken", () => {
    it("should validate correct device token format", () => {
      const token = generateDeviceToken();
      expect(isValidDeviceToken(token)).toBe(true);
    });

    it("should reject invalid token format", () => {
      expect(isValidDeviceToken("invalid-token")).toBe(false);
      expect(isValidDeviceToken("12345")).toBe(false);
      expect(isValidDeviceToken("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
    });

    it("should reject empty token", () => {
      expect(isValidDeviceToken("")).toBe(false);
    });

    it("should reject token with non-hex characters", () => {
      expect(isValidDeviceToken("g".repeat(64))).toBe(false);
    });
  });

  describe("createDeviceDisplayName", () => {
    it("should create readable device name", () => {
      const name = createDeviceDisplayName("Chrome", "Windows", "desktop");
      expect(name).toBe("Chrome on Windows (Desktop)");
    });

    it("should capitalize device type", () => {
      const name1 = createDeviceDisplayName("Safari", "iOS", "mobile");
      expect(name1).toBe("Safari on iOS (Mobile)");

      const name2 = createDeviceDisplayName("Chrome", "Android", "tablet");
      expect(name2).toBe("Chrome on Android (Tablet)");
    });

    it("should handle various browser names", () => {
      const name1 = createDeviceDisplayName("Firefox", "Linux", "desktop");
      expect(name1).toContain("Firefox");

      const name2 = createDeviceDisplayName("Edge", "Windows", "desktop");
      expect(name2).toContain("Edge");
    });
  });

  describe("isFingerprintMatch", () => {
    it("should match identical fingerprints", () => {
      const fp1 = "a".repeat(64);
      const fp2 = "a".repeat(64);

      expect(isFingerprintMatch(fp1, fp2)).toBe(true);
    });

    it("should not match different fingerprints", () => {
      const fp1 = "a".repeat(64);
      const fp2 = "b".repeat(64);

      expect(isFingerprintMatch(fp1, fp2)).toBe(false);
    });

    it("should be case-sensitive", () => {
      const fp1 = "abcdef" + "a".repeat(58);
      const fp2 = "ABCDEF" + "a".repeat(58);

      expect(isFingerprintMatch(fp1, fp2)).toBe(false);
    });
  });

  describe("generateDeviceVerificationCode", () => {
    it("should generate 6-digit code", () => {
      const code = generateDeviceVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should generate numeric code", () => {
      const code = generateDeviceVerificationCode();
      expect(parseInt(code)).toBeGreaterThanOrEqual(0);
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    });

    it("should generate different codes", () => {
      const code1 = generateDeviceVerificationCode();
      const code2 = generateDeviceVerificationCode();

      // High probability of being different (1 in 1,000,000 chance of collision)
      expect(code1).not.toBe(code2);
    });

    it("should pad with zeros if needed", () => {
      // Generate multiple codes to check for zero-padding
      let hasZeroPadded = false;
      for (let i = 0; i < 100; i++) {
        const code = generateDeviceVerificationCode();
        if (code.startsWith("0")) {
          hasZeroPadded = true;
          break;
        }
      }
      expect(hasZeroPadded).toBe(true);
    });
  });

  describe("extractDeviceInfoFromRequest", () => {
    it("should extract device info from request headers", () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
      const acceptLanguage = "en-US,en;q=0.9";
      const ipAddress = "192.168.1.1";

      const result = extractDeviceInfoFromRequest(userAgent, acceptLanguage, ipAddress);

      expect(result.userAgent).toBe(userAgent);
      expect(result.acceptLanguage).toBe(acceptLanguage);
      expect(result.ipAddress).toBe(ipAddress);
      expect(result.deviceInfo.browser).toBe("Chrome");
      expect(result.deviceInfo.os).toBe("Windows");
    });

    it("should handle missing optional headers", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

      const result = extractDeviceInfoFromRequest(userAgent);

      expect(result.userAgent).toBe(userAgent);
      expect(result.acceptLanguage).toBeUndefined();
      expect(result.ipAddress).toBeUndefined();
      expect(result.deviceInfo).toBeDefined();
    });

    it("should generate fingerprint for extracted device info", () => {
      const userAgent = "Mozilla/5.0 Chrome/91.0";
      const result = extractDeviceInfoFromRequest(userAgent);

      expect(result.deviceInfo.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("Device Fingerprinting Integration", () => {
    it("should create complete device profile", () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
      const acceptLanguage = "en-US";
      const ipAddress = "203.0.113.42";

      const deviceInfo = extractDeviceInfoFromRequest(userAgent, acceptLanguage, ipAddress);
      const token = generateDeviceToken();
      const verificationCode = generateDeviceVerificationCode();

      expect(deviceInfo.deviceInfo.browser).toBe("Safari");
      expect(deviceInfo.deviceInfo.deviceType).toBe("mobile");
      expect(isValidDeviceToken(token)).toBe(true);
      expect(verificationCode).toMatch(/^\d{6}$/);
    });

    it("should handle multiple device types", () => {
      const devices = [
        {
          ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
          expectedType: "desktop",
        },
        {
          ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6) Safari/604.1",
          expectedType: "mobile",
        },
        {
          ua: "Mozilla/5.0 (Linux; Android 11; SM-G991B) Chrome/91.0 Mobile Safari/537.36",
          expectedType: "mobile",
        },
      ];

      devices.forEach((device) => {
        const result = parseUserAgent(device.ua);
        expect(result.deviceType).toBe(device.expectedType);
      });
    });
  });
});
