/**
 * TOTP (Time-based One-Time Password) Service
 * Implements RFC 6238 for TOTP-based multi-factor authentication
 * Supports Google Authenticator, Microsoft Authenticator, Authy, etc.
 */

import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

export interface TotpSetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TotpVerificationResult {
  isValid: boolean;
  remainingAttempts?: number;
}

/**
 * Generate a random TOTP secret
 * Returns base32-encoded secret suitable for authenticator apps
 */
export function generateTotpSecret(userEmail: string, appName: string = 'EasyToFin'): speakeasy.GeneratedSecret {
  return speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    issuer: appName,
    length: 32,
  });
}

/**
 * Generate backup codes for account recovery
 * Returns 10 codes that can each be used once
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Generate QR code for TOTP setup
 * Returns data URL for displaying in UI
 */
export async function generateQrCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('[TOTP] Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify TOTP code
 * Accounts for time drift (±30 seconds by default)
 */
export function verifyTotpCode(secret: string, code: string, window: number = 2): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window,
    });
    return verified;
  } catch (error) {
    console.error('[TOTP] Verification failed:', error);
    return false;
  }
}

/**
 * Create TOTP setup for a user
 * Returns all necessary information for user to set up authenticator
 */
export async function createTotpSetup(
  userEmail: string,
  appName: string = 'EasyToFin'
): Promise<TotpSetupResult> {
  const secret = generateTotpSecret(userEmail, appName);
  const backupCodes = generateBackupCodes(10);
  const qrCode = await generateQrCode(secret.otpauth_url!);
  
  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
    manualEntryKey: secret.base32, // For manual entry if QR scan fails
  };
}

/**
 * Validate TOTP code and backup code
 */
export function validateAuthCode(
  secret: string,
  code: string,
  backupCodes: string[] = []
): { isValid: boolean; isBackupCode: boolean } {
  // Check if it's a TOTP code (6 digits)
  if (/^\d{6}$/.test(code)) {
    const isValid = verifyTotpCode(secret, code);
    return { isValid, isBackupCode: false };
  }

  // Check if it's a backup code (format: XXXX-XXXX)
  if (/^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code)) {
    const isValid = backupCodes.includes(code.toUpperCase());
    return { isValid, isBackupCode: true };
  }

  return { isValid: false, isBackupCode: false };
}

/**
 * Remove used backup code from list
 */
export function removeBackupCode(backupCodes: string[], usedCode: string): string[] {
  return backupCodes.filter(code => code !== usedCode.toUpperCase());
}

/**
 * Hash a TOTP secret for storage
 * Never store plain secrets; always hash them
 */
export function hashTotpSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Verify a TOTP secret against its hash
 */
export function verifyTotpSecretHash(secret: string, hash: string): boolean {
  return hashTotpSecret(secret) === hash;
}
