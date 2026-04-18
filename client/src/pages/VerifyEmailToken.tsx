import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Mail, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VerifyEmailToken() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [token, setToken] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(5);

  const verifyEmailMutation = trpc.emailVerification.verifyEmail.useMutation();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setVerificationStatus("error");
      setErrorMessage("No verification token provided");
      return;
    }

    setToken(tokenParam);
  }, [search]);

  // Verify email when token is available
  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        setVerificationStatus("loading");
        const result = await verifyEmailMutation.mutateAsync({
          token,
        });

        if (result.success) {
          setEmail(result.email || "");
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
          setErrorMessage(result.error || "Failed to verify email");
        }
      } catch (err: any) {
        setVerificationStatus("error");
        setErrorMessage(err.message || "An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, verifyEmailMutation]);

  // Countdown timer for redirect
  useEffect(() => {
    if (verificationStatus !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLocation("/auth-selection");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationStatus, setLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex justify-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    verificationStatus === "success"
                      ? "bg-green-100"
                      : verificationStatus === "error"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}
                >
                  {verificationStatus === "loading" && (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  )}
                  {verificationStatus === "success" && (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  )}
                  {verificationStatus === "error" && (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                {verificationStatus === "loading" && "Verifying Email"}
                {verificationStatus === "success" && "Email Verified"}
                {verificationStatus === "error" && "Verification Failed"}
              </CardTitle>

              <CardDescription className="text-center text-[oklch(0.52_0.015_155)]">
                {verificationStatus === "loading" && "Please wait while we verify your email..."}
                {verificationStatus === "success" && "Your email has been successfully verified"}
                {verificationStatus === "error" && "We couldn't verify your email"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success State */}
              {verificationStatus === "success" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Email Verified Successfully
                        </p>
                        <p className="text-xs text-green-800 mt-1">
                          {email && `Verified email: ${email}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Your account is now fully activated. You can log in and start using EasyToFin's services.
                    </p>
                  </div>

                  <div className="text-center text-sm text-[oklch(0.52_0.015_240)]">
                    <p>Redirecting to login in {countdown} seconds...</p>
                  </div>

                  <Button
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    onClick={() => setLocation("/auth-selection")}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Login Now
                  </Button>
                </div>
              )}

              {/* Error State */}
              {verificationStatus === "error" && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          Verification Error
                        </p>
                        <p className="text-xs text-red-800 mt-1">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900 mb-3">
                      <strong>What you can do:</strong>
                    </p>
                    <ul className="text-xs text-amber-800 space-y-2">
                      <li>• The verification link may have expired (valid for 24 hours)</li>
                      <li>• Try signing up again to receive a new verification link</li>
                      <li>• Check your email spam folder for the verification link</li>
                      <li>• Contact support if the problem persists</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                      onClick={() => setLocation("/signup")}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Sign Up Again
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-[oklch(0.40_0.11_195)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                      onClick={() => setLocation("/")}
                    >
                      Back to Home
                    </Button>
                  </div>

                  <div className="text-center border-t border-[oklch(0.92_0.02_155)] pt-4">
                    <p className="text-xs text-[oklch(0.52_0.015_240)] mb-2">
                      Need help?
                    </p>
                    <a
                      href="mailto:support@easytofin.com"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {verificationStatus === "loading" && (
                <div className="space-y-4 py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      We're verifying your email address. This should only take a moment.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-[oklch(0.52_0.015_240)]">
                        Processing verification...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-[oklch(0.52_0.015_240)]">
            <p>
              By verifying your email, you agree to our{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
