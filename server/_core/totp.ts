import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * TOTP (Time-based One-Time Password) service for authenticator app support
 * Used for 2FA on admin/manager/staff/support roles
 */

export interface TOTPSetupResult {
  secret: string;
  qrCode: string; // Data URL for QR code image
  backupCodes: string[];
}

export interface TOTPVerifyResult {
  valid: boolean;
  message: string;
}

/**
 * Generate a new TOTP secret and QR code for setup
 */
export async function generateTOTPSecret(
  userEmail: string,
  appName: string = "EasyToFin"
): Promise<TOTPSetupResult> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    issuer: appName,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate TOTP secret");
  }

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes (10 codes)
  const backupCodes = generateBackupCodes(10);

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(
  secret: string,
  token: string,
  window: number = 2
): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window,
    });
    return verified;
  } catch (error) {
    console.error("[TOTP] Verification error:", error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Verify a backup code and remove it from the list
 */
export function verifyAndRemoveBackupCode(
  backupCodes: string[],
  code: string
): { valid: boolean; remainingCodes: string[] } {
  const index = backupCodes.indexOf(code.toUpperCase());
  if (index === -1) {
    return { valid: false, remainingCodes: backupCodes };
  }

  const remainingCodes = backupCodes.filter((_, i) => i !== index);
  return { valid: true, remainingCodes };
}

/**
 * Check if TOTP is required for a user role
 */
export function isTOTPRequired(role: string): boolean {
  return ["admin", "manager", "staff", "support", "super_admin"].includes(role);
}
