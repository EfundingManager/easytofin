/**
 * ResendCodeButton Component
 * Displays a button to resend OTP code with a 60-second cooldown timer
 * Prevents abuse while providing good UX for users who didn't receive the code
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface ResendCodeButtonProps {
  onResend: () => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  cooldownSeconds?: number;
}

export function ResendCodeButton({
  onResend,
  disabled = false,
  isLoading = false,
  cooldownSeconds = 60,
}: ResendCodeButtonProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Handle cooldown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleResend = async () => {
    if (timeRemaining > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      // Start cooldown after successful resend
      setTimeRemaining(cooldownSeconds);
    } catch (error) {
      // Error is handled by the caller (toast notification)
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const isDisabled = disabled || timeRemaining > 0 || isResending || isLoading;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleResend}
      disabled={isDisabled}
      className="w-full"
    >
      {isResending ? (
        <>
          <RotateCw className="w-4 h-4 mr-2 animate-spin" />
          Resending...
        </>
      ) : timeRemaining > 0 ? (
        <>
          <RotateCw className="w-4 h-4 mr-2 opacity-50" />
          Resend Code ({timeRemaining}s)
        </>
      ) : (
        <>
          <RotateCw className="w-4 h-4 mr-2" />
          Resend Code
        </>
      )}
    </Button>
  );
}
