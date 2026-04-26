/**
 * Device-Based Login Flow Component
 * Shows "Continue as [user]" for returning users on trusted devices
 * Implements one-click login without OTP verification
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, LogOut, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export interface RecentUser {
  phoneUserId: number;
  email?: string;
  phone?: string;
  name: string;
  lastUsedAt: Date;
}

interface DeviceLoginFlowProps {
  deviceFingerprint: string;
  onUserSelected: (phoneUserId: number) => Promise<void>;
  onLoginWithDifferentAccount: () => void;
  isLoading?: boolean;
}

/**
 * Main device login flow component
 * Shows recent users and allows one-click login
 */
export function DeviceLoginFlow({
  deviceFingerprint,
  onUserSelected,
  onLoginWithDifferentAccount,
  isLoading = false,
}: DeviceLoginFlowProps) {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const getRecentUsersMutation = trpc.deviceLogin.getRecentUsers.useQuery(
    { deviceFingerprint },
    { enabled: !!deviceFingerprint }
  );

  const verifyDeviceLoginMutation = trpc.deviceLogin.verifyDeviceLogin.useMutation();

  useEffect(() => {
    if (getRecentUsersMutation.data?.users) {
      setRecentUsers(getRecentUsersMutation.data.users);
    }
  }, [getRecentUsersMutation.data]);

  const handleContinueAsUser = async (phoneUserId: number) => {
    setSelectedUserId(phoneUserId);
    setIsVerifying(true);

    try {
      const result = await verifyDeviceLoginMutation.mutateAsync({
        phoneUserId,
        deviceFingerprint,
      });

      if (result.success) {
        await onUserSelected(phoneUserId);
      }
    } catch (error) {
      console.error('Device login verification failed:', error);
      // Fall back to OTP login
    } finally {
      setIsVerifying(false);
      setSelectedUserId(null);
    }
  };

  if (getRecentUsersMutation.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No recent users - show login form
  if (!recentUsers || recentUsers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>We recognized this device. Continue as one of these users:</span>
      </div>

      <div className="space-y-2">
        {recentUsers.map((user) => (
          <Button
            key={user.phoneUserId}
            variant="outline"
            className="w-full justify-start h-auto py-3 px-4"
            onClick={() => handleContinueAsUser(user.phoneUserId)}
            disabled={isLoading || isVerifying || selectedUserId === user.phoneUserId}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">{user.name || 'User'}</span>
              <span className="text-xs text-muted-foreground">
                {user.email || user.phone || 'No contact info'}
              </span>
            </div>
            {selectedUserId === user.phoneUserId && isVerifying && (
              <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={onLoginWithDifferentAccount}
        disabled={isLoading || isVerifying}
      >
        <Plus className="h-4 w-4 mr-2" />
        Login with different account
      </Button>
    </div>
  );
}

/**
 * Device Management Component
 * Shows list of trusted devices and allows removal
 */
interface DeviceManagementProps {
  onDeviceRemoved?: () => void;
}

export function DeviceManagement({ onDeviceRemoved }: DeviceManagementProps) {
  const devicesQuery = trpc.deviceLogin.getUserDevices.useQuery();
  const removeDeviceMutation = trpc.deviceLogin.removeDevice.useMutation();
  const logoutAllMutation = trpc.deviceLogin.logoutAllDevices.useMutation();

  const handleRemoveDevice = async (deviceId: number) => {
    try {
      await removeDeviceMutation.mutateAsync({ deviceId });
      devicesQuery.refetch();
      onDeviceRemoved?.();
    } catch (error) {
      console.error('Failed to remove device:', error);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync();
      devicesQuery.refetch();
    } catch (error) {
      console.error('Failed to logout from all devices:', error);
    }
  };

  if (devicesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const devices = devicesQuery.data?.devices || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Trusted Devices</h3>
        {devices.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogoutAll}
            disabled={logoutAllMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout all
          </Button>
        )}
      </div>

      {devices.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No trusted devices yet. Devices will appear here after you verify OTP and choose to trust them.
        </p>
      ) : (
        <div className="space-y-2">
          {devices.map((device: any) => (
            <Card key={device.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{device.deviceName}</p>
                  <p className="text-xs text-muted-foreground">
                    Last used: {new Date(device.lastUsedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDevice(device.id)}
                  disabled={removeDeviceMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Trust Device Checkbox Component
 * Shown during OTP verification to allow users to trust the device
 */
interface TrustDeviceCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function TrustDeviceCheckbox({
  checked,
  onChange,
  disabled = false,
}: TrustDeviceCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="trust-device"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="rounded border-gray-300"
      />
      <label htmlFor="trust-device" className="text-sm text-muted-foreground cursor-pointer">
        Trust this device for 1 hour
      </label>
    </div>
  );
}
