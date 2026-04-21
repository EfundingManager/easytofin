import { Clock, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountdownDisplayProps {
  isEnabled: boolean;
  formattedTime: string;
  onResend: () => void;
  isLoading?: boolean;
  label?: string;
  variant?: "sms" | "email";
}

/**
 * Reusable countdown display component
 * Shows countdown timer when disabled, resend button when enabled
 */
export function CountdownDisplay({
  isEnabled,
  formattedTime,
  onResend,
  isLoading = false,
  label = "Resend code",
  variant = "email",
}: CountdownDisplayProps) {
  const bgColor = variant === "sms" ? "bg-blue-50" : "bg-amber-50";
  const borderColor = variant === "sms" ? "border-blue-200" : "border-amber-200";
  const textColor = variant === "sms" ? "text-blue-800" : "text-amber-800";
  const accentColor = variant === "sms" ? "text-blue-900" : "text-amber-900";
  const iconColor = variant === "sms" ? "text-blue-600" : "text-amber-600";

  if (!isEnabled) {
    return (
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${bgColor} border ${borderColor}`}>
        <Clock className={`h-4 w-4 ${iconColor}`} />
        <p className={`text-sm ${textColor}`}>
          {label} in{" "}
          <span className={`font-mono font-semibold ${accentColor}`}>{formattedTime}</span>
        </p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onResend}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
