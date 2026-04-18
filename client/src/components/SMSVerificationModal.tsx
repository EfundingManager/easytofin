import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SMSVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  email: string;
  onVerificationSuccess: () => void;
}

export default function SMSVerificationModal({
  isOpen,
  onClose,
  phone,
  email,
  onVerificationSuccess,
}: SMSVerificationModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const verifySMSMutation = trpc.smsVerification.verifySMS.useMutation();
  const resendSMSMutation = trpc.smsVerification.resendVerificationSMS.useMutation();

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [resendCooldown]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get phoneUserId from localStorage or pass it as prop
      const phoneUserId = parseInt(localStorage.getItem('phoneUserId') || '0');
      if (!phoneUserId) {
        setError('User information not available');
        return;
      }

      const result = await verifySMSMutation.mutateAsync({
        otp: code,
        phoneUserId,
      });

      if (result.success) {
        setVerificationSuccess(true);
        toast.success("Phone number verified successfully!");

        // Call success callback after 2 seconds
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.message || "Invalid verification code");
        toast.error(result.message || "Invalid verification code");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to verify code";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    try {
      const result = await resendSMSMutation.mutateAsync({
        phone,
      });

      if (result.success) {
        setResendCooldown(60);
        toast.success("Verification code sent to your phone");
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerifyCode();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)]">
            {verificationSuccess ? "Verification Complete" : "Enter Verification Code"}
          </DialogTitle>
          <DialogDescription className="text-[oklch(0.52_0.015_240)]">
            {verificationSuccess
              ? "Your phone number has been verified"
              : `We've sent a 6-digit code to ${phone}`}
          </DialogDescription>
        </DialogHeader>

        {verificationSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-center text-sm text-[oklch(0.52_0.015_240)] mb-6">
              Your phone number has been successfully verified. You can now access your account.
            </p>
            <Button
              onClick={() => {
                onClose();
                onVerificationSuccess();
              }}
              className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[oklch(0.25_0.06_155)]">
                Verification Code
              </label>
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={handleCodeChange}
                onKeyPress={handleKeyPress}
                maxLength={6}
                disabled={loading}
                className={`text-center text-2xl font-bold tracking-widest border-[oklch(0.88_0.008_240)] ${
                  error ? "border-red-500" : ""
                }`}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                Enter the 6-digit code sent to your phone. It may take a few moments to arrive.
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-xs text-[oklch(0.52_0.015_240)] mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className={`text-sm font-medium transition-colors ${
                  resendCooldown > 0
                    ? "text-[oklch(0.52_0.015_240)] cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute right-4 top-4 p-1 hover:bg-[oklch(0.96_0.01_155)] rounded-md transition-colors"
            >
              <X size={20} className="text-[oklch(0.52_0.015_240)]" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
