import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import * as db from "../db";

// Mock the database functions
vi.mock("../db", async () => {
  const actual = await vi.importActual("../db");
  return {
    ...actual,
    getPhoneUserByEmail: vi.fn(),
    createPhoneUser: vi.fn(),
  };
});

// Mock the SDK
vi.mock("../_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
  },
}));

function createTestContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Gmail Auth Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle new Gmail user registration", async () => {
    // Mock: no existing user
    vi.mocked(db.getPhoneUserByEmail).mockResolvedValueOnce(null);

    // Mock: create new user
    const mockNewUser = {
      id: "user-123",
      email: "newuser@gmail.com",
      name: "New User",
      googleId: "google-123",
      phone: null,
      role: "user",
      clientStatus: "new",
      emailVerified: "true",
      loginMethod: "google",
      picture: "https://example.com/photo.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(db.createPhoneUser).mockResolvedValueOnce(mockNewUser as any);

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gmailAuth.handleGoogleCallback({
      googleId: "google-123",
      email: "newuser@gmail.com",
      name: "New User",
      picture: "https://example.com/photo.jpg",
    });

    expect(result.success).toBe(true);
    expect(result.isNewRegistration).toBe(true);
    expect(result.message).toContain("Registration successful");
    expect(result.userId).toBe("user-123");
  });

  it("should handle existing Gmail user login", async () => {
    // Mock: existing user found
    const mockExistingUser = {
      id: "user-456",
      email: "existing@gmail.com",
      name: "Existing User",
      googleId: "google-456",
      phone: "+353 87 123 4567",
      role: "user",
      clientStatus: "customer",
      emailVerified: "true",
      loginMethod: "google",
      picture: "https://example.com/photo2.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(db.getPhoneUserByEmail).mockResolvedValueOnce(mockExistingUser as any);

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gmailAuth.handleGoogleCallback({
      googleId: "google-456",
      email: "existing@gmail.com",
      name: "Existing User",
      picture: "https://example.com/photo2.jpg",
    });

    expect(result.success).toBe(true);
    expect(result.isNewRegistration).toBe(false);
    expect(result.message).toContain("Login successful");
    expect(result.userId).toBe("user-456");
    expect(result.redirectUrl).toContain("/customer/");
  });

  it("should redirect to /user/:id for non-customer users", async () => {
    // Mock: user with queue status
    const mockQueueUser = {
      id: "user-789",
      email: "queue@gmail.com",
      name: "Queue User",
      googleId: "google-789",
      phone: "+353 87 111 1111",
      role: "user",
      clientStatus: "queue",
      emailVerified: "true",
      loginMethod: "google",
      picture: "https://example.com/photo3.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(db.getPhoneUserByEmail).mockResolvedValueOnce(mockQueueUser as any);

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gmailAuth.handleGoogleCallback({
      googleId: "google-789",
      email: "queue@gmail.com",
      name: "Queue User",
      picture: "https://example.com/photo3.jpg",
    });

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toContain("/user/user-789");
  });

  it("should reject invalid email format", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = caller.gmailAuth.handleGoogleCallback({
      googleId: "google-invalid",
      email: "invalid-email",
      name: "Invalid User",
    });

    await expect(result).rejects.toThrow();
  });

  it("should reject missing Google ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = caller.gmailAuth.handleGoogleCallback({
      googleId: "",
      email: "test@gmail.com",
      name: "Test User",
    });

    await expect(result).rejects.toThrow();
  });

  it("should reject missing name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = caller.gmailAuth.handleGoogleCallback({
      googleId: "google-123",
      email: "test@gmail.com",
      name: "",
    });

    await expect(result).rejects.toThrow();
  });
});
