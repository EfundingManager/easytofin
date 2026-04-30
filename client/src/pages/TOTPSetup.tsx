import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Check } from "lucide-react";

/**
 * TOTP Setup Page
 * Shown when admin/manager/staff/support users log in for the first time
 * Displays QR code to scan with authenticator app
 */
export default function TOTPSetup() {
  const [searchParams] = useSearchParams();
  const [, setLocation] = useLocation();

  const pendingToken = searchParams.get("token") || "";
  const userEmail = searchParams.get("email") || "";
  const phoneUserId = searchParams.get("phoneUserId") ? parseInt(searchParams.get("phoneUserId")!) : 0;

  const [totpCode, setTotpCode] = useState("");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch TOTP setup QR code
  const setupQuery = trpc.totpAuth.getSetupQRCode.useQuery(
    { pendingToken, userEmail },
    { enabled: !!pendingToken && !!userEmail }
  );

  useEffect(() => {
    if (setupQuery.data) {
      setQrCode(setupQuery.data.qrCode);
      setSecret(setupQuery.data.secret);
      setBackupCodes(setupQuery.data.backupCodes);
      setLoading(false);
    }
  }, [setupQuery.data]);

  // Verify TOTP and complete setup
  const verifyMutation = trpc.totpAuth.verifyAndSetup.useMutation({
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
      secret,
      backupCodes,
      phoneUserId,
    });
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-slate-600">Loading authenticator setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Up Authenticator</CardTitle>
          <CardDescription>
            Secure your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <div className="text-sm font-medium">
              1. Scan this QR code with your authenticator app
            </div>
            {qrCode && (
              <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
                <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
            )}
            <p className="text-xs text-slate-500">
              Use Google Authenticator, Authy, Microsoft Authenticator, or any TOTP-compatible app
            </p>
          </div>

          {/* Manual Entry Fallback */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-600">
              Can't scan? Enter this code manually:
            </div>
            <code className="block text-sm font-mono break-all text-slate-700 bg-white p-2 rounded border border-slate-200">
              {secret}
            </code>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              2. Enter the 6-digit code from your app
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={totpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setTotpCode(value);
              }}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Backup Codes */}
          <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm font-medium text-amber-900">
              3. Save your backup codes
            </div>
            <p className="text-xs text-amber-800">
              Save these codes in a safe place. You can use them if you lose access to your authenticator app.
            </p>
            <div className="space-y-1 mt-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-amber-200 text-xs font-mono"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => copyBackupCode(code, index)}
                    className="text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={totpCode.length !== 6 || verifyMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and Continue"
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            You'll need to enter a code from your authenticator app on every login
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
