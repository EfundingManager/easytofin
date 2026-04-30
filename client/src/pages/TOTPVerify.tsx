import { useState } from "react";
import { useSearchParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

/**
 * TOTP Verification Page
 * Shown when admin/manager/staff/support users log in
 * Prompts them to enter the 6-digit code from their authenticator app
 */
export default function TOTPVerify() {
  const [searchParams] = useSearchParams();

  const pendingToken = searchParams.get("token") || "";
  const phoneUserId = searchParams.get("phoneUserId") ? parseInt(searchParams.get("phoneUserId")!) : 0;

  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Verify TOTP code
  const verifyMutation = trpc.totpAuth.verifyCode.useMutation({
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
    onError: (error) => {
      setError(error.message || "TOTP verification failed");
    },
  });

  const handleVerify = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    verifyMutation.mutate({
      pendingToken,
      totpCode,
      phoneUserId,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && totpCode.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {useBackupCode ? "Enter Backup Code" : "Enter Authenticator Code"}
          </CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Input */}
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
              value={totpCode}
              onChange={(e) => {
                const value = useBackupCode
                  ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
                  : e.target.value.replace(/\D/g, "").slice(0, 6);
                setTotpCode(value);
              }}
              onKeyPress={handleKeyPress}
              maxLength={useBackupCode ? 8 : 6}
              className={`text-center text-2xl tracking-widest font-mono ${
                useBackupCode ? "" : ""
              }`}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={
              (useBackupCode && totpCode.length !== 8) ||
              (!useBackupCode && totpCode.length !== 6) ||
              verifyMutation.isPending
            }
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          {/* Backup Code Toggle */}
          <div className="text-center">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setTotpCode("");
                setError("");
              }}
              className="text-sm text-teal-600 hover:text-teal-700 underline"
            >
              {useBackupCode
                ? "Use authenticator app instead"
                : "Use backup code instead"}
            </button>
          </div>

          <p className="text-xs text-center text-slate-500">
            {useBackupCode
              ? "Backup codes are 8 characters long"
              : "Codes expire every 30 seconds"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
