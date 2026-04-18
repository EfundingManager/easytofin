import { useEffect, useState } from 'react';
import { Smartphone, Laptop, Trash2, Edit2, Plus, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';


interface Device {
  id: number;
  deviceName: string;
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
  lastUsedAt: Date;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Component to manage trusted devices for a user
 */
export function TrustedDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // tRPC mutations and queries
  const getTrustedDevicesQuery = trpc.deviceTrust.getTrustedDevices.useQuery();
  const getDeviceCountQuery = trpc.deviceTrust.getDeviceCount.useQuery();
  const addDeviceMutation = trpc.deviceTrust.addCurrentDevice.useMutation();
  const removeDeviceMutation = trpc.deviceTrust.removeDevice.useMutation();
  const updateDeviceNameMutation = trpc.deviceTrust.updateDeviceName.useMutation();
  const removeAllDevicesMutation = trpc.deviceTrust.removeAllDevices.useMutation();

  // Load devices on mount
  useEffect(() => {
    if (getTrustedDevicesQuery.data?.devices) {
      setDevices(getTrustedDevicesQuery.data.devices);
      setIsLoading(false);
    }

    if (getDeviceCountQuery.data) {
      setDeviceCount(getDeviceCountQuery.data.count);
      setHasReachedLimit(getDeviceCountQuery.data.hasReachedLimit);
    }
  }, [getTrustedDevicesQuery.data, getDeviceCountQuery.data]);

  const handleAddDevice = async () => {
    try {
      setIsLoading(true);
      const result = await addDeviceMutation.mutateAsync({
        userAgent: navigator.userAgent,
        ipAddress: undefined, // IP will be captured on server
        customName: undefined, // Use auto-detected name
      });

      alert(result.message);

      setShowAddDialog(false);
      // Refetch devices
      getTrustedDevicesQuery.refetch();
      getDeviceCountQuery.refetch();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to add device'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to remove this device? You will need to verify again on next login.')) {
      return;
    }

    try {
      setIsLoading(true);
      await removeDeviceMutation.mutateAsync({ deviceId });

      alert('Device removed successfully');

      // Refetch devices
      getTrustedDevicesQuery.refetch();
      getDeviceCountQuery.refetch();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to remove device'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setNewDeviceName(device.deviceName);
    setShowEditDialog(true);
  };

  const handleUpdateDeviceName = async () => {
    if (!editingDevice || !newDeviceName.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await updateDeviceNameMutation.mutateAsync({
        deviceId: editingDevice.id,
        newName: newDeviceName,
      });

      alert('Device name updated successfully');

      setShowEditDialog(false);
      setEditingDevice(null);
      setNewDeviceName('');
      // Refetch devices
      getTrustedDevicesQuery.refetch();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to update device name'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllDevices = async () => {
    if (
      !confirm(
        'Are you sure you want to remove ALL trusted devices? You will need to verify on all future logins.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await removeAllDevicesMutation.mutateAsync();

      alert('All devices removed successfully');

      // Refetch devices
      getTrustedDevicesQuery.refetch();
      getDeviceCountQuery.refetch();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to remove all devices'));
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes('mobile') || deviceName.toLowerCase().includes('iphone') || deviceName.toLowerCase().includes('android')) {
      return <Smartphone className="h-5 w-5 text-blue-600" />;
    }
    return <Laptop className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(date);
  };

  if (isLoading && devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>Loading your trusted devices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trusted Devices</CardTitle>
              <CardDescription>
                Manage devices that don't require two-factor authentication
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={hasReachedLimit || isLoading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add This Device
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Device Limit Alert */}
      {hasReachedLimit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum number of trusted devices (10). Remove an old device to add a new one.
          </AlertDescription>
        </Alert>
      )}

      {/* Device List */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No trusted devices yet</p>
              <Button onClick={() => setShowAddDialog(true)}>Add Your First Device</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getDeviceIcon(device.deviceName)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{device.deviceName}</h3>
                        {device.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        <div>Last used: {formatRelativeTime(device.lastUsedAt)}</div>
                        {device.ipAddress && <div>IP: {device.ipAddress}</div>}
                        <div>Added: {formatDate(device.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDevice(device)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Device Count and Actions */}
      {devices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {deviceCount} of 10 trusted devices
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveAllDevices}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                Remove All Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">How Trusted Devices Work</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Trusted devices skip two-factor authentication on login</li>
            <li>• Your device is identified by its browser and IP address</li>
            <li>• You can manage up to 10 trusted devices</li>
            <li>• Remove a device if you no longer use it or if it's compromised</li>
            <li>• Inactive devices are automatically cleaned up after 90 days</li>
          </ul>
        </CardContent>
      </Card>

      {/* Add Device Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add This Device as Trusted</DialogTitle>
            <DialogDescription>
              This device will skip two-factor authentication on future logins
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Device Details:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Browser: {navigator.userAgent.substring(0, 50)}...</div>
                <div>Device will be identified by its browser and IP address</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddDevice}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Device'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Name Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device Name</DialogTitle>
            <DialogDescription>
              Give your device a memorable name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="e.g., My Work Laptop"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingDevice(null);
                  setNewDeviceName('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDeviceName}
                disabled={isLoading || !newDeviceName.trim()}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TrustedDevices;
