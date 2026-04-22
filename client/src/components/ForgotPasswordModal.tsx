import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { CountdownDisplay } from "@/components/CountdownDisplay";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onSuccess,
}: ForgotPasswordModalProps) {
  const showToast = (title: string, description: string, variant?: "destructive") => {
    console.log(`[${title}] ${description}`);
  };
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">(
    "request"
  );
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const resendTimer = useCountdownTimer(300); // 5-minute cooldown

  const requestResetMutation = trpc.passwordReset.requestReset.useMutation({
    onSuccess: () => {
      resendTimer.start();
    },
  });
  const verifyOtpMutation = trpc.passwordReset.verifyOtp.useMutation({
    onSuccess: () => {
      resendTimer.reset();
    },
  });
  const resetPasswordMutation = trpc.passwordReset.resetPassword.useMutation();

  const handleRequestReset = async () => {
    const identifier = resetMethod === "email" ? email : phone;
    if (!identifier) {
      showToast(
        "Error",
        `Please enter your ${resetMethod}`,
        "destructive"
      );
      return;
    }

    try {
      const result = await requestResetMutation.mutateAsync({
        email: resetMethod === "email" ? email : undefined,
        phone: resetMethod === "phone" ? phone : undefined,
        resetMethod,
      });

      if (result.success) {
        showToast("Success", result.message);
        setStep("verify");
      }
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to request password reset",
        "destructive"
      );
    }
  };

  const handleResendCode = async () => {
    const identifier = resetMethod === "email" ? email : phone;
    if (!identifier) {
      showToast(
        "Error",
        `Please enter your ${resetMethod}`,
        "destructive"
      );
      return;
    }

    try {
      const result = await requestResetMutation.mutateAsync({
        email: resetMethod === "email" ? email : undefined,
        phone: resetMethod === "phone" ? phone : undefined,
        resetMethod,
      });

      if (result.success) {
        showToast("Success", `Code resent to your ${resetMethod}`);
        setOtp("");
        resendTimer.start();
      }
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to resend code",
        "destructive"
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast(
        "Error",
        "Please enter a valid 6-digit code",
        "destructive"
      );
      return;
    }

    try {
      const result = await verifyOtpMutation.mutateAsync({
        token: `reset_${Date.now()}`, // This should be the actual token from backend
        otp,
      });

      if (result.success) {
        setToken(result.tokenId.toString());
        showToast("Success", "Code verified successfully");
        setStep("reset");
      }
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Invalid or expired code",
        "destructive"
      );
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      showToast(
        "Error",
        "Password must be at least 8 characters",
        "destructive"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Error", "Passwords do not match", "destructive");
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      if (result.success) {
        showToast("Success", "Password reset successfully");
        setStep("success");
      }
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to reset password",
        "destructive"
      );
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onOpenChange(false);
      setStep("request");
      setEmail("");
      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setToken("");
      resendTimer.reset();
      onSuccess?.();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Your Password</DialogTitle>
        </DialogHeader>

        {step === "request" && (
          <div className="space-y-4">
            <Tabs
              value={resetMethod}
              onValueChange={(v) => setResetMethod(v as "email" | "phone")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+353 1 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleRequestReset}
              disabled={requestResetMutation.isPending}
              className="w-full"
            >
              {requestResetMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Code
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                We've sent a 6-digit code to your {resetMethod}. Please enter it below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending || otp.length !== 6}
              className="w-full"
            >
              {verifyOtpMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Code
            </Button>

            {/* Resend code with countdown */}
            <div className="pt-2">
              <CountdownDisplay
                isEnabled={resendTimer.isEnabled}
                formattedTime={resendTimer.formattedTime}
                onResend={handleResendCode}
                isLoading={requestResetMutation.isPending}
                label="Resend Code"
                variant={resetMethod === "email" ? "email" : "sms"}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setStep("request");
                setOtp("");
                resendTimer.reset();
              }}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm text-green-900">
                Code verified! Now set your new password.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || !newPassword || !confirmPassword}
              className="w-full"
            >
              {resetPasswordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep("verify")}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Password Reset Successfully</h3>
              <p className="text-sm text-green-700">
                Your password has been reset. You can now log in with your new password.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
