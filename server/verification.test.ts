import { describe, it, expect, vi, beforeAll } from 'vitest';
import { sendEmailVerification, verifyEmailCode } from './verification';

describe('Verification Services', () => {
  describe('Email Verification', () => {
    it('should generate a valid 6-digit code', async () => {
      const result = await sendEmailVerification('test@example.com');
      
      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code).toMatch(/^\d{6}$/);
    });

    it('should verify correct email code', () => {
      const code = '123456';
      const result = verifyEmailCode('123456', code);
      
      expect(result).toBe(true);
    });

    it('should reject incorrect email code', () => {
      const result = verifyEmailCode('123456', '654321');
      
      expect(result).toBe(false);
    });

    it('should handle email sending errors gracefully', async () => {
      // Test with invalid email to trigger error
      const result = await sendEmailVerification('invalid-email');
      
      // Should still return a code even if email fails (for testing)
      // In production, you might want to handle this differently
      expect(result.code).toBeDefined();
    });
  });
});
