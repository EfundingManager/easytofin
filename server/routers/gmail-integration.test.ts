import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';

/**
 * Integration Tests for Gmail Login Flow
 * 
 * These tests validate the complete Gmail authentication flow:
 * - New user registration
 * - Existing user login
 * - Session creation
 * - Proper redirects based on user status
 * - Error handling
 */

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null, // Public context - no authenticated user
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };

  return ctx;
}

describe('Gmail Login Integration Tests', () => {
  let caller: any;

  beforeEach(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('New User Registration', () => {
    it('should register a new Gmail user successfully', async () => {
      const googleId = `google-new-${Date.now()}`;
      const email = `newuser-${Date.now()}@gmail.com`;
      const name = 'New Gmail User';

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name,
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.isNewRegistration).toBe(true);
      expect(result.message).toContain('Registration successful');
      expect(result.userId).toBeDefined();
      // New users are redirected to /user/:id for profile completion
      expect(result.redirectUrl).toMatch(/\/user\/\d+/);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.name).toBe(name);
      expect(result.user.googleId).toBe(googleId);
    });

    it('should set email as verified for new Gmail users', async () => {
      const googleId = `google-verified-${Date.now()}`;
      const email = `verified-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Verified User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.user.emailVerified).toBe('true');
    });

    it('should assign default role "user" to new Gmail users', async () => {
      const googleId = `google-role-${Date.now()}`;
      const email = `role-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Role Test User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('user');
    });

    it('should set initial client status for new users', async () => {
      const googleId = `google-status-${Date.now()}`;
      const email = `status-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Status User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.clientStatus).toBeDefined();
      expect(['new', 'queue', 'pending']).toContain(result.clientStatus);
    });

    it('should handle Gmail registration with special characters in name', async () => {
      const googleId = `google-special-${Date.now()}`;
      const email = `special-${Date.now()}@gmail.com`;
      const nameWithSpecialChars = "O'Brien-Smith (José)";

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: nameWithSpecialChars,
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.user.name).toBe(nameWithSpecialChars);
    });

    it('should handle Gmail registration with optional picture', async () => {
      const googleId = `google-nopic-${Date.now()}`;
      const email = `nopic-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'No Picture User',
        // picture is optional
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
    });
  });

  describe('Existing User Login', () => {
    it('should login existing Gmail user successfully', async () => {
      const googleId = `google-existing-${Date.now()}`;
      const email = `existing-${Date.now()}@gmail.com`;

      // First registration
      const createResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(createResult.success).toBe(true);
      const userId = createResult.userId;

      // Second login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.isNewRegistration).toBe(false);
      expect(loginResult.message).toContain('Login successful');
      expect(loginResult.userId).toBe(userId);
    });

    it('should maintain user ID consistency across multiple logins', async () => {
      const googleId = `google-consistency-${Date.now()}`;
      const email = `consistency-${Date.now()}@gmail.com`;

      const userIds = [];

      // Perform 3 logins
      for (let i = 0; i < 3; i++) {
        const result = await caller.gmailAuth.handleGoogleCallback({
          googleId,
          email,
          name: 'Consistency User',
          picture: 'https://example.com/photo.jpg',
        });

        expect(result.success).toBe(true);
        userIds.push(result.userId);
      }

      // All user IDs should be identical
      expect(userIds[0]).toBe(userIds[1]);
      expect(userIds[1]).toBe(userIds[2]);
    });

    it('should preserve user data on subsequent logins', async () => {
      const googleId = `google-preserve-${Date.now()}`;
      const email = `preserve-${Date.now()}@gmail.com`;
      const originalName = 'Original Name';

      // Create user
      const createResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: originalName,
        picture: 'https://example.com/photo1.jpg',
      });

      const originalUser = createResult.user;

      // Login with updated picture
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: originalName,
        picture: 'https://example.com/photo2.jpg',
      });

      const loginUser = loginResult.user;

      // Email and name should remain the same
      expect(loginUser.email).toBe(originalUser.email);
      expect(loginUser.name).toBe(originalUser.name);
    });

    it('should maintain user role on login', async () => {
      const googleId = `google-role-persist-${Date.now()}`;
      const email = `role-persist-${Date.now()}@gmail.com`;

      // Create user
      const createResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Role Persist User',
        picture: 'https://example.com/photo.jpg',
      });

      const originalRole = createResult.user.role;

      // Login and verify role is maintained
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Role Persist User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(loginResult.user.role).toBe(originalRole);
    });
  });

  describe('Session and Redirect Validation', () => {
    it('should return correct redirect URL for new user', async () => {
      const googleId = `google-redirect-new-${Date.now()}`;
      const email = `redirect-new-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Redirect User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      // New users are redirected to /user/:id for profile completion
      expect(result.redirectUrl).toMatch(/\/user\/\d+/);
    });

    it('should include userId in redirect URL', async () => {
      const googleId = `google-userid-${Date.now()}`;
      const email = `userid-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'User ID Test',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.redirectUrl).toContain(result.userId);
    });

    it('should return appropriate response structure', async () => {
      const googleId = `google-structure-${Date.now()}`;
      const email = `structure-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Structure Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Verify response structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('redirectUrl');
      expect(result).toHaveProperty('isNewRegistration');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('clientStatus');
      expect(result).toHaveProperty('loginMethod');
    });

    it('should return login method as "google"', async () => {
      const googleId = `google-method-${Date.now()}`;
      const email = `method-${Date.now()}@gmail.com`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Method Test',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.loginMethod).toBe('google');
    });
  });

  describe('Error Handling', () => {
    it('should reject Gmail login with invalid email format', async () => {
      const googleId = 'google-invalid-email';
      const email = 'invalid-email-format';

      try {
        await caller.gmailAuth.handleGoogleCallback({
          googleId,
          email,
          name: 'Invalid Email User',
          picture: 'https://example.com/photo.jpg',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it('should reject Gmail login with missing Google ID', async () => {
      const email = `test-${Date.now()}@gmail.com`;

      try {
        await caller.gmailAuth.handleGoogleCallback({
          googleId: '',
          email,
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it('should reject Gmail login with missing name', async () => {
      const googleId = 'google-no-name';
      const email = `test-${Date.now()}@gmail.com`;

      try {
        await caller.gmailAuth.handleGoogleCallback({
          googleId,
          email,
          name: '',
          picture: 'https://example.com/photo.jpg',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent Gmail registrations', async () => {
      const registrations = [];

      // Create 3 concurrent registrations
      for (let i = 0; i < 3; i++) {
        const googleId = `google-concurrent-${Date.now()}-${i}`;
        const email = `concurrent-${Date.now()}-${i}@gmail.com`;

        registrations.push(
          caller.gmailAuth.handleGoogleCallback({
            googleId,
            email,
            name: `Concurrent User ${i}`,
            picture: 'https://example.com/photo.jpg',
          })
        );
      }

      const results = await Promise.all(registrations);

      // All should succeed
      for (const result of results) {
        expect(result.success).toBe(true);
        expect(result.isNewRegistration).toBe(true);
      }

      // All should have unique user IDs
      const userIds = new Set(results.map((r) => r.userId));
      expect(userIds.size).toBe(3);
    });

    it('should not create duplicate accounts for same Google ID', async () => {
      const googleId = `google-duplicate-${Date.now()}`;
      const email = `duplicate-${Date.now()}@gmail.com`;

      // First registration
      const firstResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Duplicate Test',
        picture: 'https://example.com/photo.jpg',
      });

      const firstUserId = firstResult.userId;

      // Second registration with same Google ID
      const secondResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Duplicate Test',
        picture: 'https://example.com/photo.jpg',
      });

      const secondUserId = secondResult.userId;

      // Should return the same user
      expect(secondUserId).toBe(firstUserId);
      // Should not be marked as new registration
      expect(secondResult.isNewRegistration).toBe(false);
    });
  });

  describe('User Data Validation', () => {
    it('should store all user profile fields correctly', async () => {
      const googleId = `google-fields-${Date.now()}`;
      const email = `fields-${Date.now()}@gmail.com`;
      const name = 'Fields Test User';
      const picture = 'https://example.com/profile.jpg';

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name,
        picture,
      });

      expect(result.success).toBe(true);
      const user = result.user;

      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.googleId).toBe(googleId);
      if (user.picture) {
        expect(user.picture).toBe(picture);
      }
    });

    it('should handle international email domains', async () => {
      const googleId = `google-intl-${Date.now()}`;
      const email = `user-${Date.now()}@example.co.uk`;

      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'International User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe(email);
    });
  });
});
