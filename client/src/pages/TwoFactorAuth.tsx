import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Phone, RefreshCw, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";

/**
 * Phone 2FA Challenge Page
 *
 * Shown to Admin, Manager, and Staff users after their first authentication
 * factor (Google or Email OTP). They must verify their registered phone number
 * via SMS OTP before a real session is issued.
 *
 * URL: /2fa?token=<pendingToken>
 */
export default function TwoFactorAuth() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const pendingToken = new URLSearchParams(searchString).get("token") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const resendTimer = useCountdownTimer(300); // 5-minute cooldown

  // ── Fetch challenge metadata (masked phone, role) ──────────────────────────
  const metaQuery = trpc.twoFactorAuth.getChallengeMeta.useQuery(
    { pendingToken },
    {
      enabled: !!pendingToken,
      retry: false,
    }
  );

  // ── Request OTP mutation ───────────────────────────────────────────────────
  const requestOtpMutation = trpc.twoFactorAuth.requestPhoneOtp.useMutation({
    onSuccess: () => {
      setOtpSent(true);
      setError(null);
      resendTimer.start();
    },
    onError: (err) => {
      setError(err.message || "Failed to send verification code.");
    },
  });

  // ── Complete login mutation ────────────────────────────────────────────────
  const completeLoginMutation = trpc.twoFactorAuth.completeLogin.useMutation({
    onSuccess: (data) => {
      // Session cookie is now set by the server.
      // Redirect based on user role
      const roleRedirects: Record<string, string> = {
        admin: "/admin/dashboard",
        super_admin: "/admin/dashboard",
        manager: "/manager/dashboard",
        staff: "/staff/dashboard",
        customer: "/customer/dashboard",
        user: "/user/dashboard",
      };
      const redirectUrl = roleRedirects[data?.userRole] || "/user/dashboard";
      navigate(redirectUrl);
    },
    onError: (err) => {
      setError(err.message || "Verification failed. Please try again.");
      setOtp("");
    },
  });

  // Auto-request OTP on page load once metadata is available
  useEffect(() => {
    if (metaQuery.data && !otpSent && !requestOtpMutation.isPending) {
      handleRequestOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaQuery.data]);

  function handleRequestOtp() {
    if (!pendingToken) return;
    requestOtpMutation.mutate({ pendingToken });
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingToken || otp.length !== 6) return;
    setError(null);
    completeLoginMutation.mutate({ pendingToken, code: otp });
  }

  // ── Guard: no token ────────────────────────────────────────────────────────
  if (!pendingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Session Error</CardTitle>
            <CardDescription>
              No 2FA session token found. Please log in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/email-auth")}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maskedPhone = metaQuery.data?.maskedPhone ?? "your registered phone";
  const role = metaQuery.data?.role ?? "";
  const userRole = metaQuery.data?.userRole ?? "";
  const isLoading =
    metaQuery.isLoading ||
    requestOtpMutation.isPending ||
    completeLoginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-green-50 border border-green-200">
              <Shield className="h-8 w-8 text-green-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Two-Factor Verification
          </CardTitle>
          <CardDescription className="text-gray-600">
            {userRole && (
              <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide">
                {userRole}
              </span>
            )}
            <br />
            For security, your account requires phone verification before login.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Phone info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Phone className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              A verification code has been sent to{" "}
              <span className="font-semibold">{maskedPhone}</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl tracking-widest font-mono h-12"
                autoComplete="one-time-code"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white"
              disabled={otp.length !== 6 || isLoading}
            >
              {completeLoginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify &amp; Sign In
                </>
              )}
            </Button>
          </form>

          {/* Resend */}
          <div className="text-center space-y-2">
            {!resendTimer.isEnabled ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Resend code in{" "}
                  <span className="font-mono font-semibold text-amber-900">{resendTimer.formattedTime}</span>
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-green-700 hover:text-green-800 hover:bg-green-50"
                onClick={handleRequestOtp}
                disabled={isLoading}
              >
                {requestOtpMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Resend Code
              </Button>
            )}
          </div>

          {/* Back to login */}
          <div className="text-center border-t pt-4">
            <Button
              variant="link"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate("/email-auth")}
            >
              Cancel and return to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
