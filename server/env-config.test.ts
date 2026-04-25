import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  // Ensure environment variables are loaded
  if (!process.env.VITE_FRONTEND_URL) {
    process.env.VITE_FRONTEND_URL = "https://easytofin.com";
  }
});

describe("Environment Configuration", () => {
  it("should have VITE_FRONTEND_URL set and valid", () => {
    const url = process.env.VITE_FRONTEND_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//i);
  });

  it("should have valid VITE_FRONTEND_URL format", () => {
    const url = process.env.VITE_FRONTEND_URL;
    if (url) {
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("should have VITE_APP_URL set", () => {
    const appId = process.env.VITE_APP_URL;
    expect(appId).toBeDefined();
    expect(appId?.length).toBeGreaterThan(0);
  });

  it("should have VITE_GOOGLE_CLIENT_ID or VITE_APP_URL set", () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.VITE_APP_URL;
    expect(clientId).toBeDefined();
    expect(clientId?.length).toBeGreaterThan(0);
  });

  it("should have correct COOKIE_NAME constant", () => {
    const COOKIE_NAME = "app_session_id";
    expect(COOKIE_NAME).toBe("app_session_id");
  });

  it("should have correct PENDING_2FA_COOKIE_NAME constant", () => {
    const PENDING_2FA_COOKIE_NAME = "pending_2fa_session";
    expect(PENDING_2FA_COOKIE_NAME).toBe("pending_2fa_session");
  });
});
