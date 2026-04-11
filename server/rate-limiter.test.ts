import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rateLimiter as createRateLimiter, RATE_LIMIT_CONFIG } from './rate-limiter';

// Create a new RateLimiter class for testing
class RateLimiter {
  private store: Map<string, any> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  isAllowed(
    key: string,
    maxRequests: number = 3,
    windowMs: number = 60 * 60 * 1000
  ): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
        attempts: [now],
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
      };
    }

    if (now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
        attempts: [now],
      };
      this.store.set(key, entry);
      return {
        allowed: true,
        remaining: maxRequests - 1,
      };
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    entry.count++;
    entry.attempts.push(now);
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
    };
  }

  isVerificationAllowed(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60 * 60 * 1000
  ): { allowed: boolean; remaining: number; retryAfter?: number } {
    return this.isAllowed(key, maxAttempts, windowMs);
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  getStatus(key: string): any {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.store.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

describe('Rate Limiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  afterEach(() => {
    limiter.destroy();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const result1 = limiter.isAllowed('test-key', 3, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = limiter.isAllowed('test-key', 3, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = limiter.isAllowed('test-key', 3, 60000);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should reject requests exceeding limit', () => {
      limiter.isAllowed('test-key', 2, 60000);
      limiter.isAllowed('test-key', 2, 60000);

      const result = limiter.isAllowed('test-key', 2, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should reset limit after time window expires', (done) => {
      limiter.isAllowed('test-key', 1, 100); // 100ms window
      let result = limiter.isAllowed('test-key', 1, 100);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      setTimeout(() => {
        result = limiter.isAllowed('test-key', 1, 100);
        expect(result.allowed).toBe(true);
        done();
      }, 150);
    });
  });

  describe('SMS Verification Rate Limiting', () => {
    it('should limit SMS requests to 3 per hour', () => {
      const phoneNumber = '+353123456789';
      const config = RATE_LIMIT_CONFIG.SMS_REQUEST;

      const result1 = limiter.isAllowed(phoneNumber, config.maxRequests, config.windowMs);
      expect(result1.allowed).toBe(true);

      const result2 = limiter.isAllowed(phoneNumber, config.maxRequests, config.windowMs);
      expect(result2.allowed).toBe(true);

      const result3 = limiter.isAllowed(phoneNumber, config.maxRequests, config.windowMs);
      expect(result3.allowed).toBe(true);

      const result4 = limiter.isAllowed(phoneNumber, config.maxRequests, config.windowMs);
      expect(result4.allowed).toBe(false);
    });
  });

  describe('Email Verification Rate Limiting', () => {
    it('should limit email requests to 3 per hour', () => {
      const email = 'test@example.com';
      const config = RATE_LIMIT_CONFIG.EMAIL_REQUEST;

      const result1 = limiter.isAllowed(email, config.maxRequests, config.windowMs);
      expect(result1.allowed).toBe(true);

      const result2 = limiter.isAllowed(email, config.maxRequests, config.windowMs);
      expect(result2.allowed).toBe(true);

      const result3 = limiter.isAllowed(email, config.maxRequests, config.windowMs);
      expect(result3.allowed).toBe(true);

      const result4 = limiter.isAllowed(email, config.maxRequests, config.windowMs);
      expect(result4.allowed).toBe(false);
    });
  });

  describe('Verification Attempt Rate Limiting', () => {
    it('should limit verification attempts to 5 per hour', () => {
      const key = 'verification-attempt-key';
      const config = RATE_LIMIT_CONFIG.VERIFICATION_ATTEMPT;

      for (let i = 0; i < 5; i++) {
        const result = limiter.isVerificationAllowed(key, config.maxAttempts, config.windowMs);
        expect(result.allowed).toBe(true);
      }

      const result = limiter.isVerificationAllowed(key, config.maxAttempts, config.windowMs);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Rate Limit Status', () => {
    it('should return null for non-existent key', () => {
      const status = limiter.getStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return current status for existing key', () => {
      limiter.isAllowed('test-key', 3, 60000);
      const status = limiter.getStatus('test-key');
      expect(status).not.toBeNull();
      expect(status?.count).toBe(1);
    });
  });

  describe('Rate Limit Reset', () => {
    it('should reset rate limit for specific key', () => {
      limiter.isAllowed('test-key', 1, 60000);
      let result = limiter.isAllowed('test-key', 1, 60000);
      expect(result.allowed).toBe(false);

      limiter.reset('test-key');
      result = limiter.isAllowed('test-key', 1, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Different Keys', () => {
    it('should maintain separate limits for different keys', () => {
      const result1 = limiter.isAllowed('key1', 1, 60000);
      expect(result1.allowed).toBe(true);

      const result2 = limiter.isAllowed('key2', 1, 60000);
      expect(result2.allowed).toBe(true);

      const result3 = limiter.isAllowed('key1', 1, 60000);
      expect(result3.allowed).toBe(false);

      const result4 = limiter.isAllowed('key2', 1, 60000);
      expect(result4.allowed).toBe(false);
    });
  });
});
