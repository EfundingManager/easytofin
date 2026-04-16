import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Smartphone, AlertTriangle } from "lucide-react";
import TrustedDeviceCard, { TrustedDevice } from "./TrustedDeviceCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeviceListProps {
  devices: TrustedDevice[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onRemoveDevice?: (deviceId: number) => Promise<void>;
  maxDevices?: number;
  showWarning?: boolean;
}

/**
 * DeviceList Component
 *
 * Displays a list of trusted devices in a dashboard-friendly format.
 * Can be embedded in user settings or account management pages.
 *
 * Features:
 * - Responsive grid layout
 * - Refresh functionality
 * - Device count display
 * - Warning for too many devices
 * - Loading states
 * - Empty state
 */
export function DeviceList({
  devices,
  isLoading = false,
  onRefresh,
  onRemoveDevice,
  maxDevices = 10,
  showWarning = true,
}: DeviceListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState<number | null>(null);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (!onRemoveDevice) return;
    try {
      setRemovingDeviceId(deviceId);
      await onRemoveDevice(deviceId);
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const hasExcessDevices = devices.length > maxDevices;
  const currentDevice = devices.find((d) => d.isCurrentDevice);
  const otherDevices = devices.filter((d) => !d.isCurrentDevice);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Trusted Devices</span>
            </CardTitle>
            <CardDescription>
              {devices.length} device{devices.length !== 1 ? "s" : ""} trusted
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning for excess devices */}
        {showWarning && hasExcessDevices && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Too Many Devices</AlertTitle>
            <AlertDescription>
              You have {devices.length} trusted devices. For security, consider removing devices
              you no longer use.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : devices.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">No trusted devices</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check "Remember this device" during login to add a device.
            </p>
          </div>
        ) : (
          /* Device List */
          <div className="space-y-4">
            {/* Current Device Section */}
            {currentDevice && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Current Device
                </h3>
                <TrustedDeviceCard
                  device={currentDevice}
                  onRemove={onRemoveDevice ? handleRemoveDevice : undefined}
                  isLoading={removingDeviceId === currentDevice.id}
                />
              </div>
            )}

            {/* Other Devices Section */}
            {otherDevices.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Other Devices ({otherDevices.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherDevices.map((device) => (
                    <TrustedDeviceCard
                      key={device.id}
                      device={device}
                      onRemove={onRemoveDevice ? handleRemoveDevice : undefined}
                      isLoading={removingDeviceId === device.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Security Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                🔒 Security Tips:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Review your devices regularly</li>
                <li>• Remove devices you no longer use</li>
                <li>• Be cautious of unfamiliar devices</li>
                <li>• Change your password if you see unexpected devices</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DeviceList;
