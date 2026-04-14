import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';
import * as db from '../db';

/**
 * Core Two-Factor Authentication Tests
 * 
 * Validates the essential 2FA flow for admin/manager roles:
 * - 2FA requirement detection for privileged roles
 * - Pending token generation and validation
 * - OTP request and verification
 * - Session creation after successful 2FA
 */

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

describe('Two-Factor Authentication Core Flow', () => {
  let caller: any;

  beforeEach(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('2FA Requirement Detection', () => {
    it('should require 2FA for admin user on Gmail login', async () => {
      const googleId = `google-admin-${Date.now()}`;
      const email = `admin-${Date.now()}@easytofin.com`;
      const phone = '+353851234567';

      // Create an admin user
      const phoneUser = await db.createPhoneUser({
        email,
        name: 'Admin User',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      expect(phoneUser.role).toBe('admin');

      // Gmail login should trigger 2FA
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Admin User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.requires2FA).toBe(true);
      expect(result.pendingToken).toBeDefined();
      expect(result.message).toContain('Phone 2FA required');
      expect(result.loginMethod).toBe('google');
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
      await db.createPhoneUser({
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

  describe('Pending Token Management', () => {
    it('should issue valid JWT pending token for 2FA', async () => {
      const googleId = `google-token-${Date.now()}`;
      const email = `token-${Date.now()}@easytofin.com`;
      const phone = '+353851234568';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'Token Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const result = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'Token Test',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.requires2FA).toBe(true);
      const pendingToken = result.pendingToken;

      // Verify it's a valid JWT (3 parts separated by dots)
      expect(pendingToken).toBeDefined();
      expect(typeof pendingToken).toBe('string');
      expect(pendingToken.split('.').length).toBe(3);
    });

    it('should retrieve challenge metadata with valid pending token', async () => {
      const googleId = `google-meta-${Date.now()}`;
      const email = `meta-${Date.now()}@easytofin.com`;
      const phone = '+353851234569';

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
      // Phone should be masked
      expect(metaResult.maskedPhone).not.toContain(phone);
      expect(metaResult.maskedPhone).toMatch(/\*/);
    });

    it('should reject invalid pending token', async () => {
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

  describe('OTP Request Flow', () => {
    it('should send OTP with valid pending token', async () => {
      const googleId = `google-otp-${Date.now()}`;
      const email = `otp-${Date.now()}@easytofin.com`;
      const phone = '+353851234570';

      // Create admin user
      await db.createPhoneUser({
        email,
        name: 'OTP Test',
        phone,
        role: 'admin',
        verified: 'true',
        emailVerified: 'true',
      });

      // Gmail login
      const loginResult = await caller.gmailAuth.handleGoogleCallback({
        googleId,
        email,
        name: 'OTP Test',
        picture: 'https://example.com/photo.jpg',
      });

      // Request OTP
      const otpResult = await (caller.twoFactorAuth.requestPhoneOtp as any).mutate({
        pendingToken: loginResult.pendingToken,
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
  });

  describe('OTP Verification Flow', () => {
    it('should complete login with valid OTP code', async () => {
      const googleId = `google-verify-${Date.now()}`;
      const email = `verify-${Date.now()}@easytofin.com`;
      const phone = '+353851234571';

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
      expect(verifyResult.user.email).toBe(email);
    });

    it('should reject invalid OTP code', async () => {
      const googleId = `google-invalid-${Date.now()}`;
      const email = `invalid-${Date.now()}@easytofin.com`;
      const phone = '+353851234572';

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
      const phone = '+353851234573';

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
  });

  describe('Security Features', () => {
    it('should prevent OTP reuse after successful verification', async () => {
      const googleId = `google-reuse-${Date.now()}`;
      const email = `reuse-${Date.now()}@easytofin.com`;
      const phone = '+353851234574';

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
});
