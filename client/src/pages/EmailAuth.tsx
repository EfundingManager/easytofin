import { useState, useEffect, useRef } from "react";
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

    setLoading(true);
    try {
      console.log("[Gmail] Decoding JWT credential...");
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const data = JSON.parse(jsonPayload);
      console.log("[Gmail] Decoded user data:", { email: data.email, name: data.name, sub: data.sub });

      console.log("[Gmail] Calling /api/gmail/callback endpoint...");
      const fetchResponse = await fetch("/api/gmail/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          googleId: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture,
          rememberMe: rememberDevice,
        }),
      });

      console.log("[Gmail] Response status:", fetchResponse.status);

      if (fetchResponse.ok) {
        const result = await fetchResponse.json();
        console.log("[Gmail] Callback successful, redirecting...", result);

        if (result.redirectUrl) {
          setLocation(result.redirectUrl);
        } else {
          toast.success("Login successful!");
          setLocation("/dashboard");
        }
      } else {
        const errorData = await fetchResponse.json();
        console.error("[Gmail] Callback failed:", errorData);
        toast.error(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("[Gmail] Error during Google Sign-In:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Load Google Sign-In script and initialize button
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          ux_mode: "popup",
          auto_select: false,
        });
        setGoogleLoaded(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  // Render Google button when it's loaded
  useEffect(() => {
    if (googleLoaded && window.google?.accounts?.id) {
      const buttonElement = document.getElementById("google-signin-button");
      if (buttonElement && buttonElement.children.length === 0) {
        try {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            text: "signin_with",
          });
        } catch (error) {
          console.error("[Gmail] Error rendering button:", error);
        }
      }
    }
  }, [googleLoaded]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPasswordMutation.mutateAsync({
        phoneOrEmail: email,
        password,
        rememberMe,
        rememberDevice,
      });

      if (result.success) {
        toast.success("Login successful!");
        window.location.href = result.redirectUrl;
      }
    } catch (error: any) {
      toast.error(error.message || "Password login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (isLimited) {
      toast.error(`Too many attempts. Please wait ${timeRemaining}s`);
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtpMutation.mutateAsync({ email });
      setIsNewUser(result.isNewUser || false);
      setStep("authMethod");
      setSelectedAuthMethod(null);
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAuthMethod = (method: "otp" | "password") => {
    setSelectedAuthMethod(method);
    setStep(method);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      console.log("[EmailAuth] Verifying OTP...", { email, code, isNewUser });
      const result = await verifyOtpMutation.mutateAsync({ email, code, isNewUser, rememberMe: rememberDevice });
      console.log("[EmailAuth] OTP verification result:", result);
      
      // For new users, show confirmation screen
      if (isNewUser) {
        setStep("confirmation");
        toast.success("Email verified successfully!");
      } else {
        // For existing users, proceed directly to login
        toast.success("Login successful!");
        if (result.redirectUrl) {
          console.log("[EmailAuth] Redirecting to:", result.redirectUrl);
          window.location.href = result.redirectUrl;
        } else {
          console.log("[EmailAuth] No redirectUrl, redirecting to /dashboard");
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    setLoading(true);
    try {
      // Complete the registration by redirecting to profile completion
      toast.success("Registration confirmed! Please complete your profile.");
      window.location.href = "/profile";
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onSuccess={() => setStep("email")}
      />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {step === "email" && "Client Login"}
                  {step === "authMethod" && "Choose Sign-In Method"}
                  {step === "otp" && "Verify Email"}
                  {step === "password" && "Enter Password"}
                  {step === "confirmation" && "Registration Confirmed"}
                </CardTitle>
                <CardDescription>
                  {step === "email" && "Sign in to your EasyToFin account"}
                  {step === "authMethod" && `Signing in with ${email}`}
                  {step === "otp" && "Enter the 6-digit code sent to your email"}
                  {step === "password" && "Enter your password"}
                  {step === "confirmation" && "Your email has been verified"}
                </CardDescription>
              </div>
              {step !== "email" && step !== "confirmation" && (
                <button
                  onClick={() => {
                    setStep("email");
                    setSelectedAuthMethod(null);
                    setCode("");
                    setPassword("");
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLimited && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Too many attempts. Please wait {timeRemaining}s before trying again.
              </div>
            )}

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

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || isLimited}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || isLimited || requestOtpMutation.isPending}
                  >
                    {loading || requestOtpMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {step === "authMethod" && (
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Choose how you'd like to sign in
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSelectAuthMethod("otp")}
                  className="w-full h-auto py-3 flex flex-col items-start gap-1 hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-900">OTP Verification</span>
                  <span className="text-xs text-slate-600">
                    Use the 6-digit code sent to your email
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSelectAuthMethod("password")}
                  className="w-full h-auto py-3 flex flex-col items-start gap-1 hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-900">Password Login</span>
                  <span className="text-xs text-slate-600">
                    Sign in with your password
                  </span>
                </Button>
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
                    <ul className="text-xs text-slate-500 space-y-1 ml-4">
                      <li>✓ Personal information</li>
                      <li>✓ Contact details</li>
                      <li>✓ Account preferences</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="button"
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
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default EmailAuth;
