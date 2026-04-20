import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS, THIRTY_DAYS_MS } from "@shared/const";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Gmail authentication callback endpoint
  app.post("/api/gmail/callback", async (req: Request, res: Response) => {
    try {
      const { googleId, email, name, rememberMe } = req.body;

      if (!googleId || !email) {
        res.status(400).json({ error: "googleId and email are required" });
        return;
      }

      // Get or create phone user
      let phoneUser = await db.getPhoneUserByGoogleId(googleId);
      if (!phoneUser) {
        phoneUser = await db.createPhoneUser({
          googleId,
          email,
          name: name || email,
          phone: null,
          emailVerified: "true",
          clientStatus: "customer", // Gmail users are automatically created as clients
          role: "user",
          loginMethod: "google",
        });
      }

      // Create session token with non-empty name
      const sessionDuration = rememberMe ? THIRTY_DAYS_MS : ONE_YEAR_MS;
      const sessionToken = await sdk.createSessionToken(googleId, {
        name: name || email || "User",
        expiresInMs: sessionDuration,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: sessionDuration });

      // Determine redirect URL based on role and clientStatus
      let redirectUrl = "/dashboard";
      if (phoneUser.role === "admin" || phoneUser.role === "super_admin" || phoneUser.role === "manager" || phoneUser.role === "support") {
        redirectUrl = "/admin";
      } else if (phoneUser.clientStatus === "customer") {
        redirectUrl = `/customer/${phoneUser.id}`;
      } else {
        redirectUrl = `/user/${phoneUser.id}`;
      }

      // Check if Gmail account needs confirmation (new users)
      const requiresConfirmation = !phoneUser.emailVerified || phoneUser.emailVerified !== "true";
      
      res.json({ 
        success: true, 
        redirectUrl,
        email: phoneUser.email,
        requiresConfirmation: false // Gmail is already verified by Google, so no confirmation needed
      });
    } catch (error) {
      console.error("[Gmail] Callback failed", error);
      res.status(500).json({ error: "Gmail callback failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Get the user to check their clientStatus
      const user = await db.getUserByOpenId(userInfo.openId);

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || userInfo.email || "User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Determine redirect URL based on user's clientStatus
      let redirectUrl = "/dashboard";
      if (user?.id) {
        // Check if user has a phoneUser record with clientStatus
        const phoneUser = await db.getPhoneUserById(user.id);
        if (phoneUser) {
          if (phoneUser.clientStatus === "customer") {
            redirectUrl = `/customer/${user.id}`;
          } else {
            redirectUrl = `/user/${user.id}`;
          }
        }
      }

      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
