import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, Tablet, Trash2, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface TrustedDevice {
  id: number;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: "mobile" | "tablet" | "desktop";
  ipAddress?: string;
  lastUsedAt?: Date;
  createdAt: Date;
  isCurrentDevice?: boolean;
}

interface TrustedDeviceCardProps {
  device: TrustedDevice;
  onRemove?: (deviceId: number) => void;
  isLoading?: boolean;
}

/**
 * TrustedDeviceCard Component
 *
 * Displays information about a trusted device with options to manage it.
 * Shows device type, browser, OS, and last used time.
 *
 * Features:
 * - Device type icon (laptop, smartphone, tablet)
 * - Current device indicator
 * - Last used timestamp
 * - Remove device with confirmation dialog
 * - Responsive design
 */
export function TrustedDeviceCard({
  device,
  onRemove,
  isLoading = false,
}: TrustedDeviceCardProps) {
  const getDeviceIcon = () => {
    switch (device.deviceType) {
      case "mobile":
        return <Smartphone className="h-5 w-5 text-blue-500" />;
      case "tablet":
        return <Tablet className="h-5 w-5 text-purple-500" />;
      case "desktop":
      default:
        return <Laptop className="h-5 w-5 text-slate-500" />;
    }
  };

  const getDeviceTypeLabel = () => {
    return device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1);
  };

  const lastUsedText = device.lastUsedAt
    ? formatDistanceToNow(new Date(device.lastUsedAt), { addSuffix: true })
    : "Never";

  const createdText = formatDistanceToNow(new Date(device.createdAt), { addSuffix: true });

  return (
    <Card className="relative overflow-hidden">
      {device.isCurrentDevice && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">{getDeviceIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-base truncate">{device.deviceName}</CardTitle>
                {device.isCurrentDevice && (
                  <Badge variant="default" className="whitespace-nowrap">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                {device.browser} • {device.os} • {getDeviceTypeLabel()}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Device Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium">Added</p>
            <p className="text-foreground">{createdText}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">Last Used</p>
            <p className="text-foreground flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{lastUsedText}</span>
            </p>
          </div>
        </div>

        {/* IP Address (if available) */}
        {device.ipAddress && (
          <div className="text-xs">
            <p className="text-muted-foreground font-medium">IP Address</p>
            <p className="text-foreground font-mono">{device.ipAddress}</p>
          </div>
        )}

        {/* Remove Button */}
        {onRemove && (
          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={isLoading || device.isCurrentDevice}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Device
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Trusted Device?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to verify your identity again when logging in from{" "}
                    <span className="font-semibold text-foreground">{device.deviceName}</span>.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col space-y-2 bg-destructive/10 p-3 rounded-md">
                  <p className="text-sm font-medium text-destructive">Device Details:</p>
                  <p className="text-xs text-muted-foreground">
                    {device.browser} on {device.os}
                  </p>
                  {device.ipAddress && (
                    <p className="text-xs text-muted-foreground font-mono">{device.ipAddress}</p>
                  )}
                </div>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(device.id)}
                  disabled={isLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? "Removing..." : "Remove Device"}
                </AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrustedDeviceCard;
