import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RateLimitAlertProps {
  message: string;
  timeRemaining: number;
  onFormatTime: (seconds: number) => string;
}

/**
 * Component to display rate limit alert with countdown timer
 */
export function RateLimitAlert({
  message,
  timeRemaining,
  onFormatTime,
}: RateLimitAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Rate Limit Exceeded</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{message}</p>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Try again in: <strong>{onFormatTime(timeRemaining)}</strong></span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Component to display rate limit warning (non-destructive)
 */
export function RateLimitWarning({
  message,
  timeRemaining,
  onFormatTime,
}: RateLimitAlertProps) {
  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50">
      <Clock className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Too Many Attempts</AlertTitle>
      <AlertDescription className="mt-2 text-yellow-700">
        <p className="mb-2">{message}</p>
        <div className="flex items-center gap-2 text-sm">
          <span>Please wait: <strong>{onFormatTime(timeRemaining)}</strong></span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Component to display disabled state with countdown
 */
export function RateLimitDisabledButton({
  timeRemaining,
  onFormatTime,
}: Omit<RateLimitAlertProps, 'message'>) {
  return (
    <div className="text-center text-sm text-gray-600 py-2">
      <div className="flex items-center justify-center gap-2">
        <Clock className="h-4 w-4" />
        <span>Request disabled for {onFormatTime(timeRemaining)}</span>
      </div>
    </div>
  );
}
