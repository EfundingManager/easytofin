import { useState, useEffect } from "react";
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
import { OTPDeliveryNotification } from "@/components/OTPDeliveryNotification";

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
  const [loginError, setLoginError] = useState("");
  const [showSmsOtpFallback, setShowSmsOtpFallback] = useState(false);
  const { isLimited, timeRemaining, formatTimeRemaining, setRateLimit } = useRateLimit();



  // Initialize mutations at the top level (before any conditional returns)
  const requestOtpMutation = trpc.emailAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.emailAuth.verifyOtp.useMutation();
  const loginWithPasswordMutation = trpc.passwordLogin.loginWithPassword.useMutation();


  // Render Google button after it's mounted in DOM
  useEffect(() => {
    if (!googleLoaded) return;

    const googleWindow = window as any;
    if (!googleWindow.google || !googleWindow.google.accounts) {
      console.warn("Google API not available for rendering button");
      return;
    }

    const buttonElement = document.getElementById("google-signin-button");
    if (buttonElement) {
      try {
        googleWindow.google.accounts.id.renderButton(buttonElement, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "en",
        });
        console.log("Google Sign-In button rendered successfully");
      } catch (error) {
        console.error("Error rendering Google button:", error);
      }
    } else {
      console.warn("Google button element not found in DOM");
    }
  }, [googleLoaded]);

  // Load Google Sign-In script on mount
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    let timeoutId: NodeJS.Timeout;

    const loadGoogleSignIn = () => {
      const googleWindow = window as any;

      // Check if Google API is already loaded
      if (googleWindow.google && googleWindow.google.accounts) {
        console.log("Google API already available, initializing...");
        if (initializeGoogleSignIn()) {
          setGoogleLoaded(true);
        }
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying Google Sign-In initialization (${retryCount}/${maxRetries})`);
          timeoutId = setTimeout(loadGoogleSignIn, 600);
        } else {
          console.error("Failed to load Google Sign-In after retries");
        }
        return;
      }

      // Create and load the script
      console.log("Loading Google Sign-In script...");
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = false;
      script.onload = () => {
        console.log("Google Sign-In script loaded, initializing...");
        timeoutId = setTimeout(() => {
          if (initializeGoogleSignIn()) {
            setGoogleLoaded(true);
          }
        }, 300);
      };
      script.onerror = () => {
        console.error("Failed to load Google Sign-In script from CDN");
      };
      document.head.appendChild(script);
    };

    loadGoogleSignIn();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Note: We allow authenticated users to access this page so they can switch accounts if needed


  // Define handleGoogleSignIn before useEffect hooks to avoid hoisting issues
  // Initialize Google Sign-In API
  const initializeGoogleSignIn = () => {
    const googleWindow = window as any;
    if (googleWindow.google && googleWindow.google.accounts) {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error("Google Client ID not configured");
          return false;
        }

        googleWindow.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignIn,
          ux_mode: "popup",
          auto_select: false,
          itp_support: true,
          use_fedcm_for_prompt: true,
        });
        console.log("Google Sign-In API initialized successfully");
        return true;
      } catch (error) {
        console.error("Error initializing Google Sign-In API:", error);
        return false;
      }
    }
    return false;
  };

  const handleGoogleSignIn = async (response: any) => {
    console.log("[Gmail] Google Sign-In callback triggered", response);

    if (!response.credential) {
      console.error("[Gmail] No credential in response", response);
      toast.error("Google Sign-in failed - please try again or use email/password");
      return;
    }

    try {
      setLoading(true);
      // Decode the JWT token to get user info
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const data = JSON.parse(jsonPayload);

      // Send token to backend for verification
      const result = await fetch("/api/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: response.credential,
          googleId: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture,
        }),
      });

      if (result.ok) {
        const responseData = await result.json();
        // Skip VerifyEmailPending and redirect directly to dashboard
        toast.success("Gmail login successful!");
        window.location.href = responseData.redirectUrl || "/admin";
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
      const errorMsg = error.message || "Invalid email or password";
      setLoginError(errorMsg);
      setShowSmsOtpFallback(true);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSmsOtp = async () => {
    setLoading(true);
    try {
      const result = await requestOtpMutation.mutateAsync({ email });
      setIsNewUser(result.isNewUser || false);
      setStep("otp");
      setLoginError("");
      setShowSmsOtpFallback(false);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-[oklch(0.25_0.06_155)]">
              {step === "email" && "Sign In"}
              {step === "otp" && "Verify Your Email"}
              {step === "password" && "Enter Password"}
              {step === "confirmation" && "Email Verified"}
            </CardTitle>
            <CardDescription className="text-[oklch(0.52_0.015_240)]">
              {step === "email" && "Enter your email to sign in"}
              {step === "otp" && "Enter the code sent to your email"}
              {step === "password" && "Enter your password"}
              {step === "confirmation" && "Your email has been verified successfully"}
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
                  <div 
                    id="google-signin-button" 
                    className="flex justify-center"
                    onClick={(e) => {
                      // Ensure click is captured in user interaction context
                      e.preventDefault();
                    }}
                  />
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
                  {loginError && showSmsOtpFallback && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 mb-3">{loginError}</p>
                      <Button
                        type="button"
                        onClick={handleUseSmsOtp}
                        disabled={loading}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Receive OTP via SMS"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <OTPDeliveryNotification
                  phoneOrEmail={email}
                  onResendClick={async () => {
                    setLoading(true);
                    try {
                      await requestOtpMutation.mutateAsync({ email });
                      toast.success("Verification code resent to your email!");
                    } catch (error: any) {
                      toast.error(error.message || "Failed to resend code");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  isLoading={loading}
                  countdownSeconds={60}
                />
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
