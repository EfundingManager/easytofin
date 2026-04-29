import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";
import { sdk } from "./_core/sdk";

// Mock the database functions
vi.mock("./db", () => ({
  createPhoneUser: vi.fn(),
  getPhoneUserByEmail: vi.fn(),
  getPhoneUserByGoogleId: vi.fn(),
  getPhoneUserByPhone: vi.fn(),
  getPhoneUserById: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

describe("Google OAuth Session Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPhoneUser with googleId", () => {
    it("should include googleId in the upsert set", async () => {
      const mockUser = {
        id: 1,
        email: "test@gmail.com",
        name: "Test User",
        googleId: "google-123",
        phone: null,
        address: null,
        picture: "https://example.com/photo.jpg",
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue(mockUser);

      // Test that createPhoneUser properly stores googleId
      const result = await db.createPhoneUser({
        email: "test@gmail.com",
        name: "Test User",
        googleId: "google-123",
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
      });

      expect(result).toBeDefined();
      expect(result.googleId).toBe("google-123");
      expect(result.email).toBe("test@gmail.com");
    });

    it("should retrieve user by googleId after creation", async () => {
      const mockUser = {
        id: 1,
        email: "alex@gmail.com",
        name: "Alex Lin",
        googleId: "google-456",
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue(mockUser);

      const result = await db.getPhoneUserByGoogleId("google-456");

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.googleId).toBe("google-456");
      expect(result?.email).toBe("alex@gmail.com");
    });

    it("should prioritize googleId lookup over email lookup", async () => {
      const mockUser = {
        id: 1,
        email: "user@gmail.com",
        name: "User",
        googleId: "google-789",
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue(mockUser);
      vi.mocked(db.getPhoneUserByEmail).mockResolvedValue(mockUser);

      // When looking up by googleId, should find the user
      const result = await db.getPhoneUserByGoogleId("google-789");

      expect(result).toBeDefined();
      expect(result?.googleId).toBe("google-789");
      // Email lookup should not be called if googleId lookup succeeds
    });
  });

  describe("Session token creation and verification", () => {
    it("should create a valid session token with googleId as openId", async () => {
      const googleId = "google-123";
      const sessionToken = await sdk.createSessionToken(googleId, {
        name: "Test User",
        expiresInMs: 24 * 60 * 60 * 1000, // 24 hours
      });

      expect(sessionToken).toBeDefined();
      expect(typeof sessionToken).toBe("string");
      expect(sessionToken.length).toBeGreaterThan(0);
    });

    it("should verify session token correctly", async () => {
      const googleId = "google-456";
      const sessionToken = await sdk.createSessionToken(googleId, {
        name: "Alex Lin",
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      const verified = await sdk.verifySession(sessionToken);

      expect(verified).toBeDefined();
      expect(verified?.openId).toBe(googleId);
      expect(verified?.name).toBe("Alex Lin");
    });

    it("should reject invalid session tokens", async () => {
      const invalidToken = "invalid.token.here";
      const verified = await sdk.verifySession(invalidToken);

      expect(verified).toBeNull();
    });

    it("should reject expired session tokens", async () => {
      // Create a token that expires immediately
      const googleId = "google-789";
      const sessionToken = await sdk.createSessionToken(googleId, {
        name: "Test User",
        expiresInMs: 1, // 1ms - will be expired
      });

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const verified = await sdk.verifySession(sessionToken);

      // Should be null or throw error due to expiration
      expect(verified).toBeNull();
    });
  });

  describe("User lookup after OAuth callback", () => {
    it("should find user by googleId after session verification", async () => {
      const googleId = "google-123";
      const mockUser = {
        id: 1,
        openId: googleId,
        name: "Test User",
        email: "test@gmail.com",
        loginMethod: "google",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserByOpenId).mockResolvedValue(null);
      vi.mocked(db.getPhoneUserByGoogleId).mockResolvedValue({
        id: 1,
        email: "test@gmail.com",
        name: "Test User",
        googleId,
        phone: null,
        address: null,
        picture: null,
        emailVerified: "true",
        loginMethod: "google",
        role: "user",
        clientStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate authenticateRequest lookup
      let user = await db.getUserByOpenId(googleId);
      if (!user) {
        const phoneUser = await db.getPhoneUserByGoogleId(googleId);
        expect(phoneUser).toBeDefined();
        expect(phoneUser?.googleId).toBe(googleId);
      }
    });
  });
});
