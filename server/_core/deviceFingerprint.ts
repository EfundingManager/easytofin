import crypto from "crypto";

/**
 * Device fingerprinting utility for identifying and tracking trusted devices
 * Combines multiple signals to create a unique device identifier
 */

export interface DeviceFingerprintInput {
  userAgent: string;
  acceptLanguage?: string;
  timezone?: string;
  screenResolution?: string;
  platform?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

export interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: "mobile" | "tablet" | "desktop";
}

/**
 * Generate a unique device fingerprint from browser/device characteristics
 * Uses SHA-256 hash of multiple device signals for uniqueness
 */
export function generateDeviceFingerprint(input: DeviceFingerprintInput): string {
  const fingerprintData = [
    input.userAgent || "",
    input.acceptLanguage || "",
    input.timezone || "",
    input.screenResolution || "",
    input.platform || "",
    input.hardwareConcurrency || "",
    input.deviceMemory || "",
  ].join("|");

  return crypto.createHash("sha256").update(fingerprintData).digest("hex");
}

/**
 * Parse user agent to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  }

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("android")) {
    os = "Android";
  }

  // Detect device type
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    deviceType = "mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    deviceType = "tablet";
  }

  const fingerprint = generateDeviceFingerprint({
    userAgent,
  });

  const deviceName = `${browser} on ${os}`;

  return {
    fingerprint,
    deviceName,
    browser,
    os,
    deviceType,
  };
}

/**
 * Generate a secure device token for device verification
 * Used to verify and authenticate trusted devices
 */
export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify device token matches expected format
 */
export function isValidDeviceToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Create a human-readable device identifier for UI display
 */
export function createDeviceDisplayName(browser: string, os: string, deviceType: string): string {
  const typeLabel = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  return `${browser} on ${os} (${typeLabel})`;
}

/**
 * Check if device fingerprint matches (with some tolerance for minor variations)
 * Exact match is required for security
 */
export function isFingerprintMatch(fingerprint1: string, fingerprint2: string): boolean {
  return fingerprint1 === fingerprint2;
}

/**
 * Generate a device verification code for OTP-based device verification
 */
export function generateDeviceVerificationCode(): string {
  return Math.random().toString().slice(2, 8).padStart(6, "0");
}

/**
 * Extract device info from request headers
 */
export function extractDeviceInfoFromRequest(
  userAgent: string,
  acceptLanguage?: string,
  ipAddress?: string
): {
  userAgent: string;
  acceptLanguage?: string;
  ipAddress?: string;
  deviceInfo: DeviceInfo;
} {
  const deviceInfo = parseUserAgent(userAgent);

  return {
    userAgent,
    acceptLanguage,
    ipAddress,
    deviceInfo,
  };
}
