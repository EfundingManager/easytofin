import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Copy, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TotpSetupProps {
  phoneUserId: number;
  onComplete?: () => void;
}

export default function TotpSetup({ phoneUserId, onComplete }: TotpSetupProps) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"generate" | "verify" | "backup" | "complete">("generate");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generate TOTP secret
  const generateMutation = trpc.admin.generateTotpSecret.useMutation();
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Verify and save TOTP secret
  const verifyMutation = trpc.admin.verifyAndSaveTotpSecret.useMutation();

  const handleGenerateSecret = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateMutation.mutateAsync({ phoneUserId });
      setSecret(result.secret);
      setQrCode(result.qrCode);
      setBackupCodes(result.backupCodes);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Failed to generate TOTP secret");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyMutation.mutateAsync({
        phoneUserId,
        totpCode,
        secret,
        backupCodes,
      });
      setStep("backup");
    } catch (err: any) {
      setError(err.message || "Invalid TOTP code. Please try again.");
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `EasyToFin TOTP 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nImportant: Store these codes in a safe place. Each code can only be used once.\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", "totp-backup-codes.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleComplete = () => {
    setStep("complete");
    if (onComplete) {
      onComplete();
    } else {
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Secure your account with TOTP 2FA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Generate Secret */}
          {step === "generate" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
              </p>
              <Button
                onClick={handleGenerateSecret}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Start Setup"}
              </Button>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === "verify" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">1. Scan this QR code</p>
                {qrCode && (
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">2. Or enter this key manually</p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 font-mono text-sm break-all">{secret}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">3. Enter the 6-digit code</p>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                onClick={handleVerifyCode}
                disabled={loading || totpCode.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === "backup" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">2FA setup verified!</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Save your backup codes</p>
                <p className="text-xs text-muted-foreground">
                  Store these codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(code)}
                      >
                        {copiedCode === code ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleDownloadBackupCodes}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Backup Codes
              </Button>

              <Button
                onClick={handleComplete}
                className="w-full"
              >
                Complete Setup
              </Button>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Setup Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is now protected with two-factor authentication.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
