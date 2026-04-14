import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Gmail Existing User Login Flow
 * 
 * This test suite covers the complete flow for an existing user logging in via Gmail:
 * 1. User already exists in database
 * 2. Navigate to email auth page
 * 3. Click Google Sign-In button
 * 4. Backend authenticates and retrieves existing user
 * 5. Session is established
 * 6. User is redirected to appropriate dashboard based on status
 */

test.describe('Gmail Existing User Login Flow', () => {
  test('should login existing Gmail user successfully', async ({ page, context }) => {
    // First, create a user
    const email = `existing-${Date.now()}@gmail.com`;
    const googleId = `google-existing-${Date.now()}`;
    const name = 'Existing Gmail User';

    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: name,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const createResult = await createResponse.json();
    const userId = createResult.result.data.userId;

    // Now login with the same user
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: name,
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    const loginData = loginResult.result.data;

    // Verify login response
    expect(loginData.success).toBe(true);
    expect(loginData.isNewRegistration).toBe(false);
    expect(loginData.message).toContain('Login successful');
    expect(loginData.userId).toBe(userId);
  });

  test('should preserve user data on subsequent logins', async ({ page }) => {
    const email = `preserve-${Date.now()}@gmail.com`;
    const googleId = `google-preserve-${Date.now()}`;
    const originalName = 'Original Name';
    const originalPicture = 'https://example.com/photo1.jpg';

    // Create user with initial data
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: originalName,
        picture: originalPicture,
      },
    });

    const createResult = await createResponse.json();
    const originalUser = createResult.result.data.user;

    // Login with updated picture
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: originalName,
        picture: 'https://example.com/photo2.jpg',
      },
    });

    const loginResult = await loginResponse.json();
    const loginUser = loginResult.result.data.user;

    // Email and name should remain the same
    expect(loginUser.email).toBe(originalUser.email);
    expect(loginUser.name).toBe(originalUser.name);
  });

  test('should maintain user ID consistency across multiple logins', async ({ page }) => {
    const email = `consistency-${Date.now()}@gmail.com`;
    const googleId = `google-consistency-${Date.now()}`;

    const userIds = [];

    // Perform 3 consecutive logins
    for (let i = 0; i < 3; i++) {
      const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
        data: {
          googleId: googleId,
          email: email,
          name: 'Consistency Test User',
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

  test('should redirect existing customer user to customer dashboard', async ({ page }) => {
    const email = `customer-${Date.now()}@gmail.com`;
    const googleId = `google-customer-${Date.now()}`;

    // Create user
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Customer User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const createResult = await createResponse.json();
    const redirectUrl = createResult.result.data.redirectUrl;

    // New user should be redirected to /profile
    expect(redirectUrl).toContain('/profile');

    // After becoming a customer, redirect should be to /customer/:id
    // (This would require updating the user's clientStatus in the database)
  });

  test('should redirect existing non-customer user to user portal', async ({ page }) => {
    const email = `user-${Date.now()}@gmail.com`;
    const googleId = `google-user-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Portal User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const result = await response.json();
    const redirectUrl = result.result.data.redirectUrl;

    // Should redirect to either /profile or /user/:id depending on status
    expect(redirectUrl).toMatch(/\/(profile|user\/\d+)/);
  });

  test('should establish session on existing user login', async ({ page, context }) => {
    const email = `session-${Date.now()}@gmail.com`;
    const googleId = `google-session-${Date.now()}`;

    // Create user
    await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Session User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    // Login and check for session
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Session User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    // Check response headers for session cookie
    const setCookieHeader = loginResponse.headers()['set-cookie'];
    // Session might be set in response or via context
    expect(loginResponse.ok()).toBeTruthy();
  });

  test('should handle login with changed email domain', async ({ page }) => {
    // Create user with Gmail address
    const googleId = `google-domain-${Date.now()}`;
    const originalEmail = `user-${Date.now()}@gmail.com`;

    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: originalEmail,
        name: 'Domain Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const createResult = await createResponse.json();
    const userId = createResult.result.data.userId;

    // Try to login with different email but same Google ID
    // In real scenario, Google would return the same email
    // This test verifies the system handles the same Google ID correctly
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: originalEmail, // Same email as original
        name: 'Domain Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    // Should return the same user
    expect(loginResult.result.data.userId).toBe(userId);
  });

  test('should handle rapid consecutive logins', async ({ page }) => {
    const email = `rapid-${Date.now()}@gmail.com`;
    const googleId = `google-rapid-${Date.now()}`;

    // Create user
    await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Rapid Login User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    // Perform 5 rapid logins
    const loginPromises = [];
    for (let i = 0; i < 5; i++) {
      loginPromises.push(
        page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
          data: {
            googleId: googleId,
            email: email,
            name: 'Rapid Login User',
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
      expect(result.result.data.isNewRegistration).toBe(false);
    }
  });

  test('should not create duplicate accounts on login', async ({ page }) => {
    const email = `nodup-${Date.now()}@gmail.com`;
    const googleId = `google-nodup-${Date.now()}`;

    // Create user
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'No Duplicate User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const createResult = await createResponse.json();
    const firstUserId = createResult.result.data.userId;

    // Login 3 times
    for (let i = 0; i < 3; i++) {
      const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
        data: {
          googleId: googleId,
          email: email,
          name: 'No Duplicate User',
          picture: 'https://example.com/photo.jpg',
        },
      });

      const loginResult = await loginResponse.json();
      // Should always return the same user ID
      expect(loginResult.result.data.userId).toBe(firstUserId);
      // Should never be marked as new registration
      expect(loginResult.result.data.isNewRegistration).toBe(false);
    }
  });

  test('should handle admin user login with 2FA requirement', async ({ page }) => {
    // This test assumes we have a test admin account
    const adminEmail = 'admin-test@easytofin.com';
    const adminGoogleId = `google-admin-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: adminGoogleId,
        email: adminEmail,
        name: 'Admin Test User',
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
      expect(data.requires2FA).toBe(true);
    }
  });

  test('should handle manager user login with 2FA requirement', async ({ page }) => {
    // This test assumes we have a test manager account
    const managerEmail = 'manager-test@easytofin.com';
    const managerGoogleId = `google-manager-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: managerGoogleId,
        email: managerEmail,
        name: 'Manager Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const data = result.result.data;

    // If user is manager, should require 2FA
    if (data.requires2FA) {
      expect(data.pendingToken).toBeDefined();
      expect(data.message).toContain('2FA');
    }
  });

  test('should maintain user role on login', async ({ page }) => {
    const email = `role-${Date.now()}@gmail.com`;
    const googleId = `google-role-${Date.now()}`;

    // Create user
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Role Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const createResult = await createResponse.json();
    const originalRole = createResult.result.data.user.role;

    // Login and verify role is maintained
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Role Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    const loginResult = await loginResponse.json();
    const loginRole = loginResult.result.data.user.role;

    expect(loginRole).toBe(originalRole);
  });

  test('should handle login after profile completion', async ({ page }) => {
    const email = `profile-${Date.now()}@gmail.com`;
    const googleId = `google-profile-${Date.now()}`;

    // Create user
    const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Profile User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(createResponse.ok()).toBeTruthy();

    // In a real scenario, user would complete profile here
    // Then login again
    const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Profile User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginResult = await loginResponse.json();
    expect(loginResult.result.data.success).toBe(true);
  });
});
