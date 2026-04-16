import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useState } from "react";

interface DeviceVerificationCardProps {
  deviceName: string;
  verificationCode?: string;
  onVerify?: (code: string) => Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

/**
 * DeviceVerificationCard Component
 *
 * Displays device verification flow for new trusted devices.
 * Guides users through OTP verification to confirm device ownership.
 *
 * Features:
 * - Device name display
 * - OTP code input
 * - Verification submission
 * - Error handling
 * - Success state
 * - Skip option for optional verification
 */
export function DeviceVerificationCard({
  deviceName,
  verificationCode: initialCode,
  onVerify,
  onSkip,
  isLoading = false,
  error = null,
  success = false,
}: DeviceVerificationCardProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onVerify || !code.trim()) return;

    try {
      setIsSubmitting(true);
      await onVerify(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-200">
            <CheckCircle2 className="h-5 w-5" />
            <span>Device Verified</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-800 dark:text-green-300">
            <span className="font-semibold">{deviceName}</span> has been successfully added to
            your trusted devices. You won't need to verify your identity on this device for future
            logins.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5" />
          <span>Verify Device</span>
        </CardTitle>
        <CardDescription>
          Confirm this device to add it to your trusted devices list.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Device Info */}
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium text-foreground">{deviceName}</p>
          <p className="text-xs text-muted-foreground mt-1">
            This device will be remembered for future logins.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to your registered email or phone.
            </p>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              maxLength={6}
              disabled={isSubmitting || isLoading}
              className="font-mono text-center text-lg tracking-widest"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || code.length !== 6}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Device"
              )}
            </Button>
            {onSkip && (
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                disabled={isSubmitting || isLoading}
              >
                Skip
              </Button>
            )}
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Why verify?</strong> Verification confirms you own this device and helps
            protect your account from unauthorized access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeviceVerificationCard;
