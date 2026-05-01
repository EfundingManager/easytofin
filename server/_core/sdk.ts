import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { phoneUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as db from "../db";
import { ENV } from "./env";
import { logger } from "./logger";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }

  private decodeState(state: string): string {
    const redirectUri = atob(state);
    return redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    )
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }

  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    } as ExchangeTokenResponse);
    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoResponse;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      console.log("[Auth] Verifying session cookie", {
        cookieLength: cookieValue.length,
        cookiePrefix: cookieValue.substring(0, 50),
        cookieSuffix: cookieValue.substring(cookieValue.length - 20),
      });

      const secretKey = this.getSessionSecret();
      console.log("[Auth] Secret key info", {
        secretLength: secretKey.byteLength,
      });

      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      console.log("[Auth] JWT verification successful", {
        openId,
        appId,
        name,
        payloadKeys: Object.keys(payload),
      });

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields", {
          openIdType: typeof openId,
          appIdType: typeof appId,
          nameType: typeof name,
        });
        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorDetails = {
        errorName: errorObj.name,
        errorMessage: errorObj.message,
        errorStack: errorObj.stack,
        cookieLength: cookieValue?.length,
      };
      console.warn("[Auth] Session verification failed", errorDetails);
      
      const detailedMessage = `[Auth] Session verification failed - ${errorObj.name}: ${errorObj.message}`;
      await logger.error(detailedMessage, {
        req: undefined,
        metadata: errorDetails,
      });
      return null;
    }
  }

  async getUserInfoWithJwt(
    jwtToken: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const payload: GetUserInfoWithJwtRequest = {
      jwtToken,
      projectId: ENV.appId,
    };

    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoWithJwtResponse;
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Regular authentication flow
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    
    const authContext = {
      hostname: req.hostname,
      protocol: req.protocol,
      secure: req.secure,
      xForwardedProto: req.headers['x-forwarded-proto'],
      xForwardedHost: req.headers['x-forwarded-host'],
      cookieHeader: req.headers.cookie ? "present" : "missing",
      sessionCookie: sessionCookie ? "present" : "missing",
      allCookies: Array.from(cookies.keys()).join(','),
    };
    
    console.log("[Auth] Authenticating request", authContext);
    await logger.info('[Auth] Authenticating request', { req, metadata: authContext });
    
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      const errorMsg = "Session verification failed for cookie";
      console.log("[Auth]", errorMsg, { sessionCookie: sessionCookie ? "present" : "missing" });
      await logger.error('[Auth] ' + errorMsg, { req, metadata: { ...authContext } });
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in regular users table, check phoneUsers table (for Gmail/Email/Phone auth)
    if (!user) {
      let phoneUser: any = null;

      console.log("[Auth] User not found in users table, checking phoneUsers with sessionUserId:", sessionUserId);
      await logger.info('[Auth] User not found in users table, checking phoneUsers', { req, metadata: { sessionUserId } });

      // Try multiple lookup strategies for phoneUsers
      // 1. Try by googleId
      phoneUser = await db.getPhoneUserByGoogleId(sessionUserId);
      if (phoneUser) {
        console.log("[Auth] Found user by googleId");
        await logger.info('[Auth] Found user by googleId', { req, metadata: { id: phoneUser.id, email: phoneUser.email } });
      }

      // 2. Try by email if sessionUserId looks like an email
      if (!phoneUser && sessionUserId.includes('@')) {
        phoneUser = await db.getPhoneUserByEmail(sessionUserId);
        if (phoneUser) {
          console.log("[Auth] Found user by email");
          await logger.info('[Auth] Found user by email', { req, metadata: { id: phoneUser.id, email: phoneUser.email } });
        }
      }

      // 3. Try by phone if sessionUserId looks like a phone number
      if (!phoneUser && /^[+\d\s\-()]+$/.test(sessionUserId)) {
        phoneUser = await db.getPhoneUserByPhone(sessionUserId);
        if (phoneUser) {
          console.log("[Auth] Found user by phone");
          await logger.info('[Auth] Found user by phone', { req, metadata: { id: phoneUser.id, phone: phoneUser.phone } });
        }
      }

      // 4. Try by ID if sessionUserId starts with 'phone-' or 'email-'
      if (!phoneUser && (sessionUserId.startsWith('phone-') || sessionUserId.startsWith('email-'))) {
        const userId = parseInt(sessionUserId.replace(/^(phone-|email-)/, ''), 10);
        if (!isNaN(userId)) {
          phoneUser = await db.getPhoneUserById(userId);
          if (phoneUser) {
            console.log("[Auth] Found user by ID extraction:", userId);
            await logger.info('[Auth] Found user by ID extraction', { req, metadata: { id: phoneUser.id, userId } });
          }
        }
      }

      if (phoneUser) {
        console.log("[Auth] Successfully found phoneUser:", { id: phoneUser.id, email: phoneUser.email, phone: phoneUser.phone });
        await logger.info('[Auth] Successfully found phoneUser', { req, metadata: { id: phoneUser.id, email: phoneUser.email, phone: phoneUser.phone } });
        // Convert phoneUser to User type for consistency
        return {
          id: phoneUser.id,
          openId: phoneUser.googleId || phoneUser.email || phoneUser.phone || sessionUserId,
          name: phoneUser.name,
          email: phoneUser.email,
          loginMethod: phoneUser.loginMethod,
          role: phoneUser.role as 'user' | 'admin' | 'manager' | 'staff' | 'super_admin',
          createdAt: phoneUser.createdAt,
          updatedAt: phoneUser.updatedAt,
          lastSignedIn: signedInAt,
        } as any;
      }

      const notFoundMsg = "PhoneUser not found after all lookup strategies";
      console.log("[Auth]", notFoundMsg);
      await logger.warn('[Auth] ' + notFoundMsg, { req, metadata: { sessionUserId } });
    }

    // If still not found, try to sync from OAuth server
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(userInfo.openId);
        await logger.info('[Auth] Synced user from OAuth', { req, metadata: { openId: userInfo.openId, email: userInfo.email } });
      } catch (error) {
        const errorMsg = String(error);
        console.error("[Auth] Failed to sync user from OAuth:", error);
        await logger.error('[Auth] Failed to sync user from OAuth', { req, metadata: { error: errorMsg } });
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      const errorMsg = "User not found after all lookup strategies";
      console.error("[Auth]", errorMsg);
      await logger.error('[Auth] ' + errorMsg, { req, metadata: { sessionUserId } });
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
