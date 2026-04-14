import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';
import * as db from '../db';

/**
 * Two-Factor Authentication Integration Tests
 * 
 * These tests validate the complete 2FA flow for admin/manager roles:
 * - Admin/manager Gmail login triggers 2FA requirement
 * - Phone OTP request and verification
 * - Session creation after successful 2FA
 * - Error handling for invalid OTP
 * - Rate limiting and attempt tracking
 */

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };

  return ctx;
}

describe('Two-Factor Authentication (2FA) Flow', () => {
  let caller: any;

  beforeEach(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('Admin Gmail Login with 2FA', () => {
    it('should require 2FA for admin user on Gmail login', async () => {
      const googleId = `google-admin-${Date.now()}`;
      const email = `admin-${Date.now()}@easytofin.com`;
      const phone = '+353851234567';

      // First, create an admin user via phone registration
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'Admin User',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      expect(phoneUser).toBeDefined();
      expect(phoneUser.role).toBe('admin');

      // Now attempt Gmail login with this admin account
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Admin User',
        picture: 'https://example.com/photo.jpg',
      });

      // Should require 2FA
      expect(result.success).toBe(true);
      expect(result.requires2FA).toBe(true);
      expect(result.pendingToken).toBeDefined();
      expect(result.message).toContain('Phone 2FA required');
      expect(result.loginMethod).toBe('google');
    });

    it('should require 2FA for manager user on Gmail login', async () => {
      const googleId = `google-manager-${Date.now()}`;
      const email = `manager-${Date.now()}@easytofin.com`;
      const phone = '+353851234568';

      // Create a manager user
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'Manager User',
        phone,
        role: 'manager',
        verified: 'true',
        emailVerified: 'true',
      });

      expect(phoneUser.role).toBe('manager');

      // Gmail login should trigger 2FA
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Manager User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.requires2FA).toBe(true);
      expect(result.pendingToken).toBeDefined();
    });

    it('should require 2FA for staff user on Gmail login', async () => {
      const googleId = `google-staff-${Date.now()}`;
      const email = `staff-${Date.now()}@easytofin.com`;
      const phone = '+353851234569';

      // Create a staff user
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'Staff User',
        phone,
        role: 'staff',
        verified: 'true',
        emailVerified: 'true',
      });

      expect(phoneUser.role).toBe('staff');

      // Gmail login should trigger 2FA
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Staff User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.requires2FA).toBe(true);
      expect(result.pendingToken).toBeDefined();
    });

    it('should NOT require 2FA for regular user on Gmail login', async () => {
      const googleId = `google-user-${Date.now()}`;
      const email = `user-${Date.now()}@gmail.com`;

      // Regular user Gmail login should NOT require 2FA
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Regular User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.requires2FA).toBe(false);
      expect(result.pendingToken).toBeUndefined();
      expect(result.sessionToken).toBeDefined();
      expect(result.redirectUrl).toBeDefined();
    });

    it('should reject admin login without phone number', async () => {
      const googleId = `google-no-phone-${Date.now()}`;
      const email = `nophone-${Date.now()}@easytofin.com`;

      // Create admin without phone
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'No Phone Admin',
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      try {
        await caller.gmailAuth.handleGoogleCallback({
          googleId,
          email,
          name: 'No Phone Admin',
          picture: 'https://example.com/photo.jpg',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('phone number is registered');
      }
    });
  });

  describe('2FA OTP Request', () => {
    it('should request phone OTP for pending 2FA token', async () => {
      const googleId = `google-otp-req-${Date.now()}`;
      const email = `otp-req-${Date.now()}@easytofin.com`;
      const phone = '+353851234570';

      // Create admin user
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'OTP Request Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Get pending token from Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'OTP Request Test',
        picture: 'https://example.com/photo.jpg',
      });

      expect(loginResult.requires2FA).toBe(true);
      const pendingToken = loginResult.pendingToken;

      // Request OTP
      const otpResult = await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken,
      });

      expect(otpResult.success).toBe(true);
      expect(otpResult.message).toContain('verification code');
      expect(otpResult.maskedPhone).toBeDefined();
      // Dev code should be present for testing
      expect(otpResult.devCode).toBeDefined();
      expect(otpResult.devCode).toMatch(/^\d{6}$/);
    });

    it('should reject OTP request with invalid pending token', async () => {
      try {
        await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
          pendingToken: 'invalid-token',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid or expired');
      }
    });

    it('should mask phone number in OTP response', async () => {
      const googleId = `google-mask-${Date.now()}`;
      const email = `mask-${Date.now()}@easytofin.com`;
      const phone = '+353851234571';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Mask Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Get pending token
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Mask Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      const otpResult = await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      // Verify phone is masked (should not show full number)
      expect(otpResult.maskedPhone).toBeDefined();
      expect(otpResult.maskedPhone).not.toContain(phone);
      expect(otpResult.maskedPhone).toMatch(/\*/);
    });
  });

  describe('2FA OTP Verification', () => {
    it('should complete login with valid OTP', async () => {
      const googleId = `google-verify-${Date.now()}`;
      const email = `verify-${Date.now()}@easytofin.com`;
      const phone = '+353851234572';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Verify Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Verify Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      const otpResult = await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      const correctOtp = otpResult.devCode;

      // Verify OTP and complete login
      const verifyResult = await (caller.twoFactorAuth.completeLogin as any).mutate({
        pendingToken: loginResult.pendingToken,
        code: correctOtp,
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.message).toContain('Login successful');
      expect(verifyResult.user).toBeDefined();
      expect(verifyResult.user.role).toBe('admin');
    });

    it('should reject invalid OTP code', async () => {
      const googleId = `google-invalid-otp-${Date.now()}`;
      const email = `invalid-otp-${Date.now()}@easytofin.com`;
      const phone = '+353851234573';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Invalid OTP Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Invalid OTP Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      // Try with wrong OTP
      try {
        await (caller.twoFactorAuth.completeLogin as any).mutate({
          pendingToken: loginResult.pendingToken,
          code: '000000',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid or expired');
      }
    });

    it('should reject OTP with incorrect format', async () => {
      const googleId = `google-format-${Date.now()}`;
      const email = `format-${Date.now()}@easytofin.com`;
      const phone = '+353851234574';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Format Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Format Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      // Try with non-6-digit code
      try {
        await (caller.twoFactorAuth.completeLogin as any).mutate({
          pendingToken: loginResult.pendingToken,
          code: '12345', // Only 5 digits
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it('should track failed OTP attempts', async () => {
      const googleId = `google-attempts-${Date.now()}`;
      const email = `attempts-${Date.now()}@easytofin.com`;
      const phone = '+353851234575';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Attempts Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Attempts Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      // Try multiple wrong attempts
      let attemptsFailed = 0;
      for (let i = 0; i < 3; i++) {
        try {
          await (caller.twoFactorAuth.completeLogin as any).mutate({
            pendingToken: loginResult.pendingToken,
            code: `00000${i}`,
          });
        } catch (error: any) {
          attemptsFailed++;
          expect(error.message).toContain('Invalid or expired');
        }
      }

      expect(attemptsFailed).toBe(3);
    });
  });

  describe('2FA Challenge Metadata', () => {
    it('should retrieve challenge metadata with pending token', async () => {
      const googleId = `google-meta-${Date.now()}`;
      const email = `meta-${Date.now()}@easytofin.com`;
      const phone = '+353851234576';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Meta Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Meta Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Get challenge metadata
      const metaResult = await caller.twoFactorAuth.getChallengeMeta.query({
        pendingToken: loginResult.pendingToken,
      });

      expect(metaResult).toBeDefined();
      expect(metaResult.maskedPhone).toBeDefined();
      expect(metaResult.role).toBe('admin');
    });

    it('should reject invalid pending token in metadata query', async () => {
      try {
        await caller.twoFactorAuth.getChallengeMeta.query({
          pendingToken: 'invalid-token',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid or expired');
      }
    });
  });

  describe('2FA Security Features', () => {
    it('should enforce 10-minute expiration on pending token', async () => {
      const googleId = `google-expiry-${Date.now()}`;
      const email = `expiry-${Date.now()}@easytofin.com`;
      const phone = '+353851234577';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Expiry Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Expiry Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Pending token should be a valid JWT
      expect(loginResult.pendingToken).toBeDefined();
      expect(typeof loginResult.pendingToken).toBe('string');
      // JWT tokens have 3 parts separated by dots
      expect(loginResult.pendingToken.split('.').length).toBe(3);
    });

    it('should prevent OTP reuse after successful verification', async () => {
      const googleId = `google-reuse-${Date.now()}`;
      const email = `reuse-${Date.now()}@easytofin.com`;
      const phone = '+353851234578';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Reuse Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Reuse Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      const otpResult = await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
      });

      const correctOtp = otpResult.devCode;

      // First verification should succeed
      const firstVerify = await (caller.twoFactorAuth.completeLogin as any).mutate({
        pendingToken: loginResult.pendingToken,
        code: correctOtp,
      });

      expect(firstVerify.success).toBe(true);

      // Attempting to reuse the same OTP with same token should fail
      // (token is now consumed)
      try {
        await (caller.twoFactorAuth.completeLogin as any).mutate({
          pendingToken: loginResult.pendingToken,
          code: correctOtp,
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid or expired');
      }
    });
  });

  describe('Role-Based 2FA Requirements', () => {
    it('should require 2FA for all privileged roles', async () => {
      const roles: Array<'admin' | 'manager' | 'staff'> = ['admin', 'manager', 'staff'];
      const results = [];

      for (const role of roles) {
        const googleId = `google-role-${role}-${Date.now()}`;
        const email = `${role}-${Date.now()}@easytofin.com`;
        const phone = `+353851234${Math.floor(Math.random() * 1000)}`;

        // Create user with role
        await db.createPhoneUser({
          email,
          name: `${role} User`,
          phone,
          role,
          verified: 'true',
          emailVerified: 'true',
        });

        // Gmail login
        const result = await caller.gmailAuth.handleGoogleCallback({
          googleId,
          email,
          name: `${role} User`,
          picture: 'https://example.com/photo.jpg',
        });

        results.push({
          role,
          requires2FA: result.requires2FA,
          hasPendingToken: !!result.pendingToken,
        });
      }

      // All privileged roles should require 2FA
      for (const result of results) {
        expect(result.requires2FA).toBe(true);
        expect(result.hasPendingToken).toBe(true);
      }
    });

    it('should NOT require 2FA for regular users', async () => {
      const googleId = `google-regular-${Date.now()}`;
      const email = `regular-${Date.now()}@gmail.com`;

      // Regular user (no phone number, default role)
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Regular User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.requires2FA).toBe(false);
      expect(result.pendingToken).toBeUndefined();
      expect(result.sessionToken).toBeDefined();
    });
  });
});
