import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Smartphone, AlertCircle } from "lucide-react";
import { useState } from "react";
import TrustedDeviceCard, { TrustedDevice } from "./TrustedDeviceCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeviceManagementModalProps {
  devices: TrustedDevice[];
  isLoading?: boolean;
  onRemoveDevice?: (deviceId: number) => Promise<void>;
  trigger?: React.ReactNode;
}

/**
 * DeviceManagementModal Component
 *
 * Modal dialog for managing all trusted devices.
 * Allows users to view, monitor, and revoke device access.
 *
 * Features:
 * - List all trusted devices
 * - Remove individual devices
 * - Current device indicator
 * - Loading states
 * - Empty state handling
 * - Responsive scrollable list
 */
export function DeviceManagementModal({
  devices,
  isLoading = false,
  onRemoveDevice,
  trigger,
}: DeviceManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveDevice = async (deviceId: number) => {
    if (!onRemoveDevice) return;

    try {
      setRemovingDeviceId(deviceId);
      setError(null);
      await onRemoveDevice(deviceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove device");
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const currentDevice = devices.find((d) => d.isCurrentDevice);
  const otherDevices = devices.filter((d) => !d.isCurrentDevice);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm">
            <Smartphone className="h-4 w-4 mr-2" />
            Manage Devices
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trusted Devices</DialogTitle>
          <DialogDescription>
            Manage devices that have access to your account. Remove any devices you don't recognize.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No trusted devices yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check "Remember this device" during login to add a device.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
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
                  <div className="space-y-3">
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
            </div>
          </ScrollArea>
        )}

        {/* Footer Info */}
        {devices.length > 0 && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              <strong>Security Tip:</strong> Regularly review your trusted devices and remove any
              you don't recognize. You can always add a device again by checking "Remember this
              device" during login.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DeviceManagementModal;
