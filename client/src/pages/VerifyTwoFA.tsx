import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * VerifyTwoFA Page
 * 
 * Displays TOTP verification form for login
 * Used by privileged roles (admin, manager, staff, super_admin)
 * after their first authentication factor (Google OAuth or Email OTP)
 */
export default function VerifyTwoFA() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [totpToken, setTotpToken] = useState("");
  const [error, setError] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);

  const verifyMutation = trpc.totp.verifyLoginTotp.useMutation();

  // Redirect if not authenticated or not privileged role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth-selection");
      return;
    }

    if (user && !["admin", "manager", "staff", "super_admin"].includes(user.role || "")) {
      navigate("/user/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Handle TOTP verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totpToken.length !== 6) {
      setError("TOTP token must be 6 digits");
      return;
    }

    if (attempts >= maxAttempts) {
      setError(`Too many failed attempts. Please try again later.`);
      return;
    }

    try {
      setVerifying(true);
      setError("");
      
      await verifyMutation.mutateAsync({
        token: totpToken,
      });

      // Redirect to admin dashboard on success
      navigate("/admin/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Verification failed";
      setError(errorMsg);
      setAttempts(attempts + 1);
      setTotpToken("");
      console.error("[VerifyTwoFA] Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const remainingAttempts = maxAttempts - attempts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Verify Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {attempts > 0 && attempts < maxAttempts && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="totp-token" className="block text-sm font-medium mb-2">
                  6-Digit Code
                </label>
                <input
                  id="totp-token"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border rounded-lg text-center text-3xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={verifying || attempts >= maxAttempts}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  verifying ||
                  totpToken.length !== 6 ||
                  attempts >= maxAttempts ||
                  verifyMutation.isPending
                }
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>

            {/* Help Section */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm text-slate-600">
                <strong>Don't have your authenticator app?</strong>
              </p>
              <p className="text-sm text-slate-600">
                If you've lost access to your authenticator app, you can use one of your backup codes instead.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/auth-selection")}
                disabled={verifying}
              >
                Back to Login
              </Button>
            </div>

            {/* Security Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Security:</strong> Never share your TOTP codes with anyone. EasyToFin staff will never ask for your codes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
