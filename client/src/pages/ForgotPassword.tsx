import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResendCodeButton } from "@/components/ResendCodeButton";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "sms">("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const requestRecoveryMutation = trpc.passwordRecovery.requestRecovery.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setError(`Please enter your ${recoveryMethod === "email" ? "email address" : "phone number"}`);
      return;
    }

    setLoading(true);

    try {
      const result = await requestRecoveryMutation.mutateAsync({
        email: recoveryMethod === "email" ? identifier : undefined,
        phone: recoveryMethod === "sms" ? identifier : undefined,
        method: recoveryMethod,
      });

      if (result.success) {
        setSuccessMessage(result.message || "Recovery instructions sent successfully");
        setSubmitted(true);
        setIdentifier("");
      } else {
        setError(result.error || "Failed to process recovery request");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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

                <CardTitle className="text-[oklch(0.25_0.06_155)] text-center">
                  Recovery Instructions Sent
                </CardTitle>

                <CardDescription className="text-center text-[oklch(0.52_0.015_155)]">
                  Check your {recoveryMethod === "email" ? "email" : "phone"} for recovery instructions
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    {recoveryMethod === "email"
                      ? "We've sent a password reset link to your email address. The link will expire in 24 hours."
                      : "We've sent a recovery code to your phone. The code will expire in 15 minutes."}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">Didn't receive it?</p>
                  <ul className="text-xs text-amber-800 space-y-2">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct {recoveryMethod === "email" ? "email" : "phone number"}</li>
                    <li>• Wait a few moments and check again</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <ResendCodeButton
                    onResend={async () => {
                      const result = await requestRecoveryMutation.mutateAsync({
                        email: recoveryMethod === "email" ? identifier : undefined,
                        phone: recoveryMethod === "sms" ? identifier : undefined,
                        method: recoveryMethod,
                      });
                      if (!result.success) {
                        throw new Error(result.error || "Failed to resend");
                      }
                    }}
                    cooldownSeconds={60}
                  />

                  <Button
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    onClick={() => {
                      setSubmitted(false);
                      setIdentifier("");
                    }}
                  >
                    Try Another Method
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-[oklch(0.40_0.11_195)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                    onClick={() => setLocation("/auth-selection")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
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
                <CardTitle className="text-[oklch(0.25_0.06_155)]">
                  Forgot Password
                </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_155)]">
                Choose how you'd like to recover your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Tabs value={recoveryMethod} onValueChange={(v) => setRecoveryMethod(v as "email" | "sms")}>
                <TabsList className="grid w-full grid-cols-2 bg-[oklch(0.96_0.01_155)]">
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.06_155)]"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="sms"
                    className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.06_155)]"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      We'll send you a secure link to reset your password. The link expires in 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-[oklch(0.25_0.06_155)] font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="mt-2 border-[oklch(0.92_0.02_155)] focus:border-[oklch(0.40_0.11_195)]"
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      We'll send you a 6-digit code via SMS. The code expires in 15 minutes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone" className="text-[oklch(0.25_0.06_155)] font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="mt-2 border-[oklch(0.92_0.02_155)] focus:border-[oklch(0.40_0.11_195)]"
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Send Recovery Code
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="border-t border-[oklch(0.92_0.02_155)] pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                  onClick={() => setLocation("/auth-selection")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-[oklch(0.52_0.015_240)]">
            <p>
              Remember your password?{" "}
              <a href="/auth-selection" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
