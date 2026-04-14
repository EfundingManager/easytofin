import { Page, expect } from '@playwright/test';

/**
 * Helper to decode JWT token and extract claims
 */
export function decodeJWT(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}

/**
 * Helper to simulate Google Sign-In callback
 * This bypasses the actual Google OAuth flow for testing
 */
export async function simulateGoogleSignIn(
  page: Page,
  googleId: string,
  email: string,
  name: string,
  picture?: string
) {
  // Create a mock JWT token with Google user info
  const mockToken = createMockGoogleToken({
    sub: googleId,
    email,
    name,
    picture: picture || 'https://example.com/photo.jpg',
  });

  // Inject the mock token into the page context
  await page.evaluate((token) => {
    // Store the mock token in window for the callback handler
    (window as any).__mockGoogleToken = token;
  }, mockToken);

  // Trigger the Google Sign-In callback
  await page.evaluate(() => {
    const mockResponse = {
      credential: (window as any).__mockGoogleToken,
    };
    // Call the handleGoogleSignIn function if it exists
    if ((window as any).handleGoogleSignIn) {
      (window as any).handleGoogleSignIn(mockResponse);
    }
  });
}

/**
 * Create a mock Google JWT token for testing
 */
function createMockGoogleToken(claims: {
  sub: string;
  email: string;
  name: string;
  picture: string;
}): string {
  // Create a simple JWT-like structure (not cryptographically valid, but sufficient for testing)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  const signature = btoa('mock-signature');

  return `${header}.${payload}.${signature}`;
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, timeout = 5000) {
  await Promise.race([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout }),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]).catch(() => {
    // Navigation might not happen, which is okay
  });
}

/**
 * Check if user is authenticated by looking for session cookie
 */
export async function isUserAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((c) => c.name === 'app_session_id');
  return !!sessionCookie;
}

/**
 * Get the current user info from the page
 */
export async function getCurrentUser(page: Page) {
  return await page.evaluate(() => {
    // Try to get user info from the page context
    return (window as any).__currentUser || null;
  });
}

/**
 * Wait for a specific element to be visible
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Check if we're on a specific page by URL
 */
export async function isOnPage(page: Page, pathPattern: string | RegExp): Promise<boolean> {
  const url = page.url();
  if (typeof pathPattern === 'string') {
    return url.includes(pathPattern);
  }
  return pathPattern.test(url);
}

/**
 * Extract user ID from URL (e.g., /user/123 or /customer/456)
 */
export function extractUserIdFromUrl(url: string): string | null {
  const match = url.match(/\/(user|customer)\/([^/]+)/);
  return match ? match[2] : null;
}

/**
 * Mock database state for testing
 */
export async function mockDatabaseUser(page: Page, userData: any) {
  await page.evaluate((data) => {
    (window as any).__mockDatabaseUser = data;
  }, userData);
}

/**
 * Get mock database user
 */
export async function getMockDatabaseUser(page: Page) {
  return await page.evaluate(() => {
    return (window as any).__mockDatabaseUser || null;
  });
}
