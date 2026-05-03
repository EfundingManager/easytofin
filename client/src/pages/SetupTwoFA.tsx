import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * SetupTwoFA Page
 * 
 * Displays QR code for TOTP setup and backup codes
 * Used by privileged roles (admin, manager, staff, super_admin)
 * during their first login
 */
export default function SetupTwoFA() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [codesDownloaded, setCodesDownloaded] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // Setup TOTP mutation
  const setupMutation = trpc.totp.setupTotp.useMutation();
  const verifyMutation = trpc.totp.verifyTotp.useMutation();

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

  // Setup TOTP on page load
  useEffect(() => {
    const setup = async () => {
      try {
        setLoading(true);
        const result = await setupMutation.mutateAsync();
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setBackupCodes(result.backupCodes);
        setError("");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to set up TOTP";
        setError(errorMsg);
        console.error("[SetupTwoFA] Setup failed:", err);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, []);

  // Copy backup code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `EasyToFin TOTP Backup Codes\n\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join("\n")}\n\nKeep these codes safe. Each code can be used once if you lose access to your authenticator app.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "easytofin-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCodesDownloaded(true);
  };

  // Handle TOTP verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totpToken.length !== 6) {
      setError("TOTP token must be 6 digits");
      return;
    }

    try {
      setVerifying(true);
      setError("");
      
      await verifyMutation.mutateAsync({
        token: totpToken,
        backupCodesAcknowledged: codesDownloaded,
      });

      // Redirect to admin dashboard on success
      navigate("/admin/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Verification failed";
      setError(errorMsg);
      console.error("[SetupTwoFA] Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Setting up TOTP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Set Up Two-Factor Authentication</CardTitle>
            <CardDescription>
              Secure your account with TOTP (Time-based One-Time Password)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Scan QR Code */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) to scan this QR code:
                </p>
              </div>

              {qrCode && (
                <div className="flex justify-center bg-white p-4 rounded-lg border">
                  <img src={qrCode} alt="TOTP QR Code" className="w-64 h-64" />
                </div>
              )}

              {/* Manual Entry Key */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">
                  Can't scan? Enter this key manually:
                </p>
                <code className="text-sm font-mono bg-white p-2 rounded block break-all">
                  {secret}
                </code>
              </div>
            </div>

            {/* Step 2: Save Backup Codes */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <h3 className="font-semibold mb-2">Step 2: Save Backup Codes</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator app:
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                    <code className="font-mono text-sm">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Copy to clipboard"
                    >
                      {copiedCode === code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadBackupCodes}
                  variant="outline"
                  className="flex-1"
                >
                  Download Codes
                </Button>
                <Button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  variant="outline"
                  className="flex-1"
                >
                  {showBackupCodes ? "Hide" : "Show"} All Codes
                </Button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codesDownloaded}
                  onChange={(e) => setCodesDownloaded(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  I have saved my backup codes in a safe place
                </span>
              </label>
            </div>

            {/* Step 3: Verify TOTP */}
            <form onSubmit={handleVerify} className="space-y-4 border-t pt-6">
              <div>
                <h3 className="font-semibold mb-2">Step 3: Verify TOTP</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Enter the 6-digit code from your authenticator app to complete setup:
                </p>
              </div>

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
                  className="w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={verifying || !codesDownloaded}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  verifying ||
                  !codesDownloaded ||
                  totpToken.length !== 6 ||
                  setupMutation.isPending ||
                  verifyMutation.isPending
                }
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> Keep your backup codes safe and never share them. Each code can only be used once and should be kept offline.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
