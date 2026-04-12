/**
 * Phone 2FA enforcement for privileged roles (admin, manager, staff).
 *
 * Flow:
 *  1. User logs in via Google or Email.
 *  2. Server detects a privileged role → does NOT issue a full session.
 *     Instead it issues a short-lived `pendingToken` (JWT, 10 min).
 *  3. Frontend redirects to /2fa where the user enters their phone OTP.
 *  4. Server verifies the OTP, validates the pendingToken, then issues
 *     the real session cookie and completes the login.
 */

import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const PENDING_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/** Roles that must complete phone 2FA before receiving a full session */
export const ROLES_REQUIRING_2FA = new Set<string>(["admin", "manager", "staff"]);

export function roleRequires2FA(role: string): boolean {
  return ROLES_REQUIRING_2FA.has(role);
}

type PendingTokenPayload = {
  /** phoneUsers.id of the user who just passed the first factor */
  phoneUserId: number;
  /** The user's registered phone number (for SMS dispatch) */
  phone: string;
  /** Role of the user — used to re-validate on completion */
  role: string;
  /** Purpose discriminator */
  purpose: "phone_2fa";
};

function getSecret(): Uint8Array {
  return new TextEncoder().encode(ENV.cookieSecret || "fallback-dev-secret-32-chars-min!");
}

/**
 * Issue a short-lived pending-2FA JWT.
 * This is returned to the client instead of a full session when the user
 * has a privileged role and has not yet completed phone OTP.
 */
export async function createPending2FAToken(payload: Omit<PendingTokenPayload, "purpose">): Promise<string> {
  const secret = getSecret();
  const expiresAt = Math.floor((Date.now() + PENDING_TOKEN_EXPIRY_MS) / 1000);

  return new SignJWT({
    phoneUserId: payload.phoneUserId,
    phone: payload.phone,
    role: payload.role,
    purpose: "phone_2fa" as const,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret);
}

/**
 * Verify and decode a pending-2FA token.
 * Returns null if the token is invalid, expired, or has the wrong purpose.
 */
export async function verifyPending2FAToken(token: string): Promise<PendingTokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    if (
      payload.purpose !== "phone_2fa" ||
      typeof payload.phoneUserId !== "number" ||
      typeof payload.phone !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      phoneUserId: payload.phoneUserId as number,
      phone: payload.phone as string,
      role: payload.role as string,
      purpose: "phone_2fa",
    };
  } catch {
    return null;
  }
}
