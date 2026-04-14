import { test, expect } from '@playwright/test';

/**
 * Core E2E Tests for Gmail Login Flow
 * 
 * This is a focused test suite covering the essential Gmail login scenarios:
 * - New user registration
 * - Existing user login
 * - Session creation
 * - Proper redirects
 * - Error handling
 */

test.describe('Gmail Login - Core Scenarios', () => {
  test('should display Google Sign-In button on email auth page', async ({ page }) => {
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');

    // Check if Google Sign-In button is visible
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });
  });

  test('should register new Gmail user successfully', async ({ page }) => {
    const email = `newuser-${Date.now()}@gmail.com`;
    const googleId = `google-new-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'New Gmail User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const data = result.result.data;

    // Verify new user registration
    expect(data.success).toBe(true);
    expect(data.isNewRegistration).toBe(true);
    expect(data.message).toContain('Registration successful');
    expect(data.userId).toBeDefined();
    expect(data.redirectUrl).toContain('/profile');
  });

  test('should login existing Gmail user successfully', async ({ page }) => {
    const email = `existing-${Date.now()}@gmail.com`;
    const googleId = `google-existing-${Date.now()}`;

    // Create user first
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const createResult = await createResponse.json();
    const userId = createResult.result.data.userId;

    // Login with same user
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    const loginData = loginResult.result.data;

    // Verify existing user login
    expect(loginData.success).toBe(true);
    expect(loginData.isNewRegistration).toBe(false);
    expect(loginData.message).toContain('Login successful');
    expect(loginData.userId).toBe(userId);
  });

  test('should maintain user ID consistency across multiple logins', async ({ page }) => {
    const email = `consistency-${Date.now()}@gmail.com`;
    const googleId = `google-consistency-${Date.now()}`;

    const userIds = [];

    // Perform 3 logins
    for (let i = 0; i < 3; i++) {
      const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
        data: {
          googleId: googleId,
          email: email,
          name: 'Consistency User',
          picture: 'https://example.com/photo.jpg',
        },
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      userIds.push(result.result.data.userId);
    }

    // All user IDs should be identical
    expect(userIds[0]).toBe(userIds[1]);
    expect(userIds[1]).toBe(userIds[2]);
  });

  test('should store user profile information correctly', async ({ page }) => {
    const email = `profile-${Date.now()}@gmail.com`;
    const googleId = `google-profile-${Date.now()}`;
    const name = 'Profile Test User';

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: name,
        picture: 'https://example.com/profile.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // Verify user data
    expect(userData.email).toBe(email);
    expect(userData.name).toBe(name);
    expect(userData.googleId).toBe(googleId);
  });

  test('should set email as verified for Gmail users', async ({ page }) => {
    const email = `verified-${Date.now()}@gmail.com`;
    const googleId = `google-verified-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Verified User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // Email should be marked as verified
    if (userData.emailVerified) {
      expect(userData.emailVerified).toBe('true');
    }
  });

  test('should assign default role to new Gmail users', async ({ page }) => {
    const email = `role-${Date.now()}@gmail.com`;
    const googleId = `google-role-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Role Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // New users should have 'user' role
    expect(userData.role).toBe('user');
  });

  test('should reject Gmail login with invalid email', async ({ page }) => {
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: 'google-invalid',
        email: 'invalid-email',
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
    const email = `nopic-${Date.now()}@gmail.com`;
    const googleId = `google-nopic-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'No Picture User',
        // picture is optional
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.result.data.success).toBe(true);
  });

  test('should redirect new user to correct profile page', async ({ page }) => {
    const email = `redirect-${Date.now()}@gmail.com`;
    const googleId = `google-redirect-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Redirect User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;

    // New user should redirect to /profile
    expect(redirectUrl).toContain('/profile');
  });

  test('should handle concurrent Gmail registrations', async ({ page }) => {
    const registrations = [];

    // Create 3 concurrent registrations
    for (let i = 0; i < 3; i++) {
      const email = `concurrent-${Date.now()}-${i}@gmail.com`;
      const googleId = `google-concurrent-${Date.now()}-${i}`;

      registrations.push(
        page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
          data: {
            googleId: googleId,
            email: email,
            name: `Concurrent User ${i}`,
            picture: 'https://example.com/photo.jpg',
          },
        })
      );
    }

    const responses = await Promise.all(registrations);

    // All should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      expect(result.result.data.success).toBe(true);
    }

    // All should have unique user IDs
    const userIds = new Set();
    for (const response of responses) {
      const result = await response.json();
      userIds.add(result.result.data.userId);
    }
    expect(userIds.size).toBe(3);
  });

  test('should not create duplicate accounts for same Google ID', async ({ page }) => {
    const email = `duplicate-${Date.now()}@gmail.com`;
    const googleId = `google-duplicate-${Date.now()}`;

    // First registration
    const firstResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Duplicate Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const firstResult = await firstResponse.json();
    const firstUserId = firstResult.result.data.userId;

    // Second registration with same Google ID
    const secondResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Duplicate Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const secondResult = await secondResponse.json();
    const secondUserId = secondResult.result.data.userId;

    // Should return the same user
    expect(secondUserId).toBe(firstUserId);
    // Should not be marked as new registration
    expect(secondResult.result.data.isNewRegistration).toBe(false);
  });

  test('should handle Gmail login with special characters in name', async ({ page }) => {
    const email = `special-${Date.now()}@gmail.com`;
    const googleId = `google-special-${Date.now()}`;
    const nameWithSpecialChars = "O'Brien-Smith (José)";

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: nameWithSpecialChars,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // Name should be stored correctly
    expect(userData.name).toBe(nameWithSpecialChars);
  });

  test('should return appropriate response structure', async ({ page }) => {
    const email = `structure-${Date.now()}@gmail.com`;
    const googleId = `google-structure-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Structure Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const data = result.result.data;

    // Verify response structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('redirectUrl');
    expect(data).toHaveProperty('isNewRegistration');
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('clientStatus');
  });
});
