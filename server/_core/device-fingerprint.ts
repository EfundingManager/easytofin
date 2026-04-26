/**
 * Device Fingerprinting Service
 * Generates consistent device fingerprints for identifying trusted devices
 * Combines browser, OS, and hardware characteristics for reliable identification
 */

import * as crypto from 'crypto';

export interface DeviceFingerprintData {
  userAgent: string;
  acceptLanguage?: string;
  timezone?: string;
  screenResolution?: string;
  colorDepth?: number;
  platform?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

export interface DeviceInfo {
  fingerprint: string;
  hash: string;
  deviceName: string;
  browserInfo: string;
  osInfo: string;
}

/**
 * Extract device information from request headers and browser data
 */
export function extractDeviceInfo(
  userAgent: string,
  acceptLanguage?: string,
  additionalData?: Partial<DeviceFingerprintData>
): DeviceFingerprintData {
  return {
    userAgent,
    acceptLanguage: acceptLanguage || 'en-US',
    timezone: additionalData?.timezone || 'UTC',
    screenResolution: additionalData?.screenResolution || '1920x1080',
    colorDepth: additionalData?.colorDepth || 24,
    platform: additionalData?.platform || 'Unknown',
    hardwareConcurrency: additionalData?.hardwareConcurrency || 1,
    deviceMemory: additionalData?.deviceMemory || 4,
  };
}

/**
 * Parse user agent to extract browser and OS information
 */
export function parseUserAgent(userAgent: string): { browser: string; os: string } {
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  else if (userAgent.includes('Android')) os = 'Android';

  // Detect Browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

  return { browser, os };
}

/**
 * Generate a device name from user agent
 * Example: "Chrome on Windows", "Safari on iPhone"
 */
export function generateDeviceName(userAgent: string): string {
  const { browser, os } = parseUserAgent(userAgent);
  return `${browser} on ${os}`;
}

/**
 * Generate a consistent device fingerprint
 * Combines multiple device characteristics into a single fingerprint
 */
export function generateDeviceFingerprint(data: DeviceFingerprintData): string {
  // Create a string representation of device data
  const fingerprintData = [
    data.userAgent,
    data.platform,
    data.screenResolution,
    data.colorDepth,
    data.timezone,
    data.hardwareConcurrency,
    data.deviceMemory,
  ].join('|');

  // Generate a hash of the fingerprint data
  const hash = crypto.createHash('sha256').update(fingerprintData).digest('hex');

  return hash;
}

/**
 * Hash a device fingerprint for storage
 * Never store plain fingerprints; always hash them
 */
export function hashDeviceFingerprint(fingerprint: string): string {
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

/**
 * Verify a device fingerprint against its hash
 */
export function verifyDeviceFingerprint(fingerprint: string, hash: string): boolean {
  return hashDeviceFingerprint(fingerprint) === hash;
}

/**
 * Generate a secure device token for device verification
 * This token is used to identify the device in subsequent requests
 */
export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create complete device information
 */
export function createDeviceInfo(
  userAgent: string,
  additionalData?: Partial<DeviceFingerprintData>
): DeviceInfo {
  const deviceData = extractDeviceInfo(userAgent, additionalData?.acceptLanguage, additionalData);
  const fingerprint = generateDeviceFingerprint(deviceData);
  const { browser, os } = parseUserAgent(userAgent);
  const deviceName = generateDeviceName(userAgent);

  return {
    fingerprint,
    hash: hashDeviceFingerprint(fingerprint),
    deviceName,
    browserInfo: browser,
    osInfo: os,
  };
}

/**
 * Compare two device fingerprints with tolerance for minor variations
 * Allows for browser updates and minor OS changes
 */
export function compareDeviceFingerprints(
  fingerprint1: string,
  fingerprint2: string,
  tolerance: number = 0.85 // 85% similarity threshold
): boolean {
  if (fingerprint1 === fingerprint2) {
    return true;
  }

  // Calculate similarity score (simple Hamming distance)
  let matches = 0;
  const minLength = Math.min(fingerprint1.length, fingerprint2.length);

  for (let i = 0; i < minLength; i++) {
    if (fingerprint1[i] === fingerprint2[i]) {
      matches++;
    }
  }

  const similarity = matches / Math.max(fingerprint1.length, fingerprint2.length);
  return similarity >= tolerance;
}

/**
 * Validate device fingerprint format
 */
export function isValidDeviceFingerprint(fingerprint: string): boolean {
  // Device fingerprints should be 64 character hex strings (SHA256)
  return /^[a-f0-9]{64}$/.test(fingerprint);
}

/**
 * Extract browser fingerprint data from browser (client-side)
 * This should be called from the frontend and sent to the backend
 */
export function generateClientDeviceFingerprint(): DeviceFingerprintData {
  if (typeof window === 'undefined') {
    throw new Error('Client-side fingerprinting only available in browser');
  }

  return {
    userAgent: navigator.userAgent,
    acceptLanguage: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    deviceMemory: (navigator as any).deviceMemory || 4,
  };
}
