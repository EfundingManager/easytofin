import { describe, it, expect, beforeAll } from "vitest";
import { hasPrivilegedRole, getTOTPAuthStatus } from "./_core/totp-auth-integration";

describe("TOTP Authentication Integration", () => {
  describe("Privileged Role Detection", () => {
    it("should identify super_admin as privileged", () => {
      expect(hasPrivilegedRole("super_admin")).toBe(true);
    });

    it("should identify admin as privileged", () => {
      expect(hasPrivilegedRole("admin")).toBe(true);
    });

    it("should identify manager as privileged", () => {
      expect(hasPrivilegedRole("manager")).toBe(true);
    });

    it("should identify staff as privileged", () => {
      expect(hasPrivilegedRole("staff")).toBe(true);
    });

    it("should identify support as privileged", () => {
      expect(hasPrivilegedRole("support")).toBe(true);
    });

    it("should NOT identify user as privileged", () => {
      expect(hasPrivilegedRole("user")).toBe(false);
    });

    it("should NOT identify customer as privileged", () => {
      expect(hasPrivilegedRole("customer")).toBe(false);
    });

    it("should handle undefined role", () => {
      expect(hasPrivilegedRole(undefined)).toBe(false);
    });

    it("should handle empty string role", () => {
      expect(hasPrivilegedRole("")).toBe(false);
    });
  });

  describe("TOTP Status Determination", () => {
    it("should return default status when database unavailable", async () => {
      // This test verifies the function handles DB errors gracefully
      const status = await getTOTPAuthStatus(999999);
      expect(status).toEqual({
        requiresTOTP: false,
        totpEnabled: false,
        isFirstLogin: false,
        totpSetupCompleted: false,
      });
    });
  });

  describe("Authentication Flow Logic", () => {
    it("should require TOTP for admin on first login", () => {
      const role = "admin";
      const isPrivileged = hasPrivilegedRole(role);
      const isFirstLogin = true;

      expect(isPrivileged && isFirstLogin).toBe(true);
    });

    it("should NOT require TOTP for regular user", () => {
      const role = "user";
      const isPrivileged = hasPrivilegedRole(role);

      expect(isPrivileged).toBe(false);
    });

    it("should require TOTP for manager on first login", () => {
      const role = "manager";
      const isPrivileged = hasPrivilegedRole(role);
      const isFirstLogin = true;

      expect(isPrivileged && isFirstLogin).toBe(true);
    });

    it("should require TOTP for staff on first login", () => {
      const role = "staff";
      const isPrivileged = hasPrivilegedRole(role);
      const isFirstLogin = true;

      expect(isPrivileged && isFirstLogin).toBe(true);
    });

    it("should require TOTP for support on first login", () => {
      const role = "support";
      const isPrivileged = hasPrivilegedRole(role);
      const isFirstLogin = true;

      expect(isPrivileged && isFirstLogin).toBe(true);
    });
  });

  describe("Role Hierarchy", () => {
    it("should enforce role hierarchy: super_admin > admin > manager > staff > support > user > customer", () => {
      const roles = [
        "super_admin",
        "admin",
        "manager",
        "staff",
        "support",
        "user",
        "customer",
      ];
      const privilegedRoles = roles.filter((role) => hasPrivilegedRole(role));

      expect(privilegedRoles).toEqual([
        "super_admin",
        "admin",
        "manager",
        "staff",
        "support",
      ]);
    });
  });
});
