/**
 * In-memory rate limiter for SMS and email verification
 * Tracks request counts and timestamps to enforce rate limits
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  attempts: number[];
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request is allowed based on rate limit
   * @param key Unique identifier (e.g., phone number or email)
   * @param maxRequests Maximum requests allowed
   * @param windowMs Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  isAllowed(
    key: string,
    maxRequests: number = 3,
    windowMs: number = 60 * 60 * 1000 // 1 hour default
  ): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let entry = this.store.get(key);

    // Create new entry if doesn't exist
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

    // Reset if window has expired
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

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    entry.attempts.push(now);
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
    };
  }

  /**
   * Check verification attempt limit (stricter than request limit)
   * @param key Unique identifier
   * @param maxAttempts Maximum verification attempts allowed
   * @param windowMs Time window in milliseconds
   * @returns Object with allowed status
   */
  isVerificationAllowed(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60 * 60 * 1000 // 1 hour default
  ): { allowed: boolean; remaining: number; retryAfter?: number } {
    return this.isAllowed(key, maxAttempts, windowMs);
  }

  /**
   * Reset rate limit for a specific key
   * @param key Unique identifier
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current rate limit status
   * @param key Unique identifier
   * @returns Current entry or null
   */
  getStatus(key: string): RateLimitEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Clean up expired entries
   */
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

  /**
   * Destroy the rate limiter and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  SMS_REQUEST: {
    maxRequests: 3, // 3 SMS requests per phone
    windowMs: 60 * 60 * 1000, // per hour
  },
  SMS_RESEND: {
    maxRequests: 3, // 3 resend attempts per phone
    windowMs: 60 * 1000, // per 60 seconds (cooldown period)
  },
  EMAIL_REQUEST: {
    maxRequests: 3, // 3 email requests per email
    windowMs: 60 * 60 * 1000, // per hour
  },
  EMAIL_RESEND: {
    maxRequests: 3, // 3 resend attempts per email
    windowMs: 60 * 1000, // per 60 seconds (cooldown period)
  },
  VERIFICATION_ATTEMPT: {
    maxAttempts: 5, // 5 verification attempts
    windowMs: 60 * 60 * 1000, // per hour
  },
  VERIFICATION_ATTEMPT_STRICT: {
    maxAttempts: 3, // 3 attempts per specific code
    windowMs: 10 * 60 * 1000, // per 10 minutes
  },
};
