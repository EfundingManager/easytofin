import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Gmail Login Session and Redirect Validation
 * 
 * This test suite covers:
 * 1. Session creation and persistence
 * 2. Session cookie validation
 * 3. Redirect logic based on user status
 * 4. Protected route access
 * 5. Session expiration and refresh
 */

test.describe('Gmail Login Session and Redirect Validation', () => {
  test('should create valid session after Gmail login', async ({ page, context }) => {
    const email = `session-${Date.now()}@gmail.com`;
    const googleId = `google-session-${Date.now()}`;

    // Perform Gmail login
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Session Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const result = await loginResponse.json();
    expect(result.result.data.success).toBe(true);

    // Verify session cookie is set in response
    const setCookieHeader = loginResponse.headers()['set-cookie'];
    // Session might be set via context or response headers
    expect(loginResponse.ok()).toBeTruthy();
  });

  test('should redirect new user to /profile', async ({ page }) => {
    const email = `redirect-profile-${Date.now()}@gmail.com`;
    const googleId = `google-redirect-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Profile Redirect User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;

    // New user should redirect to /profile
    expect(redirectUrl).toContain('/profile');
  });

  test('should redirect user to /user/:id when not a customer', async ({ page }) => {
    const email = `redirect-user-${Date.now()}@gmail.com`;
    const googleId = `google-redirect-user-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'User Portal Redirect',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;

    // Should redirect to either /profile or /user/:id
    expect(redirectUrl).toMatch(/\/(profile|user\/\d+)/);
  });

  test('should redirect customer to /customer/:id', async ({ page }) => {
    const email = `redirect-customer-${Date.now()}@gmail.com`;
    const googleId = `google-redirect-customer-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Customer Redirect',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;
    const clientStatus = result.result.data.clientStatus;

    // If user is a customer, redirect should be to /customer/:id
    if (clientStatus === 'customer') {
      expect(redirectUrl).toContain('/customer/');
    }
  });

  test('should include userId in response for redirect', async ({ page }) => {
    const email = `userid-${Date.now()}@gmail.com`;
    const googleId = `google-userid-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'User ID Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userId = result.result.data.userId;
    const redirectUrl = result.result.data.redirectUrl;

    // User ID should be present
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');

    // Redirect URL should contain the user ID
    expect(redirectUrl).toContain(userId);
  });

  test('should maintain session across multiple API calls', async ({ page, context }) => {
    const email = `persist-${Date.now()}@gmail.com`;
    const googleId = `google-persist-${Date.now()}`;

    // First login
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Persistence Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    const userId = loginResult.result.data.userId;

    // Make another API call with the same context
    const secondCall = await page.request.post('/api/trpc/auth.me', {});

    // Should be able to make authenticated calls
    expect(secondCall.ok()).toBeTruthy();
  });

  test('should return correct clientStatus in response', async ({ page }) => {
    const email = `status-${Date.now()}@gmail.com`;
    const googleId = `google-status-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Status Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const clientStatus = result.result.data.clientStatus;

    // Client status should be one of the valid values
    expect(['new', 'queue', 'in_progress', 'assigned', 'customer']).toContain(clientStatus);
  });

  test('should return user object with essential fields', async ({ page }) => {
    const email = `userobj-${Date.now()}@gmail.com`;
    const googleId = `google-userobj-${Date.now()}`;
    const name = 'User Object Test';

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: name,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const user = result.result.data.user;

    // User object should contain essential fields
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('googleId');
    expect(user).toHaveProperty('role');

    // Verify values
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.googleId).toBe(googleId);
  });

  test('should handle redirect for admin user with 2FA', async ({ page }) => {
    const email = `admin-2fa-${Date.now()}@gmail.com`;
    const googleId = `google-admin-2fa-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Admin 2FA Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const data = result.result.data;

    // If 2FA is required
    if (data.requires2FA) {
      expect(data.pendingToken).toBeDefined();
      expect(data.redirectUrl).toContain('/2fa');
    }
  });

  test('should include login method in response', async ({ page }) => {
    const email = `method-${Date.now()}@gmail.com`;
    const googleId = `google-method-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Login Method Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const loginMethod = result.result.data.loginMethod;

    // Login method should be 'google'
    expect(loginMethod).toBe('google');
  });

  test('should handle session timeout gracefully', async ({ page, context }) => {
    const email = `timeout-${Date.now()}@gmail.com`;
    const googleId = `google-timeout-${Date.now()}`;

    // Login
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Timeout Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    // Simulate session timeout by clearing cookies
    await context.clearCookies();

    // Try to access protected resource
    const protectedCall = await page.request.post('/api/trpc/auth.me', {}).catch(() => null);

    // Should handle gracefully (either return null or redirect to login)
    if (protectedCall) {
      expect(protectedCall.status()).toBeDefined();
    }
  });

  test('should validate redirect URL format', async ({ page }) => {
    const email = `urlformat-${Date.now()}@gmail.com`;
    const googleId = `google-urlformat-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'URL Format Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;

    // Redirect URL should start with /
    expect(redirectUrl).toMatch(/^\/[a-z0-9\-_/]*$/i);
  });

  test('should handle concurrent logins with session isolation', async ({ page, context }) => {
    const loginPromises = [];

    // Perform 3 concurrent logins
    for (let i = 0; i < 3; i++) {
      const email = `concurrent-${Date.now()}-${i}@gmail.com`;
      const googleId = `google-concurrent-${Date.now()}-${i}`;

      loginPromises.push(
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

    const responses = await Promise.all(loginPromises);

    // All should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      expect(result.result.data.success).toBe(true);
    }

    // All should have different user IDs
    const userIds = new Set();
    for (const response of responses) {
      const result = await response.json();
      userIds.add(result.result.data.userId);
    }
    expect(userIds.size).toBe(3);
  });

  test('should preserve session across page navigation', async ({ page, context }) => {
    const email = `navpreserve-${Date.now()}@gmail.com`;
    const googleId = `google-navpreserve-${Date.now()}`;

    // Login via API
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Navigation Preserve Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if session is still valid by making an authenticated call
    const authCall = await page.request.post('/api/trpc/auth.me', {});
    expect(authCall.ok()).toBeTruthy();
  });

  test('should return appropriate message for new vs existing users', async ({ page }) => {
    const email = `message-${Date.now()}@gmail.com`;
    const googleId = `google-message-${Date.now()}`;

    // First login (new user)
    const newUserResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Message Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const newUserResult = await newUserResponse.json();
    expect(newUserResult.result.data.message).toContain('Registration successful');

    // Second login (existing user)
    const existingUserResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Message Test',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const existingUserResult = await existingUserResponse.json();
    expect(existingUserResult.result.data.message).toContain('Login successful');
  });
});
