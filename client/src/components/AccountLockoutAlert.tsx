import { useState, useEffect } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AccountLockoutAlertProps {
  locked: boolean;
  remainingMinutes: number;
  failedAttempts: number;
  onRetry?: () => void;
  email?: string;
  phone?: string;
}

export function AccountLockoutAlert({
  locked,
  remainingMinutes,
  failedAttempts,
  onRetry,
  email,
  phone,
}: AccountLockoutAlertProps) {
  const [timeRemaining, setTimeRemaining] = useState(remainingMinutes * 60);

  useEffect(() => {
    if (!locked || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [locked, timeRemaining]);

  const minutes = Math.ceil(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  if (!locked) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Account Locked</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Your account has been temporarily locked due to multiple failed login attempts.
          {email && <span> ({email})</span>}
          {phone && <span> ({phone})</span>}
        </p>

        <div className="flex items-center gap-2 bg-red-50 p-2 rounded">
          <Clock className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-600">
            Try again in {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="text-sm text-red-700">
          <p>
            <strong>Failed Attempts:</strong> {failedAttempts} / 5
          </p>
          <p className="mt-1">
            For security reasons, your account will be unlocked automatically after 60 minutes.
          </p>
        </div>

        <div className="pt-2">
          <p className="text-sm text-red-700 mb-2">
            If you believe this is an error, please contact support:
          </p>
          <a href="mailto:support@easytofin.com" className="text-sm text-blue-600 hover:underline">
            support@easytofin.com
          </a>
          <span className="text-sm text-red-700 mx-2">or</span>
          <a href="tel:1800008888" className="text-sm text-blue-600 hover:underline">
            1800 008888
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Component for showing failed attempt count warning
 */
export function FailedAttemptsWarning({
  failedAttempts,
  maxAttempts = 5,
}: {
  failedAttempts: number;
  maxAttempts?: number;
}) {
  const remaining = maxAttempts - failedAttempts;

  if (failedAttempts === 0 || remaining > 2) {
    return null;
  }

  const severity = remaining === 1 ? "destructive" : "default";
  const message =
    remaining === 1
      ? "⚠️ One more failed attempt will lock your account for 60 minutes"
      : `⚠️ ${remaining} attempts remaining before account lockout`;

  return (
    <Alert variant={severity} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Login Attempts Warning</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Countdown timer component for lockout display
 */
export function LockoutCountdown({ remainingSeconds }: { remainingSeconds: number }) {
  const [seconds, setSeconds] = useState(remainingSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <Clock className="h-5 w-5" />
      <span>
        {minutes}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
