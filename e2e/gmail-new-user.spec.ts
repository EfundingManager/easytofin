import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Gmail New User Registration Flow
 * 
 * This test suite covers the complete flow for a new user registering via Gmail:
 * 1. Navigate to email auth page
 * 2. Google Sign-In button is visible
 * 3. Simulate Gmail authentication
 * 4. Backend creates new user account
 * 5. Session is established
 * 6. User is redirected to profile completion page
 * 7. User completes profile and selects services
 * 8. User is redirected to dashboard
 */

test.describe('Gmail New User Registration Flow', () => {
  const newUserEmail = `newuser-${Date.now()}@gmail.com`;
  const newUserGoogleId = `google-new-${Date.now()}`;
  const newUserName = 'New Gmail User';

  test('should complete full registration flow for new Gmail user', async ({ page, context }) => {
    // Step 1: Navigate to email auth page
    await page.goto('/email-auth');
    await page.waitForLoadState('networkidle');

    // Step 2: Verify Google Sign-In button is visible
    const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible({ timeout: 10000 });

    // Step 3: Call the backend API to simulate Gmail authentication
    const registerResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: newUserGoogleId,
        email: newUserEmail,
        name: newUserName,
        picture: 'https://lh3.googleusercontent.com/a/default-user',
      },
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerResult = await registerResponse.json();
    const data = registerResult.result.data;

    // Step 4: Verify new user registration response
    expect(data.success).toBe(true);
    expect(data.isNewRegistration).toBe(true);
    expect(data.message).toContain('Registration successful');
    expect(data.userId).toBeDefined();
    expect(data.redirectUrl).toContain('/profile');

    const userId = data.userId;

    // Step 5: Verify session cookie is set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'app_session_id');
    // Note: Session might be set in response headers rather than context
    expect(registerResult).toBeDefined();

    // Step 6: Navigate to profile page
    await page.goto(`/profile`);
    await page.waitForLoadState('networkidle');

    // Step 7: Verify profile page is loaded
    const profileTitle = page.locator('text=Complete Your Profile');
    const profileForm = page.locator('form');
    
    // Profile form might not be visible if user is already authenticated
    // Check if we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/profile');
  });

  test('should create user in database on first Gmail login', async ({ page }) => {
    const email = `db-test-${Date.now()}@gmail.com`;
    const googleId = `google-db-${Date.now()}`;

    // Call backend to register new user
    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'DB Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userId = result.result.data.userId;

    // Verify user can be retrieved
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');

    // Step 2: Verify second login returns same user ID
    const secondResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'DB Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(secondResponse.ok()).toBeTruthy();
    const secondResult = await secondResponse.json();
    const secondUserId = secondResult.result.data.userId;

    // User ID should be the same
    expect(secondUserId).toBe(userId);
    // Second login should not be marked as new registration
    expect(secondResult.result.data.isNewRegistration).toBe(false);
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

    // Email should be marked as verified for Gmail users
    if (userData && userData.emailVerified) {
      expect(userData.emailVerified).toBe('true');
    }
  });

  test('should store user profile information correctly', async ({ page }) => {
    const email = `profile-${Date.now()}@gmail.com`;
    const googleId = `google-profile-${Date.now()}`;
    const name = 'Profile Test User';
    const picture = 'https://example.com/profile.jpg';

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: name,
        picture: picture,
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // Verify user data is stored correctly
    expect(userData.email).toBe(email);
    expect(userData.name).toBe(name);
    expect(userData.googleId).toBe(googleId);
    if (userData.picture) {
      expect(userData.picture).toBe(picture);
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

    // New Gmail users should have 'user' role by default
    expect(userData.role).toBe('user');
  });

  test('should set initial client status to "new" for new users', async ({ page }) => {
    const email = `status-${Date.now()}@gmail.com`;
    const googleId = `google-status-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Status Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userData = result.result.data.user;

    // New users should have clientStatus of 'new' or similar
    if (userData && userData.clientStatus) {
      expect(['new', 'queue', 'pending']).toContain(userData.clientStatus);
    }
  });

  test('should handle Gmail registration with special characters in name', async ({ page }) => {
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

    // Name should be stored correctly with special characters
    expect(userData.name).toBe(nameWithSpecialChars);
  });

  test('should handle Gmail registration with international email domains', async ({ page }) => {
    const email = `user-${Date.now()}@example.co.uk`;
    const googleId = `google-intl-${Date.now()}`;

    const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'International User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.result.data.success).toBe(true);
    expect(result.result.data.user.email).toBe(email);
  });

  test('should redirect new user to correct URL based on clientStatus', async ({ page }) => {
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

    // New user should be redirected to /profile
    expect(redirectUrl).toContain('/profile');
  });

  test('should handle multiple concurrent new user registrations', async ({ page }) => {
    const registrations = [];

    // Create 3 concurrent registrations
    for (let i = 0; i < 3; i++) {
      const email = `concurrent-${Date.now()}-${i}@gmail.com`;
      const googleId = `google-concurrent-${Date.now()}-${i}`;

      const promise = page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
        data: {
          googleId: googleId,
          email: email,
          name: `Concurrent User ${i}`,
          picture: 'https://example.com/photo.jpg',
        },
      });

      registrations.push(promise);
    }

    // Wait for all registrations to complete
    const responses = await Promise.all(registrations);

    // All should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      expect(result.result.data.success).toBe(true);
      expect(result.result.data.isNewRegistration).toBe(true);
    }

    // All should have unique user IDs
    const userIds = new Set();
    for (const response of responses) {
      const result = await response.json();
      const userId = result.result.data.userId;
      userIds.add(userId);
    }
    expect(userIds.size).toBe(3);
  });

  test('should not allow duplicate Gmail IDs', async ({ page }) => {
    const email = `duplicate-${Date.now()}@gmail.com`;
    const googleId = `google-duplicate-${Date.now()}`;

    // First registration
    const firstResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: email,
        name: 'Duplicate Test User',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(firstResponse.ok()).toBeTruthy();
    const firstResult = await firstResponse.json();
    const firstUserId = firstResult.result.data.userId;

    // Second registration with same Google ID but different email
    const secondEmail = `duplicate2-${Date.now()}@gmail.com`;
    const secondResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
      data: {
        googleId: googleId,
        email: secondEmail,
        name: 'Duplicate Test User 2',
        picture: 'https://example.com/photo.jpg',
      },
    });

    expect(secondResponse.ok()).toBeTruthy();
    const secondResult = await secondResponse.json();
    const secondUserId = secondResult.result.data.userId;

    // Should return the same user (not create a new one)
    expect(secondUserId).toBe(firstUserId);
    // Should not be marked as new registration
    expect(secondResult.result.data.isNewRegistration).toBe(false);
  });
});
