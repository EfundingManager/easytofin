import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResetPasswordEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const resetPasswordMutation = trpc.passwordRecovery.resetPassword.useMutation();

  // Extract token from URL and validate
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setError("Invalid reset link. Token is missing.");
      setValidatingToken(false);
      return;
    }

    setToken(tokenParam);

    // For now, assume token is valid if provided
    // In a real app, you would validate the token with the backend
    setTokenValid(true);
    setValidatingToken(false);
  }, [search]);

  // Validate password strength
  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      errors.push("Password must contain at least one special character (!@#$%^&*)");
    }

    return { valid: errors.length === 0, errors };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please enter and confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordMutation.mutateAsync({
        resetToken: token,
        newPassword: password,
        confirmPassword: password,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/auth-selection");
        }, 3000);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.40_0.11_195)] mb-4" />
                <p className="text-sm text-[oklch(0.52_0.015_240)]">Validating your reset link...</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                  Invalid Reset Link
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error || "Your reset link is invalid or has expired."}</p>
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

  // Success state
  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                  Password Reset Successfully
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-[oklch(0.52_0.015_240)] mb-2">
                    Redirecting to login in a few seconds...
                  </p>
                  <Button
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    onClick={() => setLocation("/auth-selection")}
                  >
                    Go to Login Now
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

  // Password reset form
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)]">
                Set New Password
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_155)]">
                Enter a strong password to secure your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)]">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="border-[oklch(0.88_0.008_240)] pr-10"
                      autoComplete="new-password"
                      name="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="border-[oklch(0.88_0.008_240)] pr-10"
                      autoComplete="new-password"
                      name="confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900 font-semibold mb-2">Password requirements:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 8 characters</li>
                    <li>• One uppercase letter (A-Z)</li>
                    <li>• One lowercase letter (a-z)</li>
                    <li>• One number (0-9)</li>
                    <li>• One special character (!@#$%^&*)</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/auth-selection")}
                  className="w-full border-[oklch(0.40_0.11_195)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
