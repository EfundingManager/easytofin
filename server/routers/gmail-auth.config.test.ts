import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTRPCMsw } from "msw-trpc";
import { appRouter } from "../routers";

describe("Gmail Auth Configuration", () => {
  it("should return correct Google OAuth config with proper redirect URI", async () => {
    // Set environment variables
    process.env.VITE_GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
    process.env.VITE_APP_URL = "https://easytofin.com";

    // Create a caller for the router
    const caller = appRouter.createCaller({
      user: null,
      db: {} as any,
      sdk: {} as any,
    });

    // Get the Google config
    const config = await caller.gmailAuth.getGoogleConfig();

    // Verify the config
    expect(config).toBeDefined();
    expect(config.clientId).toBe("test-client-id.apps.googleusercontent.com");
    expect(config.redirectUri).toBe("https://easytofin.com/auth/google/callback");
    expect(config.redirectUri).toMatch(/^https:\/\//);
    expect(config.redirectUri).toContain("/auth/google/callback");
  });

  it("should throw error if Google Client ID is not configured", async () => {
    // Clear the client ID
    delete process.env.VITE_GOOGLE_CLIENT_ID;

    const caller = appRouter.createCaller({
      user: null,
      db: {} as any,
      sdk: {} as any,
    });

    try {
      await caller.gmailAuth.getGoogleConfig();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.message).toContain("Google OAuth not configured");
    }
  });

  it("should use fallback URL if VITE_APP_URL is not set", async () => {
    process.env.VITE_GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
    delete process.env.VITE_APP_URL;

    const caller = appRouter.createCaller({
      user: null,
      db: {} as any,
      sdk: {} as any,
    });

    const config = await caller.gmailAuth.getGoogleConfig();

    // Should use localhost as fallback
    expect(config.redirectUri).toBe("http://localhost:3000/auth/google/callback");
  });

  it("should have HTTPS redirect URI for production", async () => {
    process.env.VITE_GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
    process.env.VITE_APP_URL = "https://easytofin.com";

    const caller = appRouter.createCaller({
      user: null,
      db: {} as any,
      sdk: {} as any,
    });

    const config = await caller.gmailAuth.getGoogleConfig();

    // Production redirect URI must be HTTPS
    expect(config.redirectUri).toMatch(/^https:\/\//);
    expect(config.redirectUri).not.toMatch(/^http:\/\/(?!localhost)/);
  });
});
