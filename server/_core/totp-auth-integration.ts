/**
 * TOTP 2FA Integration for Authentication Flow
 * This module handles TOTP verification requirements for privileged roles
 */

import { getDb } from "../db";
import { totpSecrets, firstLoginTracking, totp2faAuditLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export type TOTPAuthStatus = {
  requiresTOTP: boolean;
  totpEnabled: boolean;
  isFirstLogin: boolean;
  totpSetupCompleted: boolean;
};

/**
 * Check if a user has a privileged role that requires TOTP 2FA
 */
export function hasPrivilegedRole(role: string | undefined): boolean {
  return ["super_admin", "admin", "manager", "staff", "support"].includes(
    role || ""
  );
}

/**
 * Get TOTP authentication status for a user
 */
export async function getTOTPAuthStatus(
  phoneUserId: number
): Promise<TOTPAuthStatus> {
  const db = await getDb();
  if (!db) {
    return {
      requiresTOTP: false,
      totpEnabled: false,
      isFirstLogin: false,
      totpSetupCompleted: false,
    };
  }

  try {
    // Check TOTP secret
    const totpRecord = await db
      .select()
      .from(totpSecrets)
      .where(eq(totpSecrets.phoneUserId, phoneUserId))
      .limit(1);

    // TOTP is enabled if a secret exists and is verified
    const totpEnabled = totpRecord.length > 0 && totpRecord[0]?.verified === "true";

    // Check first login tracking - create if doesn't exist
    let trackingRecord = await db
      .select()
      .from(firstLoginTracking)
      .where(eq(firstLoginTracking.phoneUserId, phoneUserId))
      .limit(1);
    
    // If no tracking record exists, create one
    if (trackingRecord.length === 0) {
      try {
        await db.insert(firstLoginTracking).values({
          phoneUserId,
          hasCompletedFirstLogin: "false",
          requiresTOTP2FA: "false",
        });
        trackingRecord = await db
          .select()
          .from(firstLoginTracking)
          .where(eq(firstLoginTracking.phoneUserId, phoneUserId))
          .limit(1);
      } catch (insertError) {
        console.warn("[TOTP] Could not create first login tracking record:", insertError);
      }
    }

    const isFirstLogin =
      trackingRecord.length === 0 ||
      (trackingRecord[0] && trackingRecord[0].hasCompletedFirstLogin === "false");
    const requiresTOTP =
      trackingRecord.length > 0 &&
      (trackingRecord[0] && trackingRecord[0].requiresTOTP2FA === "true");
    const totpSetupCompleted =
      trackingRecord.length > 0 &&
      (trackingRecord[0] && totpRecord.length > 0);

    return {
      requiresTOTP,
      totpEnabled,
      isFirstLogin,
      totpSetupCompleted,
    };
  } catch (error) {
    console.error("[TOTP] Error getting auth status:", error);
    await logger.error("[TOTP] Error getting auth status", {
      req: undefined,
      metadata: { phoneUserId, error: String(error) },
    });

    return {
      requiresTOTP: false,
      totpEnabled: false,
      isFirstLogin: false,
      totpSetupCompleted: false,
    };
  }
}

/**
 * Log a TOTP verification attempt
 */
export async function logTOTPAttempt(
  phoneUserId: number,
  eventType: string,
  success: boolean,
  code?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Validate eventType is one of the allowed enum values
    const validEventTypes = [
      "disabled",
      "setup_initiated",
      "setup_completed",
      "verification_success",
      "verification_failed",
      "backup_code_used",
      "backup_code_failed",
      "reset_initiated",
      "reset_completed",
    ];

    if (!validEventTypes.includes(eventType)) {
      console.warn(`[TOTP] Invalid event type: ${eventType}`);
      return;
    }

    await db.insert(totp2faAuditLog).values({
      phoneUserId,
      eventType: eventType as any,
      code: code || null,
      isValid: success ? "true" : "false",
    });
  } catch (error) {
    console.error("[TOTP] Error logging attempt:", error);
  }
}
