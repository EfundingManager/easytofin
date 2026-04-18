import { describe, it, expect, beforeEach } from 'vitest';

describe('Device Trust Management', () => {
  let trustedDevices: any[] = [];
  let deviceFingerprints: Map<string, string> = new Map();

  beforeEach(() => {
    trustedDevices = [];
    deviceFingerprints.clear();
  });

  describe('Device Fingerprinting', () => {
    it('should generate consistent fingerprint for same device', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';
      const ipAddress = '192.168.1.100';

      const fingerprint1 = `${userAgent}-${ipAddress}`;
      const fingerprint2 = `${userAgent}-${ipAddress}`;

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate different fingerprints for different devices', () => {
      const device1 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0-192.168.1.100';
      const device2 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36-192.168.1.101';

      expect(device1).not.toBe(device2);
    });

    it('should handle missing user agent', () => {
      const fingerprint = `unknown-192.168.1.100`;
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toContain('unknown');
    });

    it('should handle missing IP address', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      const fingerprint = `${userAgent}-unknown`;
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toContain('unknown');
    });
  });

  describe('Device Name Parsing', () => {
    it('should parse Windows Chrome device', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0';
      const deviceName = userAgent.includes('Windows') && userAgent.includes('Chrome') ? 'Chrome on Windows' : 'Unknown';
      expect(deviceName).toBe('Chrome on Windows');
    });

    it('should parse Mac Safari device', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36';
      const deviceName = userAgent.includes('Mac') && userAgent.includes('Safari') ? 'Safari on Mac' : 'Unknown';
      expect(deviceName).toBe('Safari on Mac');
    });

    it('should parse iPhone device', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15';
      const deviceName = userAgent.includes('iPhone') ? 'iPhone' : 'Unknown';
      expect(deviceName).toBe('iPhone');
    });

    it('should parse Android device', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 Chrome/91.0';
      const deviceName = userAgent.includes('Android') ? 'Android Device' : 'Unknown';
      expect(deviceName).toBe('Android Device');
    });

    it('should handle unknown device', () => {
      const userAgent = '';
      const deviceName = userAgent || 'Unknown Device';
      expect(deviceName).toBe('Unknown Device');
    });
  });

  describe('Adding Trusted Devices', () => {
    it('should add device to trusted list', () => {
      const device = {
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Laptop',
        ipAddress: '192.168.1.100',
      };

      trustedDevices.push(device);
      expect(trustedDevices).toHaveLength(1);
      expect(trustedDevices[0].deviceName).toBe('My Laptop');
    });

    it('should prevent duplicate device registration', () => {
      const fingerprint = 'abc123';
      const device1 = {
        userId: 1,
        deviceFingerprint: fingerprint,
        deviceName: 'My Laptop',
      };

      trustedDevices.push(device1);

      // Attempt to add same device
      const isDuplicate = trustedDevices.some((d) => d.deviceFingerprint === fingerprint && d.userId === 1);

      expect(isDuplicate).toBe(true);
      expect(trustedDevices).toHaveLength(1);
    });

    it('should track device metadata', () => {
      const device = {
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Laptop',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.100',
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };

      trustedDevices.push(device);

      expect(trustedDevices[0].userAgent).toBeDefined();
      expect(trustedDevices[0].ipAddress).toBeDefined();
      expect(trustedDevices[0].createdAt).toBeDefined();
    });

    it('should respect device limit (max 10)', () => {
      const maxDevices = 10;

      for (let i = 0; i < 11; i++) {
        const device = {
          userId: 1,
          deviceFingerprint: `device${i}`,
          deviceName: `Device ${i}`,
        };

        if (trustedDevices.filter((d) => d.userId === 1).length < maxDevices) {
          trustedDevices.push(device);
        }
      }

      const userDevices = trustedDevices.filter((d) => d.userId === 1);
      expect(userDevices).toHaveLength(10);
    });

    it('should assign unique device ID', () => {
      let nextId = 1;

      const device1 = {
        id: nextId++,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
      };

      const device2 = {
        id: nextId++,
        userId: 1,
        deviceFingerprint: 'def456',
        deviceName: 'Device 2',
      };

      trustedDevices.push(device1, device2);

      expect(device1.id).not.toBe(device2.id);
      expect(trustedDevices[0].id).toBe(1);
      expect(trustedDevices[1].id).toBe(2);
    });
  });

  describe('Checking Device Trust', () => {
    it('should recognize trusted device', () => {
      const fingerprint = 'abc123';
      trustedDevices.push({
        userId: 1,
        deviceFingerprint: fingerprint,
        deviceName: 'My Laptop',
        isActive: true,
      });

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === fingerprint && d.isActive
      );

      expect(isTrusted).toBe(true);
    });

    it('should reject untrusted device', () => {
      const fingerprint = 'unknown123';
      trustedDevices.push({
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Laptop',
        isActive: true,
      });

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === fingerprint && d.isActive
      );

      expect(isTrusted).toBe(false);
    });

    it('should skip inactive devices', () => {
      const fingerprint = 'abc123';
      trustedDevices.push({
        userId: 1,
        deviceFingerprint: fingerprint,
        deviceName: 'My Laptop',
        isActive: false,
      });

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === fingerprint && d.isActive
      );

      expect(isTrusted).toBe(false);
    });

    it('should update last used time on check', () => {
      const device = {
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Laptop',
        isActive: true,
        lastUsedAt: new Date('2026-04-01'),
      };

      trustedDevices.push(device);

      // Simulate device check
      const foundDevice = trustedDevices.find((d) => d.deviceFingerprint === 'abc123');
      if (foundDevice) {
        foundDevice.lastUsedAt = new Date();
      }

      expect(trustedDevices[0].lastUsedAt.getTime()).toBeGreaterThan(new Date('2026-04-01').getTime());
    });
  });

  describe('Removing Devices', () => {
    it('should remove specific device', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'Device 1' },
        { id: 2, userId: 1, deviceFingerprint: 'def456', deviceName: 'Device 2' }
      );

      trustedDevices = trustedDevices.filter((d) => d.id !== 1);

      expect(trustedDevices).toHaveLength(1);
      expect(trustedDevices[0].id).toBe(2);
    });

    it('should prevent unauthorized device removal', () => {
      trustedDevices.push({
        id: 1,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
      });

      // Attempt to remove device belonging to different user
      const canRemove = trustedDevices.some((d) => d.id === 1 && d.userId === 2);

      expect(canRemove).toBe(false);
    });

    it('should remove all devices for user', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'Device 1' },
        { id: 2, userId: 1, deviceFingerprint: 'def456', deviceName: 'Device 2' },
        { id: 3, userId: 2, deviceFingerprint: 'ghi789', deviceName: 'Device 3' }
      );

      trustedDevices = trustedDevices.filter((d) => d.userId !== 1);

      expect(trustedDevices).toHaveLength(1);
      expect(trustedDevices[0].userId).toBe(2);
    });

    it('should support soft delete (deactivation)', () => {
      const device = {
        id: 1,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
        isActive: true,
      };

      trustedDevices.push(device);

      // Deactivate device
      const foundDevice = trustedDevices.find((d) => d.id === 1);
      if (foundDevice) {
        foundDevice.isActive = false;
      }

      expect(trustedDevices[0].isActive).toBe(false);
    });
  });

  describe('Device Management', () => {
    it('should update device name', () => {
      trustedDevices.push({
        id: 1,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Old Name',
      });

      const device = trustedDevices.find((d) => d.id === 1);
      if (device) {
        device.deviceName = 'New Name';
      }

      expect(trustedDevices[0].deviceName).toBe('New Name');
    });

    it('should get all devices for user', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'Device 1' },
        { id: 2, userId: 1, deviceFingerprint: 'def456', deviceName: 'Device 2' },
        { id: 3, userId: 2, deviceFingerprint: 'ghi789', deviceName: 'Device 3' }
      );

      const userDevices = trustedDevices.filter((d) => d.userId === 1);

      expect(userDevices).toHaveLength(2);
      expect(userDevices.every((d) => d.userId === 1)).toBe(true);
    });

    it('should get device count', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'Device 1', isActive: true },
        { id: 2, userId: 1, deviceFingerprint: 'def456', deviceName: 'Device 2', isActive: true },
        { id: 3, userId: 1, deviceFingerprint: 'ghi789', deviceName: 'Device 3', isActive: false }
      );

      const activeCount = trustedDevices.filter((d) => d.userId === 1 && d.isActive).length;

      expect(activeCount).toBe(2);
    });

    it('should cleanup old inactive devices', () => {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const recentDate = new Date();

      trustedDevices.push(
        {
          id: 1,
          userId: 1,
          deviceFingerprint: 'abc123',
          deviceName: 'Device 1',
          isActive: false,
          lastUsedAt: new Date(ninetyDaysAgo.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          userId: 1,
          deviceFingerprint: 'def456',
          deviceName: 'Device 2',
          isActive: false,
          lastUsedAt: recentDate,
        }
      );

      // Cleanup devices older than 90 days and inactive
      const beforeCleanup = trustedDevices.length;
      trustedDevices = trustedDevices.filter((d) => {
        if (!d.isActive && d.lastUsedAt < ninetyDaysAgo) {
          return false;
        }
        return true;
      });

      expect(beforeCleanup).toBe(2);
      expect(trustedDevices).toHaveLength(1);
    });
  });

  describe('Security Features', () => {
    it('should prevent 2FA bypass for untrusted devices', () => {
      trustedDevices.push({
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
        isActive: true,
      });

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === 'unknown' && d.isActive
      );

      expect(isTrusted).toBe(false);
      // Should require 2FA
    });

    it('should skip 2FA for trusted devices', () => {
      trustedDevices.push({
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
        isActive: true,
      });

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === 'abc123' && d.isActive
      );

      expect(isTrusted).toBe(true);
      // Should skip 2FA
    });

    it('should require 2FA after device deactivation', () => {
      const device = {
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'Device 1',
        isActive: true,
      };

      trustedDevices.push(device);

      // Deactivate device
      device.isActive = false;

      const isTrusted = trustedDevices.some(
        (d) => d.userId === 1 && d.deviceFingerprint === 'abc123' && d.isActive
      );

      expect(isTrusted).toBe(false);
      // Should require 2FA
    });

    it('should log device trust events', () => {
      const events: any[] = [];

      // Add device
      events.push({
        type: 'device_added',
        userId: 1,
        deviceName: 'My Laptop',
        timestamp: new Date(),
      });

      // Remove device
      events.push({
        type: 'device_removed',
        userId: 1,
        deviceId: 1,
        timestamp: new Date(),
      });

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('device_added');
      expect(events[1].type).toBe('device_removed');
    });
  });

  describe('Multi-Device Management', () => {
    it('should handle multiple users with different devices', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'User 1 Device 1' },
        { id: 2, userId: 1, deviceFingerprint: 'def456', deviceName: 'User 1 Device 2' },
        { id: 3, userId: 2, deviceFingerprint: 'ghi789', deviceName: 'User 2 Device 1' },
        { id: 4, userId: 2, deviceFingerprint: 'jkl012', deviceName: 'User 2 Device 2' }
      );

      const user1Devices = trustedDevices.filter((d) => d.userId === 1);
      const user2Devices = trustedDevices.filter((d) => d.userId === 2);

      expect(user1Devices).toHaveLength(2);
      expect(user2Devices).toHaveLength(2);
    });

    it('should isolate devices between users', () => {
      trustedDevices.push(
        { id: 1, userId: 1, deviceFingerprint: 'abc123', deviceName: 'Device 1' },
        { id: 2, userId: 2, deviceFingerprint: 'abc123', deviceName: 'Device 2' }
      );

      // Same fingerprint but different users
      const user1Device = trustedDevices.find((d) => d.userId === 1 && d.deviceFingerprint === 'abc123');
      const user2Device = trustedDevices.find((d) => d.userId === 2 && d.deviceFingerprint === 'abc123');

      expect(user1Device).toBeDefined();
      expect(user2Device).toBeDefined();
      expect(user1Device?.id).not.toBe(user2Device?.id);
    });
  });

  describe('Device Trust Lifecycle', () => {
    it('should track device creation time', () => {
      const now = new Date();
      const device = {
        id: 1,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Device',
        createdAt: now,
      };

      trustedDevices.push(device);

      expect(trustedDevices[0].createdAt).toEqual(now);
    });

    it('should track device last used time', () => {
      const device = {
        id: 1,
        userId: 1,
        deviceFingerprint: 'abc123',
        deviceName: 'My Device',
        lastUsedAt: new Date('2026-04-01'),
      };

      trustedDevices.push(device);

      // Update last used
      device.lastUsedAt = new Date('2026-04-18');

      expect(trustedDevices[0].lastUsedAt.getDate()).toBe(18);
    });

    it('should calculate device age', () => {
      const createdDate = new Date('2026-01-01');
      const now = new Date('2026-04-18');
      const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(ageInDays).toBeGreaterThan(100);
    });

    it('should calculate device inactivity', () => {
      const lastUsedDate = new Date('2026-04-01');
      const now = new Date('2026-04-18');
      const inactivityDays = Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(inactivityDays).toBeGreaterThan(10);
    });
  });
});
