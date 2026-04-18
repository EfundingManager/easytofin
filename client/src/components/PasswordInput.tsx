import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * PasswordInput Component
 * Provides a password input field with visibility toggle icon
 * Helps users verify their password input and reduce login errors
 */
export const PasswordInput = ({
  label,
  error,
  helperText,
  className,
  autoComplete,
  name,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)]">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={`pr-10 border-[oklch(0.88_0.008_240)] ${className || ""}`}
          autoComplete={autoComplete || "current-password"}
          name={name || "password"}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.52_0.015_240)] hover:text-[oklch(0.25_0.06_155)] transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[oklch(0.52_0.015_240)]">{helperText}</p>
      )}
    </div>
  );
};
