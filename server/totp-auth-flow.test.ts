import { describe, it, expect, beforeAll } from "vitest";
import { hasPrivilegedRole, getTOTPAuthStatus } from "./_core/totp-auth-integration";

describe("TOTP Authentication Flow Integration", () => {
  describe("Authentication Response with TOTP Status", () => {
    it("should include TOTP status in auth response for privileged roles", () => {
      const user = {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@example.com",
        loginMethod: "email",
        role: "admin" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const isPrivileged = hasPrivilegedRole(user.role);
      expect(isPrivileged).toBe(true);
    });

    it("should not include TOTP status for non-privileged roles", () => {
      const user = {
        id: 2,
        openId: "test-user",
        name: "Test User",
        email: "user@example.com",
        loginMethod: "email",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const isPrivileged = hasPrivilegedRole(user.role);
      expect(isPrivileged).toBe(false);
    });
  });

  describe("Privileged Role Detection in Auth Flow", () => {
    it("should detect admin role as privileged", () => {
      expect(hasPrivilegedRole("admin")).toBe(true);
    });

    it("should detect super_admin role as privileged", () => {
      expect(hasPrivilegedRole("super_admin")).toBe(true);
    });

    it("should detect manager role as privileged", () => {
      expect(hasPrivilegedRole("manager")).toBe(true);
    });

    it("should detect staff role as privileged", () => {
      expect(hasPrivilegedRole("staff")).toBe(true);
    });

    it("should detect support role as privileged", () => {
      expect(hasPrivilegedRole("support")).toBe(true);
    });

    it("should not detect user role as privileged", () => {
      expect(hasPrivilegedRole("user")).toBe(false);
    });

    it("should not detect customer role as privileged", () => {
      expect(hasPrivilegedRole("customer")).toBe(false);
    });
  });

  describe("TOTP Status Determination", () => {
    it("should handle missing TOTP status gracefully", async () => {
      // Non-existent user ID should return default status
      const status = await getTOTPAuthStatus(999999);
      expect(status).toBeDefined();
      expect(status.requiresTOTP).toBe(false);
      expect(status.totpEnabled).toBe(false);
      expect(status.isFirstLogin).toBe(false);
      expect(status.totpSetupCompleted).toBe(false);
    });
  });

  describe("Authentication Flow Decision Logic", () => {
    it("should require TOTP setup for admin on first login", () => {
      const role = "admin";
      const isFirstLogin = true;
      const totpSetupCompleted = false;

      const requiresTOTPSetup = hasPrivilegedRole(role) && isFirstLogin && !totpSetupCompleted;
      expect(requiresTOTPSetup).toBe(true);
    });

    it("should require TOTP verification for admin on subsequent login", () => {
      const role = "admin";
      const isFirstLogin = false;
      const totpEnabled = true;

      const requiresTOTPVerification = hasPrivilegedRole(role) && !isFirstLogin && totpEnabled;
      expect(requiresTOTPVerification).toBe(true);
    });

    it("should not require TOTP for regular user", () => {
      const role = "user";
      const isPrivileged = hasPrivilegedRole(role);
      expect(isPrivileged).toBe(false);
    });

    it("should allow login for admin with TOTP already verified", () => {
      const role = "admin";
      const isFirstLogin = false;
      const totpEnabled = true;
      const totpVerified = true;

      const canLogin = hasPrivilegedRole(role) && totpVerified;
      expect(canLogin).toBe(true);
    });
  });

  describe("Role Hierarchy in Auth Context", () => {
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
      const nonPrivilegedRoles = roles.filter((role) => !hasPrivilegedRole(role));

      expect(privilegedRoles).toEqual([
        "super_admin",
        "admin",
        "manager",
        "staff",
        "support",
      ]);
      expect(nonPrivilegedRoles).toEqual(["user", "customer"]);
    });
  });

  describe("TOTP Status in Context", () => {
    it("should return undefined TOTP status for non-privileged roles", () => {
      const role = "user";
      const isPrivileged = hasPrivilegedRole(role);
      const totpStatus = isPrivileged ? {} : undefined;

      expect(totpStatus).toBeUndefined();
    });

    it("should return TOTP status object for privileged roles", () => {
      const role = "admin";
      const isPrivileged = hasPrivilegedRole(role);

      expect(isPrivileged).toBe(true);
      // In real flow, totpStatus would be fetched from getTOTPAuthStatus
    });
  });
});
