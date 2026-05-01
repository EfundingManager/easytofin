import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * TOTP Verification Page
 * Allows users to verify their TOTP code during login
 */
export default function TOTPVerify() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const verifyTotpMutation = trpc.admin.verifyAndSaveTotpSecret.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        if (user?.role === "admin" || user?.role === "super_admin") {
          navigate("/admin/dashboard");
        } else if (user?.role === "manager") {
          navigate("/manager/dashboard");
        } else if (user?.role === "staff") {
          navigate("/staff/dashboard");
        } else if (user?.role === "support") {
          navigate("/support/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    },
    onError: (error) => {
      setError(error.message || "Invalid TOTP code. Please try again.");
      setSuccess(false);
    },
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!totpCode.trim()) {
      setError("Please enter a code");
      return;
    }

    if (!user?.id) {
      setError("User information not available");
      return;
    }

    setIsLoading(true);
    try {
      // For login verification, we need to provide the secret and backup codes
      // These would normally come from the context or session
      await verifyTotpMutation.mutateAsync({
        phoneUserId: user.id as number,
        totpCode: totpCode.trim(),
        secret: "", // Would be retrieved from session
        backupCodes: [], // Would be retrieved from session
      });
    } catch (err) {
      console.error("TOTP verification failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeToggle = () => {
    setUseBackupCode(!useBackupCode);
    setTotpCode("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Verification successful! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            {/* Code Input */}
            <div className="space-y-2">
              <label htmlFor="totp-code" className="text-sm font-medium">
                {useBackupCode ? "Backup Code" : "Authentication Code"}
              </label>
              <Input
                id="totp-code"
                type="text"
                placeholder={useBackupCode ? "Enter backup code" : "000000"}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.toUpperCase())}
                maxLength={useBackupCode ? 10 : 6}
                disabled={isLoading || success}
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || success || !totpCode.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success ? "Verified!" : "Verify"}
            </Button>

            {/* Backup Code Toggle */}
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={handleBackupCodeToggle}
                className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium py-2"
              >
                {useBackupCode
                  ? "← Back to authenticator code"
                  : "Use backup code instead"}
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600 space-y-1">
              <p>
                {useBackupCode
                  ? "Backup codes can be used if you lose access to your authenticator app."
                  : "Open your authenticator app and enter the 6-digit code shown."}
              </p>
              {!useBackupCode && (
                <p>
                  Codes expire after 30 seconds. If the code expires, wait for a new one to appear.
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
