import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type SetupStep = "generate" | "scan" | "verify" | "backup" | "complete";

/**
 * TOTP Setup Flow for First-Time Users
 * Guides users through setting up 2FA on first login
 */
export default function TOTPSetupFlow() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<SetupStep>("generate");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate TOTP secret mutation
  const generateSecretMutation = trpc.admin.generateTotpSecret.useMutation({
    onSuccess: (response) => {
      setSecret(response.secret);
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
      setStep("scan");
    },
    onError: (error) => {
      setError("Failed to generate TOTP secret: " + error.message);
    },
  });

  // Verify TOTP code mutation
  const verifyTotpMutation = trpc.admin.verifyAndSaveTotpSecret.useMutation({
    onSuccess: () => {
      setStep("backup");
    },
    onError: (error) => {
      setError(error.message || "Invalid TOTP code. Please try again.");
    },
  });

  // Generate secret on mount
  useEffect(() => {
    if (!user?.id) return;
    generateSecretMutation.mutate({ phoneUserId: user.id as number });
  }, [user?.id]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!totpCode.trim()) {
      setError("Please enter a code");
      return;
    }

    if (!user?.id || !secret || backupCodes.length === 0) {
      setError("TOTP setup not initialized. Please refresh the page.");
      return;
    }

    await verifyTotpMutation.mutateAsync({
      phoneUserId: user.id as number,
      totpCode: totpCode.trim(),
      secret,
      backupCodes,
    });
  };

  const handleCopyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `EasyToFin 2FA Backup Codes\n\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join("\n")}\n\nStore these codes in a safe place.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompleteSetup = () => {
    // Redirect to appropriate dashboard
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Loading state */}
        {generateSecretMutation.isPending && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Setting Up Two-Factor Authentication</CardTitle>
              <CardDescription>Initializing...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </CardContent>
          </>
        )}

        {/* Step 1: Scan QR Code */}
        {!generateSecretMutation.isPending && step === "scan" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Set Up Two-Factor Authentication</CardTitle>
              <CardDescription>Step 1 of 3: Scan the QR code</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-full" />
                ) : (
                  <div className="aspect-square bg-slate-100 rounded flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-md text-sm space-y-2">
                <p className="font-medium">Can't scan?</p>
                <p className="text-slate-600">Enter this code manually in your authenticator app:</p>
                <code className="block bg-white p-2 rounded border border-slate-200 font-mono text-center break-all">
                  {secret}
                </code>
              </div>

              <Button
                onClick={() => setStep("verify")}
                className="w-full"
                disabled={!qrCode}
              >
                Next: Verify Code
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Verify Your Code</CardTitle>
              <CardDescription>Step 2 of 3: Enter the 6-digit code</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="verify-code" className="text-sm font-medium">
                    Authentication Code
                  </label>
                  <input
                    id="verify-code"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyTotpMutation.isPending || totpCode.length !== 6}
                >
                  {verifyTotpMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("scan")}
                >
                  Back
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {/* Step 3: Save Backup Codes */}
        {step === "backup" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Save Backup Codes</CardTitle>
              <CardDescription>Step 3 of 3: Store these codes safely</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Save these backup codes in a safe place. Use them if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-3 rounded-md space-y-2 max-h-48 overflow-y-auto">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border border-slate-200"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyBackupCode(code, index)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Copy code"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadBackupCodes}
              >
                Download as Text File
              </Button>

              <Button
                onClick={handleCompleteSetup}
                className="w-full"
              >
                Setup Complete
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
