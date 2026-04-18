import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  const resetPasswordMutation = trpc.passwordRecovery.resetPassword.useMutation();
  const verifyEmailTokenMutation = trpc.passwordRecovery.verifyEmailToken.useMutation();

  // Extract and verify token on mount
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setError("No reset token provided");
      setValidating(false);
      return;
    }

    setToken(tokenParam);

    // Verify token is valid
    const verifyToken = async () => {
      try {
        const result = await verifyEmailTokenMutation.mutateAsync({
          token: tokenParam,
        });

        if (!result.success) {
          setError(result.error || "Invalid or expired reset link");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify reset link");
      } finally {
        setValidating(false);
      }
    };

    verifyToken();
  }, [search, verifyEmailTokenMutation]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain lowercase letters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain uppercase letters";
    }
    if (!/\d/.test(password)) {
      return "Password must contain numbers";
    }
    if (!/[@$!%*?&]/.test(password)) {
      return "Password must contain special characters (@$!%*?&)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your password");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordMutation.mutateAsync({
        resetToken: token,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-sm text-[oklch(0.52_0.015_240)]">Verifying reset link...</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                  Reset Link Invalid
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900">{error}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">What you can do:</p>
                  <ul className="text-xs text-amber-800 space-y-2">
                    <li>• The reset link may have expired (valid for 24 hours)</li>
                    <li>• Request a new password reset link</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    onClick={() => setLocation("/forgot-password")}
                  >
                    Request New Reset Link
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-[oklch(0.40_0.11_195)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                    onClick={() => setLocation("/auth-selection")}
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                  Password Reset Successfully
                </CardTitle>

                <CardDescription className="text-center text-[oklch(0.52_0.015_155)]">
                  Your password has been updated
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    You can now log in with your new password.
                  </p>
                </div>

                <Button
                  className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  onClick={() => setLocation("/auth-selection")}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)]">
                Create New Password
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_155)]">
                Enter a strong password to secure your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-semibold mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ At least 8 characters</li>
                  <li>✓ Uppercase and lowercase letters</li>
                  <li>✓ Numbers and special characters (@$!%*?&)</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-[oklch(0.25_0.06_155)] font-medium">
                    New Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-[oklch(0.92_0.02_155)] focus:border-[oklch(0.40_0.11_195)] pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-[oklch(0.25_0.06_155)] font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-[oklch(0.92_0.02_155)] focus:border-[oklch(0.40_0.11_195)] pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="border-t border-[oklch(0.92_0.02_155)] pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                  onClick={() => setLocation("/auth-selection")}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
