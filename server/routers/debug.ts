import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * Debug router for troubleshooting authentication and session issues
 * These endpoints are public to allow debugging without authentication
 */
export const debugRouter = router({
  /**
   * Check current session and cookie status
   * Returns information about:
   * - Whether user is authenticated
   * - Cookie headers received
   * - Session validation status
   * - Hostname and domain information
   */
  sessionStatus: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie || "no cookies";
    const hostname = ctx.req.hostname;
    const origin = ctx.req.get("origin");
    const referer = ctx.req.get("referer");
    const xForwardedHost = ctx.req.get("x-forwarded-host");
    const xForwardedProto = ctx.req.get("x-forwarded-proto");
    const userAgent = ctx.req.get("user-agent");

    return {
      timestamp: new Date().toISOString(),
      authenticated: !!ctx.user,
      user: ctx.user ? {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
      } : null,
      headers: {
        cookie: cookieHeader,
        origin,
        referer,
        userAgent: userAgent?.substring(0, 100),
      },
      server: {
        hostname,
        xForwardedHost,
        xForwardedProto,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        appUrl: process.env.VITE_APP_URL,
        frontendUrl: process.env.VITE_FRONTEND_URL,
      },
    };
  }),

  /**
   * Test cookie setting and retrieval
   * This endpoint sets a test cookie and returns information about it
   */
  testCookie: publicProcedure.query(async ({ ctx }) => {
    const testValue = `test-${Date.now()}`;
    
    // Set a test cookie
    ctx.res.cookie("test-cookie", testValue, {
      httpOnly: false, // Allow JavaScript to read for testing
      secure: ctx.req.protocol === "https",
      sameSite: "lax",
      maxAge: 60000, // 1 minute
    });

    return {
      message: "Test cookie set",
      testValue,
      cookieSet: true,
      secure: ctx.req.protocol === "https",
      hostname: ctx.req.hostname,
      domain: ctx.req.hostname.startsWith("www.") 
        ? `.${ctx.req.hostname.substring(4)}`
        : `.${ctx.req.hostname}`,
    };
  }),

  /**
   * Check if session cookie is being sent
   * Returns the app_session_id cookie value (if present)
   */
  checkSessionCookie: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie || "";
    
    // Parse cookies from header manually
    const cookies: Record<string, string> = {};
    if (cookieHeader) {
      cookieHeader.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          cookies[name] = value;
        }
      });
    }
    
    const sessionCookie = cookies["app_session_id"];

    return {
      timestamp: new Date().toISOString(),
      sessionCookiePresent: !!sessionCookie,
      sessionCookieValue: sessionCookie ? `${sessionCookie.substring(0, 20)}...` : null,
      allCookies: Object.keys(cookies),
      rawCookieHeader: cookieHeader.substring(0, 200),
      hostname: ctx.req.hostname,
      protocol: ctx.req.protocol,
      isSecure: ctx.req.protocol === "https",
    };
  }),

  /**
   * Verify session token validity
   * Attempts to validate the current session token
   */
  verifySession: publicProcedure.query(async ({ ctx }) => {
    try {
      const cookieHeader = ctx.req.headers.cookie || "";
      
      // Parse cookies from header manually
      const cookies: Record<string, string> = {};
      if (cookieHeader) {
        cookieHeader.split(";").forEach((cookie) => {
          const [name, value] = cookie.trim().split("=");
          if (name && value) {
            cookies[name] = value;
          }
        });
      }
      
      const sessionCookie = cookies["app_session_id"];
      
      if (!sessionCookie) {
        return {
          valid: false,
          reason: "No session cookie found",
          authenticated: false,
        };
      }

      return {
        valid: !!ctx.user,
        reason: ctx.user ? "Session is valid" : "Session cookie present but user not authenticated",
        authenticated: !!ctx.user,
        user: ctx.user ? {
          id: ctx.user.id,
          email: ctx.user.email,
        } : null,
      };
    } catch (error) {
      return {
        valid: false,
        reason: `Error verifying session: ${error instanceof Error ? error.message : "Unknown error"}`,
        authenticated: false,
      };
    }
  }),
});
