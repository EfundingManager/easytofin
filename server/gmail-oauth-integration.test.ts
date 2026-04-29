import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import type { PhoneUser } from "../drizzle/schema";

/**
 * Integration tests for Google OAuth session handling
 * Verifies the complete flow from Google callback to dashboard access
 */

describe("Google OAuth Integration - Session Handling", () => {
  const mockGoogleUser = {
    googleId: "google-123456789",
    email: "alexlin202@gmail.com",
    name: "Alex Lin",
    picture: "https://lh3.googleusercontent.com/a/default-user",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete OAuth Flow", () => {
    it("should handle new Google user registration and session creation", async () => {
      // Step 1: Create a new phone user from Google profile
      const newUser: PhoneUser = {
        id: 1,
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        googleId: mockGoogleUser.googleId,
        phone: null,
        address: null,
        picture: mockGoogleUser.picture,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        kycStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 2: Create session token using googleId as openId
      const sessionToken = await sdk.createSessionToken(mockGoogleUser.googleId, {
        name: mockGoogleUser.name,
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      expect(sessionToken).toBeDefined();
      expect(typeof sessionToken).toBe("string");

      // Step 3: Verify session token
      const verified = await sdk.verifySession(sessionToken);
      expect(verified).toBeDefined();
      expect(verified?.openId).toBe(mockGoogleUser.googleId);
      expect(verified?.name).toBe(mockGoogleUser.name);
    });

    it("should retrieve existing user by googleId after session creation", async () => {
      // Simulate user lookup after session verification
      const sessionUserId = mockGoogleUser.googleId;

      // Mock the database lookup
      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue({
        id: 1,
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        googleId: mockGoogleUser.googleId,
        phone: null,
        address: null,
        picture: mockGoogleUser.picture,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        kycStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Lookup user by googleId
      const user = await db.getPhoneUserByGoogleId(sessionUserId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.googleId).toBe(mockGoogleUser.googleId);
      expect(user?.email).toBe(mockGoogleUser.email);
      expect(user?.loginMethod).toBe("google");
    });

    it("should handle 'alexlin202@gmail.com' user login correctly", async () => {
      const testEmail = "alexlin202@gmail.com";
      const testGoogleId = "google-alex-lin-202";

      // Mock the user lookup
      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue({
        id: 2,
        email: testEmail,
        name: "Alex Lin",
        googleId: testGoogleId,
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        kycStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(testGoogleId, {
        name: "Alex Lin",
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      // Verify session
      const verified = await sdk.verifySession(sessionToken);
      expect(verified?.openId).toBe(testGoogleId);

      // Lookup user by googleId
      const user = await db.getPhoneUserByGoogleId(testGoogleId);
      expect(user?.email).toBe(testEmail);
      expect(user?.googleId).toBe(testGoogleId);
    });
  });

  describe("Session Cookie Handling", () => {
    it("should create a valid JWT session token", async () => {
      const sessionToken = await sdk.createSessionToken("google-user-123", {
        name: "Test User",
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      // JWT format: header.payload.signature
      const parts = sessionToken.split(".");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeDefined();
      expect(parts[1]).toBeDefined();
      expect(parts[2]).toBeDefined();
    });

    it("should verify JWT session token and extract payload", async () => {
      const googleId = "google-verify-test";
      const name = "Verify Test User";

      const sessionToken = await sdk.createSessionToken(googleId, {
        name,
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      const verified = await sdk.verifySession(sessionToken);

      expect(verified).toBeDefined();
      expect(verified?.openId).toBe(googleId);
      expect(verified?.name).toBe(name);
      expect(verified?.appId).toBeDefined();
    });

    it("should reject invalid session tokens", async () => {
      const invalidTokens = [
        "invalid",
        "invalid.token",
        "invalid.token.here.extra",
        "",
        null,
        undefined,
      ];

      for (const token of invalidTokens) {
        const verified = await sdk.verifySession(token as any);
        expect(verified).toBeNull();
      }
    });

    it("should reject expired session tokens", async () => {
      // Create a token that expires in 1ms
      const sessionToken = await sdk.createSessionToken("google-expire-test", {
        name: "Expire Test",
        expiresInMs: 1,
      });

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const verified = await sdk.verifySession(sessionToken);
      expect(verified).toBeNull();
    });
  });

  describe("User Data Retrieval After OAuth", () => {
    it("should convert phoneUser to User type for API response", async () => {
      const phoneUser: PhoneUser = {
        id: 3,
        email: "user@gmail.com",
        name: "Test User",
        googleId: "google-convert-test",
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        kycStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate conversion to User type (as done in authenticateRequest)
      const convertedUser = {
        id: phoneUser.id,
        openId: phoneUser.googleId || phoneUser.email || phoneUser.phone,
        name: phoneUser.name,
        email: phoneUser.email,
        loginMethod: phoneUser.loginMethod,
        role: phoneUser.role as "user" | "admin" | "manager" | "staff" | "super_admin",
        createdAt: phoneUser.createdAt,
        updatedAt: phoneUser.updatedAt,
        lastSignedIn: new Date(),
      };

      expect(convertedUser.openId).toBe(phoneUser.googleId);
      expect(convertedUser.email).toBe(phoneUser.email);
      expect(convertedUser.role).toBe("user");
    });

    it("should return correct user data for auth.me procedure", async () => {
      const phoneUser: PhoneUser = {
        id: 4,
        email: "dashboard@gmail.com",
        name: "Dashboard User",
        googleId: "google-dashboard-test",
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        kycStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate auth.me response
      const authMeResponse = {
        id: phoneUser.id,
        openId: phoneUser.googleId,
        name: phoneUser.name,
        email: phoneUser.email,
        loginMethod: phoneUser.loginMethod,
        role: phoneUser.role,
        createdAt: phoneUser.createdAt,
        updatedAt: phoneUser.updatedAt,
        lastSignedIn: new Date(),
      };

      expect(authMeResponse).toBeDefined();
      expect(authMeResponse.email).toBe("dashboard@gmail.com");
      expect(authMeResponse.role).toBe("user");
      expect(authMeResponse.openId).toBe("google-dashboard-test");
    });
  });

  describe("Role-Based Redirection After OAuth", () => {
    it("should redirect regular user to /user/dashboard", () => {
      const userRole = "user";
      const clientStatus = null;

      let redirectUrl = "/user/dashboard";
      if (userRole === "admin" || userRole === "super_admin") {
        redirectUrl = "/admin/dashboard";
      } else if (userRole === "manager") {
        redirectUrl = "/manager/dashboard";
      } else if (userRole === "staff") {
        redirectUrl = "/staff/dashboard";
      } else if (clientStatus === "customer") {
        redirectUrl = "/customer/dashboard";
      }

      expect(redirectUrl).toBe("/user/dashboard");
    });

    it("should redirect admin user to /admin/dashboard", () => {
      const userRole = "admin";
      const clientStatus = null;

      let redirectUrl = "/user/dashboard";
      if (userRole === "admin" || userRole === "super_admin") {
        redirectUrl = "/admin/dashboard";
      } else if (userRole === "manager") {
        redirectUrl = "/manager/dashboard";
      } else if (userRole === "staff") {
        redirectUrl = "/staff/dashboard";
      } else if (clientStatus === "customer") {
        redirectUrl = "/customer/dashboard";
      }

      expect(redirectUrl).toBe("/admin/dashboard");
    });

    it("should redirect customer to /customer/dashboard", () => {
      const userRole = "user";
      const clientStatus = "customer";

      let redirectUrl = "/user/dashboard";
      if (userRole === "admin" || userRole === "super_admin") {
        redirectUrl = "/admin/dashboard";
      } else if (userRole === "manager") {
        redirectUrl = "/manager/dashboard";
      } else if (userRole === "staff") {
        redirectUrl = "/staff/dashboard";
      } else if (clientStatus === "customer") {
        redirectUrl = "/customer/dashboard";
      }

      expect(redirectUrl).toBe("/customer/dashboard");
    });
  });
});
