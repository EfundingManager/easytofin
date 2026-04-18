import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OTPDeliveryNotificationProps {
  phoneOrEmail: string;
  onResendClick: () => void;
  isLoading?: boolean;
  countdownSeconds?: number;
}

/**
 * OTPDeliveryNotification Component
 * Displays successful OTP delivery confirmation with countdown timer
 * Prevents duplicate requests during cooldown period
 */
export const OTPDeliveryNotification = ({
  phoneOrEmail,
  onResendClick,
  isLoading = false,
  countdownSeconds = 60,
}: OTPDeliveryNotificationProps) => {
  const [timeRemaining, setTimeRemaining] = useState(countdownSeconds);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleResend = () => {
    setTimeRemaining(countdownSeconds);
    setCanResend(false);
    onResendClick();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">
            OTP sent successfully
          </p>
          <p className="text-xs text-green-700 mt-1">
            We've sent a 6-digit code to {phoneOrEmail}
          </p>
        </div>
      </div>

      <div className="bg-white rounded p-3 border border-green-100">
        <p className="text-xs text-gray-600 mb-2">Didn't receive the code?</p>
        <Button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          variant="outline"
          size="sm"
          className="w-full text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50"
        >
          {isLoading ? (
            "Sending..."
          ) : canResend ? (
            "Resend Code"
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Resend in {formatTime(timeRemaining)}</span>
            </div>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        The code will expire in 10 minutes
      </p>
    </div>
  );
};
