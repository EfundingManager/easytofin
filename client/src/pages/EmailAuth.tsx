import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRateLimit } from "@/_core/hooks/useRateLimit";
import { RateLimitAlert } from "@/components/RateLimitAlert";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { RememberDeviceCheckbox } from "@/components/RememberDeviceCheckbox";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { PasswordInput } from "@/components/PasswordInput";

type AuthStep = "email" | "authMethod" | "otp" | "password" | "confirmation";

const EmailAuth = () => {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<AuthStep>("email");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<"otp" | "password" | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const { isLimited, timeRemaining, formatTimeRemaining, setRateLimit } = useRateLimit();



  // Initialize mutations at the top level (before any conditional returns)
  const requestOtpMutation = trpc.emailAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.emailAuth.verifyOtp.useMutation();
  const loginWithPasswordMutation = trpc.passwordLogin.loginWithPassword.useMutation();

  // Note: We allow authenticated users to access this page so they can switch accounts if needed

  // Define handleGoogleSignIn before useEffect hooks to avoid hoisting issues
  const handleGoogleSignIn = async (response: any) => {
    console.log("[Gmail] Google Sign-In callback triggered", response);

    if (!response.credential) {
      console.error("[Gmail] No credential in response", response);
      toast.error("Google Sign-in failed");
      return;
    }

    try {
      setLoading(true);
      // Send token to backend for verification
      const result = await fetch("/api/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      if (result.ok) {
        window.location.href = "/admin";
      } else {
        toast.error("Google Sign-in failed");
      }
    } catch (error) {
      console.error("[Gmail] Error:", error);
      toast.error("Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: any) => {
    e?.preventDefault?.();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const result = await requestOtpMutation.mutateAsync({
        email,
      });

      if (result.success) {
        setIsNewUser(result.isNewUser || false);
        setStep("otp");
        toast.success("OTP sent to your email");
      }
    } catch (error: any) {
      console.error("[Email Auth] Failed to request OTP:", error);
      toast.error(error.message || "Failed to send OTP");
      
      // Handle rate limiting
      if (error.message?.includes("rate limit") || error.message?.includes("Too many")) {
        const match = error.message?.match(/(\d+)\s*seconds?/);
        if (match) {
          const seconds = parseInt(match[1]);
          setRateLimit(seconds);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: any) => {
    e?.preventDefault?.();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOtpMutation.mutateAsync({
        email,
        code,
        isNewUser,
      });

      if (result.success) {
        if (isNewUser) {
          setStep("confirmation");
        } else {
          window.location.href = "/admin";
        }
      }
    } catch (error: any) {
      console.error("[Email Auth] Failed to verify OTP:", error);
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: any) => {
    e?.preventDefault?.();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithPasswordMutation.mutateAsync({
        phoneOrEmail: email,
        password,
      });

      if (result.success) {
        window.location.href = "/admin";
      }
    } catch (error: any) {
      console.error("[Email Auth] Failed to login:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    try {
      setLoading(true);
      // Redirect to profile completion page
      window.location.href = "/complete-profile";
    } catch (error) {
      console.error("[Email Auth] Error:", error);
      toast.error("Failed to proceed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              {step === "email" && "Enter your email to get started"}
              {step === "otp" && "Verify your email with the code we sent"}
              {step === "password" && "Enter your password to sign in"}
              {step === "confirmation" && "Email verified successfully"}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth pr-2">
            {step === "email" && (
              <div className="space-y-4">
                {!googleLoaded && (
                  <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Google Sign-In...
                  </div>
                )}
                {googleLoaded && (
                  <div id="google-signin-button" className="flex justify-center" />
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || isLimited}
                      autoComplete="email"
                      name="email"
                    />
                  </div>

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    name="password"
                  />
                  <RememberDeviceCheckbox
                    checked={rememberDevice}
                    onChange={setRememberDevice}
                    showTooltip={true}
                  />
                  <Button
                    type="button"
                    onClick={(e: any) => handlePasswordLogin(e)}
                    disabled={loading || !email || !password}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                <RememberDeviceCheckbox
                  checked={rememberDevice}
                  onChange={setRememberDevice}
                  showTooltip={true}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || code.length !== 6 || verifyOtpMutation.isPending}
                >
                  {loading || verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 w-full text-center"
                >
                  Forgot Password?
                </button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <RememberDeviceCheckbox
                  checked={rememberDevice}
                  onChange={setRememberDevice}
                  showTooltip={true}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isLimited || loginWithPasswordMutation.isPending}
                >
                  {loading || loginWithPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 w-full text-center"
                >
                  Forgot Password?
                </button>
              </form>
            )}

            {step === "confirmation" && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Email Verified!
                    </h3>
                    <p className="text-sm text-green-700 mb-4">
                      Your email <span className="font-semibold">{email}</span> has been verified successfully.
                    </p>
                  </div>

                  <div className="bg-white rounded p-4 mb-4 text-left">
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Next step:</strong> Complete your profile to finish registration
                    </p>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirmRegistration}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Proceeding...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setEmail("");
                      setSelectedAuthMethod(null);
                      setIsNewUser(false);
                    }}
                    className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium py-2"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onSuccess={() => {
          setStep("email");
          setPassword("");
          setCode("");
        }}
      />
      <Footer />
    </div>
  );
};

export default EmailAuth;
