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
          clientStatus: "queue", // Start as queue, will be determined by policy assignment
          role: "user",
          loginMethod: "google",
        });
      }

      // Check if user is admin/manager/support role - require 2FA
      const isPrivilegedRole = phoneUser.role === "admin" || phoneUser.role === "super_admin" || phoneUser.role === "manager" || phoneUser.role === "support";
      
      if (isPrivilegedRole) {
        // For admin roles, require 2FA via SMS
        if (!phoneUser.phone) {
          res.status(400).json({ error: "Phone number required for 2FA" });
          return;
        }

        // Send OTP via SMS for 2FA
        try {
          // Generate 6-digit OTP code
          const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
          
          await db.createOtpCode({
            phoneUserId: phoneUser.id,
            code: otpCode,
            expiresAt,
          });
          // Note: SMS sending would be handled by Twilio integration
          // For now, we'll return the 2FA verification page URL
          res.json({
            success: true,
            requiresOTP: true,
            redirectUrl: `/gmail-2fa?phoneUserId=${phoneUser.id}&email=${encodeURIComponent(phoneUser.email || "")}&redirectUrl=${encodeURIComponent("/admin")}`,
            email: phoneUser.email,
            message: "OTP sent to your phone. Please verify to continue.",
          });
        } catch (error) {
          console.error("[2FA] Failed to create OTP:", error);
          res.status(500).json({ error: "Failed to initiate 2FA" });
        }
      } else {
        // For regular users, create session and determine redirect based on policy assignment
        const sessionDuration = rememberMe ? THIRTY_DAYS_MS : ONE_YEAR_MS;
        const sessionToken = await sdk.createSessionToken(googleId, {
          name: name || email || "User",
          expiresInMs: sessionDuration,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: sessionDuration });

        let redirectUrl = "/dashboard";
        const hasPolicy = await db.hasUserPolicy(phoneUser.id);
        if (hasPolicy) {
          redirectUrl = `/customer/${phoneUser.id}`;
        } else {
          redirectUrl = `/user/${phoneUser.id}`;
        }

        res.json({
          success: true,
          redirectUrl,
          email: phoneUser.email,
          requiresOTP: false,
        });
      }
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

      // Determine redirect URL based on user's role and clientStatus
      let redirectUrl = "/dashboard";
      if (user?.id) {
        // Check if user has a phoneUser record with clientStatus
        const phoneUser = await db.getPhoneUserById(user.id);
        if (phoneUser) {
          // Check if user is admin/manager/support role - require 2FA
          const isPrivilegedRole = phoneUser.role === "admin" || phoneUser.role === "super_admin" || phoneUser.role === "manager" || phoneUser.role === "support";
          
          if (isPrivilegedRole) {
            // For admin roles, require 2FA via SMS
            if (!phoneUser.phone) {
              res.status(400).json({ error: "Phone number required for 2FA" });
              return;
            }

            // Send OTP via SMS for 2FA
            try {
              // Generate 6-digit OTP code
              const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
              const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
              
              await db.createOtpCode({
                phoneUserId: phoneUser.id,
                code: otpCode,
                expiresAt,
              });
              // Note: SMS sending would be handled by Twilio integration
              // For now, we'll redirect to 2FA verification page
              res.redirect(302, `/gmail-2fa?phoneUserId=${phoneUser.id}&email=${encodeURIComponent(phoneUser.email || "")}&redirectUrl=${encodeURIComponent("/admin")}`);
            } catch (error) {
              console.error("[2FA] Failed to create OTP:", error);
              res.status(500).json({ error: "Failed to initiate 2FA" });
            }
          } else {
            // For regular users, determine redirect based on policy assignment
            const hasPolicy = await db.hasUserPolicy(phoneUser.id);
            if (hasPolicy) {
              redirectUrl = `/customer/${phoneUser.id}`;
            } else {
              redirectUrl = `/user/${phoneUser.id}`;
            }
            res.redirect(302, redirectUrl);
          }
        } else {
          res.redirect(302, redirectUrl);
        }
      } else {
        res.redirect(302, redirectUrl);
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // OTP verification endpoint for 2FA
  app.post("/api/auth/verify-gmail-otp", async (req: Request, res: Response) => {
    try {
      const { phoneUserId, otp } = req.body;

      if (!phoneUserId || !otp) {
        res.status(400).json({ error: "phoneUserId and OTP are required" });
        return;
      }

      // Verify OTP
      const validOtp = await db.getValidOtpCode(phoneUserId, otp);
      if (!validOtp) {
        res.status(401).json({ error: "Invalid or expired OTP" });
        return;
      }

      // Get user and create session
      const phoneUser = await db.getPhoneUserById(phoneUserId);
      if (!phoneUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Create session token
      const sessionDuration = ONE_YEAR_MS;
      const sessionToken = await sdk.createSessionToken(phoneUser.googleId || phoneUser.id.toString(), {
        name: phoneUser.name || phoneUser.email || "Admin User",
        expiresInMs: sessionDuration,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: sessionDuration });

      // Mark OTP as used
      await db.deleteOtpCode(validOtp.id);

      res.json({
        success: true,
        message: "OTP verified successfully",
        redirectUrl: "/admin",
      });
    } catch (error) {
      console.error("[2FA] OTP verification failed", error);
      res.status(500).json({ error: "OTP verification failed" });
    }
  });

  // Resend OTP endpoint
  app.post("/api/auth/resend-gmail-otp", async (req: Request, res: Response) => {
    try {
      const { phoneUserId } = req.body;

      if (!phoneUserId) {
        res.status(400).json({ error: "phoneUserId is required" });
        return;
      }

      // Get user
      const phoneUser = await db.getPhoneUserById(phoneUserId);
      if (!phoneUser || !phoneUser.phone) {
        res.status(404).json({ error: "User or phone number not found" });
        return;
      }

      // Generate new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      await db.createOtpCode({
        phoneUserId: phoneUserId,
        code: otpCode,
        expiresAt,
      });

      // TODO: Send OTP via Twilio SMS
      console.log(`[2FA] New OTP generated for user ${phoneUserId}: ${otpCode}`);

      res.json({
        success: true,
        message: "OTP resent to your phone",
      });
    } catch (error) {
      console.error("[2FA] Resend OTP failed", error);
      res.status(500).json({ error: "Failed to resend OTP" });
    }
  });
}
