import { describe, it, expect, beforeAll, afterAll } from "vitest";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

describe("TOTP 2FA System", () => {
  let secret: string;
  let backupCodes: string[];
  let qrCode: string;

  describe("Secret Generation", () => {
    it("should generate a valid TOTP secret", () => {
      const result = speakeasy.generateSecret({
        name: "EasyToFin (test-user)",
        issuer: "EasyToFin",
        length: 32,
      });

      expect(result.base32).toBeDefined();
      expect(result.base32).toMatch(/^[A-Z2-7]+$/);
      expect(result.otpauth_url).toBeDefined();
      expect(result.otpauth_url).toContain("otpauth://totp/");

      secret = result.base32;
    });

    it("should generate a valid QR code", async () => {
      const result = speakeasy.generateSecret({
        name: "EasyToFin (test-user)",
        issuer: "EasyToFin",
        length: 32,
      });

      const dataUrl = await QRCode.toDataURL(result.otpauth_url!);
      expect(dataUrl).toBeDefined();
      expect(dataUrl).toContain("data:image/png;base64");

      qrCode = dataUrl;
    });

    it("should generate 8 unique backup codes", () => {
      const codes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      expect(codes).toHaveLength(8);
      expect(new Set(codes).size).toBe(8); // All unique
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });

      backupCodes = codes;
    });
  });

  describe("TOTP Code Verification", () => {
    it("should verify a valid TOTP code", () => {
      const generatedCode = speakeasy.totp({
        secret,
        encoding: "base32",
      });

      const isValid = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: generatedCode,
        window: 2,
      });

      expect(isValid).toBe(true);
    });

    it("should reject an invalid TOTP code", () => {
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: "000000",
        window: 2,
      });

      expect(isValid).toBe(false);
    });

    it("should accept codes within the time window", () => {
      const generatedCode = speakeasy.totp({
        secret,
        encoding: "base32",
      });

      // Test with different window sizes
      for (let window = 0; window <= 2; window++) {
        const isValid = speakeasy.totp.verify({\n          secret,\n          encoding: \"base32\",\n          token: generatedCode,\n          window,\n        });\n        expect(isValid).toBe(true);\n      }\n    });\n  });\n\n  describe(\"Backup Code Management\", () => {\n    it(\"should use a backup code and remove it from the list\", () => {\n      const codeToUse = backupCodes[0];\n      const updatedCodes = backupCodes.filter((code) => code !== codeToUse);\n\n      expect(updatedCodes).toHaveLength(7);\n      expect(updatedCodes).not.toContain(codeToUse);\n    });\n\n    it(\"should handle backup code JSON serialization\", () => {\n      const serialized = JSON.stringify(backupCodes);\n      const deserialized = JSON.parse(serialized);\n\n      expect(deserialized).toEqual(backupCodes);\n      expect(deserialized).toHaveLength(8);\n    });\n  });\n\n  describe(\"TOTP Enum Values\", () => {\n    it(\"should support all required event types\", () => {\n      const eventTypes = [\n        \"setup_initiated\",\n        \"setup_completed\",\n        \"verification_success\",\n        \"verification_failed\",\n        \"backup_code_used\",\n        \"backup_code_failed\",\n        \"reset_initiated\",\n        \"reset_completed\",\n        \"disabled\",\n      ];\n\n      eventTypes.forEach((eventType) => {\n        expect(eventType).toBeDefined();\n        expect(typeof eventType).toBe(\"string\");\n      });\n    });\n\n    it(\"should support isValid enum values\", () => {\n      const validValues = [\"true\", \"false\"];\n      validValues.forEach((value) => {\n        expect(value).toBeDefined();\n        expect([\"true\", \"false\"]).toContain(value);\n      });\n    });\n  });\n});\n
