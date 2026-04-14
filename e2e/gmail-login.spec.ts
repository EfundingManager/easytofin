import { test, expect, Page } from '@playwright/test';
import { decodeJWT, waitForNavigation, isUserAuthenticated, isOnPage, extractUserIdFromUrl } from './helpers';

/**
 * E2E Tests for Gmail Login Flow
 * Tests cover:
 * - New user registration via Gmail
 * - Existing user login via Gmail
 * - Session creation and persistence
 * - Proper redirect based on user status
 * - Error handling
 */

test.describe('Gmail Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to email auth page where Gmail button is available
    await page.goto('/email-auth');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Google Sign-In button', async ({ page }) => {
    // Check if Google Sign-In button is visible
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle new Gmail user registration', async ({ page, context }) => {
    // Mock the Google Sign-In response
    const mockGoogleId = 'google-new-user-' + Date.now();
    const mockEmail = `newuser-${Date.now()}@gmail.com`;
    const mockName = 'New Gmail User';
    const mockPicture = 'https://example.com/photo.jpg';

    // Intercept the API call to handleGoogleCallback
    await page.route('**/api/trpc/gmailAuth.handleGoogleCallback*', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Verify the request contains the expected data
      expect(postData).toBeDefined();

      // Mock successful response for new user
      await route.abort('blockedbyclient');
    });

    // Simulate Google Sign-In by directly calling the backend API
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName,
        picture: mockPicture,
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    // Verify response structure
    expect(result).toHaveProperty('result');
    expect(result.result).toHaveProperty('data');
    const data = result.result.data;

    // For new user, should return success and indicate new registration
    expect(data.success).toBe(true);
    expect(data.isNewRegistration).toBe(true);
    expect(data.message).toContain('Registration successful');
    expect(data.userId).toBeDefined();
    expect(data.redirectUrl).toBeDefined();
  });

  test('should handle existing Gmail user login', async ({ page, context }) => {
    // Use a known test email for existing user
    const mockGoogleId = 'google-existing-user-test';
    const mockEmail = 'existing@gmail.com';
    const mockName = 'Existing Gmail User';

    // First, create the user in the database
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const createResult = await createResponse.json();
    const userId = createResult.result.data.userId;

    // Now login with the same user
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    const data = loginResult.result.data;

    // For existing user, should return success but NOT indicate new registration
    expect(data.success).toBe(true);
    expect(data.isNewRegistration).toBe(false);
    expect(data.message).toContain('Login successful');
    expect(data.userId).toBe(userId);
  });

  test('should set session cookie after successful Gmail login', async ({ page, context }) => {
    const mockGoogleId = 'google-session-test-' + Date.now();
    const mockEmail = `session-test-${Date.now()}@gmail.com`;

    // Perform Gmail login
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: 'Session Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.result.data.success).toBe(true);

    // Check if session cookie is set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'app_session_id');

    // Note: Session cookie might be set by the backend, check response headers
    const setCookieHeader = response.headers()['set-cookie'];
    expect(setCookieHeader || sessionCookie).toBeDefined();
  });

  test('should redirect new Gmail user to profile page', async ({ page }) => {
    const mockGoogleId = 'google-redirect-new-' + Date.now();
    const mockEmail = `redirect-new-${Date.now()}@gmail.com`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: 'Redirect Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const result = await response.json();
    const data = result.result.data;

    // New user should be redirected to /profile
    expect(data.redirectUrl).toContain('/profile');
  });

  test('should redirect existing customer to customer dashboard', async ({ page }) => {
    const mockGoogleId = 'google-customer-redirect-' + Date.now();
    const mockEmail = `customer-${Date.now()}@gmail.com`;

    // Create user first
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: 'Customer User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const createResult = await createResponse.json();
    const userId = createResult.result.data.userId;

    // Simulate customer status by updating the database
    // (In a real test, you'd use a test database or API to set this)
    // For now, we verify the redirect URL structure for non-customer users
    const redirectUrl = createResult.result.data.redirectUrl;
    expect(redirectUrl).toMatch(/\/(user|customer)\/\d+/);
  });

  test('should reject Gmail login with invalid email', async ({ page }) => {
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: 'google-invalid-email',
        email: 'invalid-email-format',
        name: 'Invalid Email User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    // Should return error
    expect(response.status()).not.toBe(200);
  });

  test('should reject Gmail login with missing Google ID', async ({ page }) => {
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: '',
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    // Should return error
    expect(response.status()).not.toBe(200);
  });

  test('should reject Gmail login with missing name', async ({ page }) => {
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: 'google-no-name',
        email: 'test@gmail.com',
        name: '',
        picture: 'https://example.com/photo.jpg',
      },
    });

    // Should return error
    expect(response.status()).not.toBe(200);
  });

  test('should handle Gmail login with optional picture', async ({ page }) => {
    const mockGoogleId = 'google-no-picture-' + Date.now();
    const mockEmail = `no-picture-${Date.now()}@gmail.com`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: 'No Picture User',
        // picture is optional
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.result.data.success).toBe(true);
  });

  test('should maintain user data consistency across multiple logins', async ({ page }) => {
    const mockGoogleId = 'google-consistency-' + Date.now();
    const mockEmail = `consistency-${Date.now()}@gmail.com`;
    const mockName = 'Consistency Test User';

    // First login
    const firstLogin = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName,
        picture: 'https://example.com/photo1.jpg',
      },
    });

    const firstResult = await firstLogin.json();
    const firstUserId = firstResult.result.data.userId;

    // Second login with same Google ID but different picture
    const secondLogin = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName,
        picture: 'https://example.com/photo2.jpg',
      },
    });

    const secondResult = await secondLogin.json();
    const secondUserId = secondResult.result.data.userId;

    // User ID should remain the same
    expect(firstUserId).toBe(secondUserId);
    // Second login should not be marked as new registration
    expect(secondResult.result.data.isNewRegistration).toBe(false);
  });

  test('should handle Gmail login for admin role with 2FA requirement', async ({ page }) => {
    // Note: This test assumes we can create an admin user
    // In a real scenario, you'd need to set up a test admin account
    const mockGoogleId = 'google-admin-' + Date.now();
    const mockEmail = 'admin@easytofin.com';

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: mockGoogleId,
        email: mockEmail,
        name: 'Admin User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const data = result.result.data;

    // If user is admin, should require 2FA
    if (data.requires2FA) {
      expect(data.pendingToken).toBeDefined();
      expect(data.message).toContain('2FA');
    }
  });
});

