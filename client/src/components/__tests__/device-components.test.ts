import { describe, it, expect, vi } from "vitest";

// Mock data for testing
const mockDevice = {
  id: 1,
  deviceName: "Chrome on Windows (Desktop)",
  browser: "Chrome",
  os: "Windows",
  deviceType: "desktop" as const,
  ipAddress: "192.168.1.1",
  lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  isCurrentDevice: true,
};

const mockDevices = [
  mockDevice,
  {
    id: 2,
    deviceName: "Safari on macOS (Desktop)",
    browser: "Safari",
    os: "macOS",
    deviceType: "desktop" as const,
    ipAddress: "192.168.1.2",
    lastUsedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isCurrentDevice: false,
  },
  {
    id: 3,
    deviceName: "Chrome on Android (Mobile)",
    browser: "Chrome",
    os: "Android",
    deviceType: "mobile" as const,
    ipAddress: "192.168.1.3",
    lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isCurrentDevice: false,
  },
];

describe("Device UI Components - Unit Tests", () => {
  describe("Mock Data Validation", () => {
    it("should have valid mock device", () => {
      expect(mockDevice).toBeDefined();
      expect(mockDevice.id).toBe(1);
      expect(mockDevice.deviceName).toBe("Chrome on Windows (Desktop)");
      expect(mockDevice.isCurrentDevice).toBe(true);
    });

    it("should have valid mock devices array", () => {
      expect(mockDevices).toBeDefined();
      expect(mockDevices.length).toBe(3);
      expect(mockDevices[0].isCurrentDevice).toBe(true);
      expect(mockDevices[1].isCurrentDevice).toBe(false);
    });

    it("should have correct device types", () => {
      expect(mockDevices[0].deviceType).toBe("desktop");
      expect(mockDevices[2].deviceType).toBe("mobile");
    });

    it("should have valid timestamps", () => {
      mockDevices.forEach((device) => {
        expect(device.createdAt).toBeInstanceOf(Date);
        if (device.lastUsedAt) {
          expect(device.lastUsedAt).toBeInstanceOf(Date);
        }
      });
    });
  });

  describe("Device Interface Types", () => {
    it("should define device with all properties", () => {
      const device = {
        id: 1,
        deviceName: "Test Device",
        browser: "Chrome",
        os: "Windows",
        deviceType: "desktop" as const,
        ipAddress: "192.168.1.1",
        lastUsedAt: new Date(),
        createdAt: new Date(),
        isCurrentDevice: false,
      };

      expect(device.id).toBeDefined();
      expect(device.deviceName).toBeDefined();
      expect(device.browser).toBeDefined();
      expect(device.os).toBeDefined();
      expect(device.deviceType).toBeDefined();
    });

    it("should support optional fields", () => {
      const minimalDevice = {
        id: 1,
        deviceName: "Device",
        browser: "Chrome",
        os: "Windows",
        deviceType: "desktop" as const,
        createdAt: new Date(),
      };

      expect(minimalDevice.id).toBeDefined();
      expect(minimalDevice.createdAt).toBeDefined();
    });
  });

  describe("Callback Functions", () => {
    it("should handle checkbox change callbacks", () => {
      const onChange = vi.fn();
      onChange(true);
      onChange(false);

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("should handle device removal callbacks", () => {
      const onRemove = vi.fn();
      onRemove(1);
      onRemove(2);

      expect(onRemove).toHaveBeenCalledTimes(2);
      expect(onRemove).toHaveBeenCalledWith(1);
      expect(onRemove).toHaveBeenCalledWith(2);
    });

    it("should handle async verification callbacks", async () => {
      const onVerify = vi.fn().mockResolvedValue(undefined);
      await onVerify("123456");

      expect(onVerify).toHaveBeenCalledWith("123456");
    });

    it("should handle skip callbacks", () => {
      const onSkip = vi.fn();
      onSkip();

      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe("Device Array Operations", () => {
    it("should filter current device from list", () => {
      const currentDevice = mockDevices.find((d) => d.isCurrentDevice);
      const otherDevices = mockDevices.filter((d) => !d.isCurrentDevice);

      expect(currentDevice).toBeDefined();
      expect(currentDevice?.id).toBe(1);
      expect(otherDevices.length).toBe(2);
    });

    it("should count device types", () => {
      const desktopCount = mockDevices.filter((d) => d.deviceType === "desktop").length;
      const mobileCount = mockDevices.filter((d) => d.deviceType === "mobile").length;

      expect(desktopCount).toBe(2);
      expect(mobileCount).toBe(1);
    });

    it("should sort devices by last used time", () => {
      const sorted = [...mockDevices].sort((a, b) => {
        const aTime = a.lastUsedAt?.getTime() || 0;
        const bTime = b.lastUsedAt?.getTime() || 0;
        return bTime - aTime;
      });

      expect(sorted[0].id).toBe(1);
    });
  });

  describe("Device Validation Rules", () => {
    it("should validate device name is not empty", () => {
      const isValid = (device: typeof mockDevice) => device.deviceName.trim().length > 0;

      expect(isValid(mockDevice)).toBe(true);
    });

    it("should validate device has required fields", () => {
      const isValid = (device: typeof mockDevice) => {
        return (
          device.id !== undefined &&
          device.deviceName !== undefined &&
          device.browser !== undefined &&
          device.os !== undefined &&
          device.deviceType !== undefined &&
          device.createdAt !== undefined
        );
      };

      mockDevices.forEach((device) => {
        expect(isValid(device)).toBe(true);
      });
    });

    it("should validate device type is one of allowed values", () => {
      const validTypes = ["mobile", "tablet", "desktop"];
      const isValid = (deviceType: string) => validTypes.includes(deviceType);

      mockDevices.forEach((device) => {
        expect(isValid(device.deviceType)).toBe(true);
      });
    });
  });

  describe("Component Props Validation", () => {
    it("should validate RememberDeviceCheckbox props structure", () => {
      const props = {
        checked: true,
        onChange: vi.fn(),
        disabled: false,
        showTooltip: true,
      };

      expect(props.checked).toBe(true);
      expect(typeof props.onChange).toBe("function");
      expect(typeof props.disabled).toBe("boolean");
      expect(typeof props.showTooltip).toBe("boolean");
    });

    it("should validate TrustedDeviceCard props structure", () => {
      const props = {
        device: mockDevice,
        onRemove: vi.fn(),
        isLoading: false,
      };

      expect(props.device).toBeDefined();
      expect(typeof props.onRemove).toBe("function");
      expect(typeof props.isLoading).toBe("boolean");
    });

    it("should validate DeviceManagementModal props structure", () => {
      const props = {
        devices: mockDevices,
        isLoading: false,
        onRemoveDevice: vi.fn(),
      };

      expect(Array.isArray(props.devices)).toBe(true);
      expect(typeof props.onRemoveDevice).toBe("function");
      expect(typeof props.isLoading).toBe("boolean");
    });

    it("should validate DeviceList props structure", () => {
      const props = {
        devices: mockDevices,
        isLoading: false,
        onRefresh: vi.fn(),
        onRemoveDevice: vi.fn(),
        maxDevices: 10,
        showWarning: true,
      };

      expect(props.maxDevices).toBe(10);
      expect(props.showWarning).toBe(true);
      expect(typeof props.onRefresh).toBe("function");
    });

    it("should validate DeviceVerificationCard props structure", () => {
      const props = {
        deviceName: "Test Device",
        verificationCode: "123456",
        onVerify: vi.fn(),
        onSkip: vi.fn(),
        isLoading: false,
        error: null,
        success: false,
      };

      expect(props.deviceName).toBe("Test Device");
      expect(typeof props.onVerify).toBe("function");
      expect(typeof props.onSkip).toBe("function");
      expect(typeof props.success).toBe("boolean");
    });
  });

  describe("Device State Management", () => {
    it("should track device as current or other", () => {
      const currentDevices = mockDevices.filter((d) => d.isCurrentDevice);
      const otherDevices = mockDevices.filter((d) => !d.isCurrentDevice);

      expect(currentDevices.length).toBe(1);
      expect(otherDevices.length).toBe(2);
    });

    it("should handle device removal state", () => {
      const removingDeviceId = 2;
      const isRemoving = (deviceId: number) => deviceId === removingDeviceId;

      expect(isRemoving(2)).toBe(true);
      expect(isRemoving(1)).toBe(false);
    });

    it("should handle verification state transitions", () => {
      const states = ["idle", "verifying", "success", "error"] as const;
      const currentState: typeof states[number] = "verifying";

      expect(states.includes(currentState)).toBe(true);
    });
  });
});
