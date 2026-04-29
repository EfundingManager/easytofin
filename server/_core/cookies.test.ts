import { describe, it, expect, beforeEach } from "vitest";
import { getSessionCookieOptions } from "./cookies";
import type { Request } from "express";

describe("getSessionCookieOptions", () => {
  let mockReq: Partial<Request>;

  beforeEach(() => {
    mockReq = {
      protocol: "https",
      hostname: "www.easytofin.com",
      headers: {},
      secure: true,
    };
  });

  it("should set domain for custom domain www.easytofin.com", () => {
    mockReq.headers = {
      host: "www.easytofin.com",
    };
    mockReq.hostname = "www.easytofin.com";

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBe(".easytofin.com");
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.httpOnly).toBe(true);
  });

  it("should set domain for custom domain easytofin.com (without www)", () => {
    mockReq.headers = {
      host: "easytofin.com",
    };
    mockReq.hostname = "easytofin.com";

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBe(".easytofin.com");
    expect(options.secure).toBe(true);
  });

  it("should use host-only cookie for preview domain", () => {
    mockReq.headers = {
      host: "3000-i0lopgnvobsb4ea8ftqcf-be96320f.us2.manus.computer",
    };
    mockReq.hostname = "3000-i0lopgnvobsb4ea8ftqcf-be96320f.us2.manus.computer";

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBeUndefined();
    expect(options.secure).toBe(true);
  });

  it("should use host-only cookie for localhost", () => {
    mockReq.headers = {
      host: "localhost:3000",
    };
    mockReq.hostname = "localhost";
    mockReq.protocol = "http";
    mockReq.secure = false;

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBeUndefined();
    expect(options.secure).toBe(false);
  });

  it("should respect x-forwarded-host header for custom domain", () => {
    mockReq.headers = {
      "x-forwarded-host": "www.easytofin.com",
      host: "localhost:3000",
    };
    mockReq.hostname = "localhost";

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBe(".easytofin.com");
    expect(options.secure).toBe(true);
  });

  it("should handle array headers correctly", () => {
    mockReq.headers = {
      "x-forwarded-host": ["www.easytofin.com"],
      host: ["localhost:3000"],
    };
    mockReq.hostname = "localhost";

    const options = getSessionCookieOptions(mockReq as Request);

    expect(options.domain).toBe(".easytofin.com");
  });
});