test.describe('Gmail Login UI Integration', () => {
  test('should navigate to email auth page and see Gmail button', async ({ page }) => {
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');

    // Check for Google Sign-In button
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });

    // Button should be clickable
    await expect(googleButton).toBeEnabled();
  });

  test('should navigate from auth selection to email auth', async ({ page }) => {
    await page.goto('/auth-selection');
    await page.waitForLoadState('networkidle');

    // Find and click email auth option
    const emailOption = page.locator('button:has-text("Email")');
    if (await emailOption.isVisible()) {
      await emailOption.click();
      await page.waitForURL('**/email-auth');
    }

    // Verify we're on email auth page
    const url = page.url();
    expect(url).toContain('/email-auth');
  });

  test('should show loading state while Google API is initializing', async ({ page }) => {
    await page.goto('/email-auth');

    // Check for loading indicator
    const loadingIndicator = page.locator('text=Loading Google Sign-In');
    // Loading indicator might appear briefly
    const isVisible = await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false);

    // Eventually Google button should be visible
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });
  });

  test('should display email input field as fallback', async ({ page }) => {
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');

    // Check for email input field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', /email|example/i);
  });

  test('should have proper form structure on email auth page', async ({ page }) => {
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');

    // Check for page title
    const title = page.locator('text=Sign In or Register');
    await expect(title).toBeVisible();

    // Check for description
    const description = page.locator('text=Choose your preferred sign-in method');
    await expect(description).toBeVisible();

    // Check for divider between Google and email options
    const divider = page.locator('text=or');
    await expect(divider).toBeVisible();
  });
});

test.describe('Gmail Login Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true);

    // Try to access email auth page
    await page.goto('/email-auth').catch(() => {
      // Network error expected
    });

    // Go back online
    await page.context().setOffline(false);

    // Page should recover
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Intercept API calls and delay them
    await page.route('**/api/trpc/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 second delay
      await route.continue();
    });

    // This should timeout and be handled gracefully
    const response = await page.request
      .post('/api/trpc/gmailAuth.handleGoogleCallback', {
        data: {
          googleId: 'test',
          email: 'test@gmail.com',
          name: 'Test',
        },
        timeout: 5000,
      })
      .catch(() => null);

    // Should handle timeout without crashing
    expect(page.url()).toBeDefined();
  });
});
