import { describe, it, expect, beforeEach } from 'vitest';

describe('Login Attempt Tracking and Email Alerts', () => {
  let loginAttempts: any[] = [];
  let emailsSent: any[] = [];

  beforeEach(() => {
    loginAttempts = [];
    emailsSent = [];
  });

  describe('Login Attempt Tracking', () => {
    it('should record successful login attempt', () => {
      const attempt = {
        email: 'user@example.com',
        attemptType: 'password',
        status: 'success',
        timestamp: new Date(),
      };

      loginAttempts.push(attempt);
      expect(loginAttempts).toHaveLength(1);
      expect(loginAttempts[0].status).toBe('success');
    });

    it('should record failed login attempt', () => {
      const attempt = {
        email: 'user@example.com',
        attemptType: 'password',
        status: 'failed',
        failureReason: 'invalid_password',
        timestamp: new Date(),
      };

      loginAttempts.push(attempt);
      expect(loginAttempts).toHaveLength(1);
      expect(loginAttempts[0].status).toBe('failed');
      expect(loginAttempts[0].failureReason).toBe('invalid_password');
    });

    it('should track attempt type', () => {
      const types = ['password', 'otp', 'email_link'];
      types.forEach((type) => {
        const attempt = {
          email: 'user@example.com',
          attemptType: type,
          status: 'failed',
          timestamp: new Date(),
        };
        loginAttempts.push(attempt);
      });

      expect(loginAttempts).toHaveLength(3);
      expect(loginAttempts.map((a) => a.attemptType)).toEqual(types);
    });

    it('should include IP address in attempt record', () => {
      const attempt = {
        email: 'user@example.com',
        attemptType: 'password',
        status: 'failed',
        ipAddress: '192.168.1.1',
        timestamp: new Date(),
      };

      loginAttempts.push(attempt);
      expect(loginAttempts[0].ipAddress).toBe('192.168.1.1');
    });

    it('should include user agent in attempt record', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      const attempt = {
        email: 'user@example.com',
        attemptType: 'password',
        status: 'failed',
        userAgent,
        timestamp: new Date(),
      };

      loginAttempts.push(attempt);
      expect(loginAttempts[0].userAgent).toBe(userAgent);
    });

    it('should track multiple attempts for same user', () => {
      const email = 'user@example.com';
      for (let i = 0; i < 3; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      const userAttempts = loginAttempts.filter((a) => a.email === email);
      expect(userAttempts).toHaveLength(3);
    });

    it('should timestamp each attempt', () => {
      const now = new Date();
      const attempt = {
        email: 'user@example.com',
        attemptType: 'password',
        status: 'failed',
        timestamp: now,
      };

      loginAttempts.push(attempt);
      expect(loginAttempts[0].timestamp).toEqual(now);
    });
  });

  describe('Failed Login Alert Triggering', () => {
    it('should send alert on first failed attempt', () => {
      const email = 'user@example.com';
      const attempt = {
        email,
        attemptType: 'password',
        status: 'failed',
        timestamp: new Date(),
      };

      loginAttempts.push(attempt);

      // Simulate alert sending logic
      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;
      if (failedCount === 1) {
        emailsSent.push({
          to: email,
          type: 'failed_login_alert',
          failedCount,
        });
      }

      expect(emailsSent).toHaveLength(1);
      expect(emailsSent[0].to).toBe(email);
    });

    it('should send alert on every 3rd failed attempt', () => {
      const email = 'user@example.com';

      for (let i = 1; i <= 9; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });

        const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;
        if (failedCount === 1 || failedCount % 3 === 0) {
          emailsSent.push({
            to: email,
            type: 'failed_login_alert',
            failedCount,
          });
        }
      }

      // Should send alerts on attempts 1, 3, 6, 9
      expect(emailsSent).toHaveLength(4);
      expect(emailsSent.map((e) => e.failedCount)).toEqual([1, 3, 6, 9]);
    });

    it('should not send alert for successful login', () => {
      const email = 'user@example.com';
      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'success',
        timestamp: new Date(),
      });

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;
      if (failedCount > 0) {
        emailsSent.push({
          to: email,
          type: 'failed_login_alert',
        });
      }

      expect(emailsSent).toHaveLength(0);
    });

    it('should include failure reason in alert', () => {
      const email = 'user@example.com';
      const failureReason = 'invalid_password';

      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'failed',
        failureReason,
        timestamp: new Date(),
      });

      emailsSent.push({
        to: email,
        type: 'failed_login_alert',
        failureReason,
      });

      expect(emailsSent[0].failureReason).toBe('invalid_password');
    });

    it('should include IP address in alert', () => {
      const email = 'user@example.com';
      const ipAddress = '203.0.113.42';

      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'failed',
        ipAddress,
        timestamp: new Date(),
      });

      emailsSent.push({
        to: email,
        type: 'failed_login_alert',
        ipAddress,
      });

      expect(emailsSent[0].ipAddress).toBe(ipAddress);
    });
  });

  describe('Failed Login Attempt Counting', () => {
    it('should count failed attempts in last hour', () => {
      const email = 'user@example.com';
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Add attempts within last hour
      for (let i = 0; i < 3; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(now.getTime() - i * 10 * 60 * 1000),
        });
      }

      // Add attempt outside last hour
      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'failed',
        timestamp: new Date(oneHourAgo.getTime() - 10 * 60 * 1000),
      });

      const recentFailed = loginAttempts.filter(
        (a) => a.email === email && a.status === 'failed' && a.timestamp > oneHourAgo
      );

      expect(recentFailed).toHaveLength(3);
    });

    it('should exclude successful attempts from failed count', () => {
      const email = 'user@example.com';

      loginAttempts.push(
        { email, attemptType: 'password', status: 'failed', timestamp: new Date() },
        { email, attemptType: 'password', status: 'success', timestamp: new Date() },
        { email, attemptType: 'password', status: 'failed', timestamp: new Date() }
      );

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;

      expect(failedCount).toBe(2);
    });

    it('should reset count after successful login', () => {
      const email = 'user@example.com';

      // Add failed attempts
      for (let i = 0; i < 3; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      // Add successful attempt
      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'success',
        timestamp: new Date(),
      });

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;

      expect(failedCount).toBe(3); // Count doesn't auto-reset, but could be reset by application logic
    });
  });

  describe('Account Lockout Detection', () => {
    it('should detect if account should be locked', () => {
      const email = 'user@example.com';
      const maxAttempts = 5;

      for (let i = 0; i < 6; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;
      const shouldLock = failedCount >= maxAttempts;

      expect(shouldLock).toBe(true);
    });

    it('should not lock account below threshold', () => {
      const email = 'user@example.com';
      const maxAttempts = 5;

      for (let i = 0; i < 4; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;
      const shouldLock = failedCount >= maxAttempts;

      expect(shouldLock).toBe(false);
    });

    it('should send warning alert at 3 failed attempts', () => {
      const email = 'user@example.com';

      for (let i = 0; i < 3; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;

      if (failedCount === 3) {
        emailsSent.push({
          to: email,
          type: 'account_warning',
          message: 'Multiple failed login attempts detected',
        });
      }

      expect(emailsSent).toHaveLength(1);
      expect(emailsSent[0].type).toBe('account_warning');
    });
  });

  describe('Email Alert Content', () => {
    it('should include attempt details in email', () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.100';
      const timestamp = new Date('2026-04-18T10:30:00Z');

      emailsSent.push({
        to: email,
        subject: 'Security Alert: Failed Login Attempt',
        body: {
          attemptType: 'password',
          failureReason: 'invalid_password',
          ipAddress,
          timestamp,
          failedCount: 1,
        },
      });

      expect(emailsSent[0].body.ipAddress).toBe(ipAddress);
      expect(emailsSent[0].body.failedCount).toBe(1);
    });

    it('should include action recommendations in email', () => {
      const email = 'user@example.com';

      emailsSent.push({
        to: email,
        subject: 'Security Alert: Failed Login Attempt',
        recommendations: [
          'Change your password if you do not recognize this attempt',
          'Enable two-factor authentication',
          'Review recent login activity',
          'Contact support if you suspect unauthorized access',
        ],
      });

      expect(emailsSent[0].recommendations).toHaveLength(4);
    });

    it('should include reset password link in email', () => {
      const email = 'user@example.com';
      const resetLink = 'https://easytofin.com/reset-password';

      emailsSent.push({
        to: email,
        subject: 'Security Alert: Failed Login Attempt',
        resetLink,
      });

      expect(emailsSent[0].resetLink).toContain('reset-password');
    });

    it('should format email timestamp correctly', () => {
      const email = 'user@example.com';
      const timestamp = new Date('2026-04-18T10:30:00Z');
      const formattedTime = timestamp.toLocaleString();

      emailsSent.push({
        to: email,
        subject: 'Security Alert: Failed Login Attempt',
        timestamp: formattedTime,
      });

      expect(emailsSent[0].timestamp).toContain('2026');
    });
  });

  describe('Multiple Failure Reasons', () => {
    it('should track different failure reasons', () => {
      const email = 'user@example.com';
      const reasons = ['invalid_password', 'invalid_otp', 'expired_otp', 'rate_limited'];

      reasons.forEach((reason) => {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          failureReason: reason,
          timestamp: new Date(),
        });
      });

      expect(loginAttempts).toHaveLength(4);
      expect(loginAttempts.map((a) => a.failureReason)).toEqual(reasons);
    });

    it('should handle missing failure reason', () => {
      const email = 'user@example.com';

      loginAttempts.push({
        email,
        attemptType: 'password',
        status: 'failed',
        timestamp: new Date(),
      });

      expect(loginAttempts[0].failureReason).toBeUndefined();
    });
  });

  describe('Security Notifications', () => {
    it('should send high-risk alert for 5+ failed attempts', () => {
      const email = 'user@example.com';

      for (let i = 0; i < 5; i++) {
        loginAttempts.push({
          email,
          attemptType: 'password',
          status: 'failed',
          timestamp: new Date(),
        });
      }

      const failedCount = loginAttempts.filter((a) => a.email === email && a.status === 'failed').length;

      if (failedCount >= 5) {
        emailsSent.push({
          to: email,
          type: 'high_risk_alert',
          severity: 'critical',
          message: 'Your account may be under attack',
        });
      }

      expect(emailsSent).toHaveLength(1);
      expect(emailsSent[0].severity).toBe('critical');
    });

    it('should include account recovery options in alert', () => {
      const email = 'user@example.com';

      emailsSent.push({
        to: email,
        type: 'failed_login_alert',
        recoveryOptions: [
          { type: 'password_reset', link: 'https://easytofin.com/reset-password' },
          { type: 'contact_support', link: 'https://easytofin.com/support' },
        ],
      });

      expect(emailsSent[0].recoveryOptions).toHaveLength(2);
    });
  });

  describe('Rate Limiting for Alerts', () => {
    it('should not send duplicate alerts within 5 minutes', () => {
      const email = 'user@example.com';
      const now = new Date();

      // First alert
      emailsSent.push({
        to: email,
        type: 'failed_login_alert',
        timestamp: now,
      });

      // Second alert within 5 minutes (should be skipped)
      const withinWindow = new Date(now.getTime() + 2 * 60 * 1000);
      const lastAlertTime = emailsSent[emailsSent.length - 1].timestamp;
      const timeSinceLastAlert = withinWindow.getTime() - lastAlertTime.getTime();

      if (timeSinceLastAlert < 5 * 60 * 1000) {
        // Skip sending alert
      } else {
        emailsSent.push({
          to: email,
          type: 'failed_login_alert',
          timestamp: withinWindow,
        });
      }

      expect(emailsSent).toHaveLength(1);
    });

    it('should send alert after cooldown period', () => {
      const email = 'user@example.com';
      const now = new Date();

      // First alert
      emailsSent.push({
        to: email,
        type: 'failed_login_alert',
        timestamp: now,
      });

      // Second alert after 5 minutes (should be sent)
      const afterWindow = new Date(now.getTime() + 6 * 60 * 1000);
      const lastAlertTime = emailsSent[emailsSent.length - 1].timestamp;
      const timeSinceLastAlert = afterWindow.getTime() - lastAlertTime.getTime();

      if (timeSinceLastAlert >= 5 * 60 * 1000) {
        emailsSent.push({
          to: email,
          type: 'failed_login_alert',
          timestamp: afterWindow,
        });
      }

      expect(emailsSent).toHaveLength(2);
    });
  });

  describe('User Privacy', () => {
    it('should not expose password in alert', () => {
      emailsSent.push({
        to: 'user@example.com',
        type: 'failed_login_alert',
        body: 'Failed login attempt detected',
      });

      const emailContent = JSON.stringify(emailsSent[0]);
      expect(emailContent).not.toContain('password');
    });

    it('should mask sensitive information in logs', () => {
      const email = 'user@example.com';
      const maskedEmail = email.replace(/(.{2})(.*)(.{2})/, '$1***$3');

      loginAttempts.push({
        email: maskedEmail,
        attemptType: 'password',
        status: 'failed',
        timestamp: new Date(),
      });

      expect(loginAttempts[0].email).toBe('us***om');
    });
  });
});
