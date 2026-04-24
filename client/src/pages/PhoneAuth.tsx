import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRateLimit } from "@/_core/hooks/useRateLimit";
import { RateLimitAlert } from "@/components/RateLimitAlert";
import { ResendCodeButton } from "@/components/ResendCodeButton";
import { RememberDeviceCheckbox } from "@/components/RememberDeviceCheckbox";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";

type AuthStep = "phone" | "authMethod" | "otp" | "register" | "password";

export default function PhoneAuth() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<"otp" | "password" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [password, setPassword] = useState("");
  const rateLimit = useRateLimit();

  const requestOtpMutation = trpc.phoneAuth.requestOtp.useMutation();
  const resendOtpMutation = trpc.phoneAuth.resendOtp.useMutation();
  const verifyOtpMutation = trpc.phoneAuth.verifyOtp.useMutation();
  const loginWithPasswordMutation = trpc.passwordLogin.loginWithPassword.useMutation();
  const handleGoogleCallbackMutation = trpc.gmailAuth.handleGoogleCallback.useMutation();

  const handleGoogleSignIn = async (response: any) => {
    if (!response.credential) {
      toast.error("Google Sign-in failed");
      return;
    }

    setLoading(true);
    try {
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

      // Call backend to handle Google callback
      const result = await handleGoogleCallbackMutation.mutateAsync({
        googleId: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
        rememberMe: rememberDevice,
      });

      if (result.success) {
        // Privileged role: redirect to phone 2FA challenge
        if (result.requires2FA && result.pendingToken) {
          toast.info("Phone verification required for your account.");
          window.location.href = `/2fa?token=${encodeURIComponent(result.pendingToken)}`;
          return;
        }

        toast.success(result.message);
        if (result.userId) localStorage.setItem("phoneUserId", result.userId.toString());
        if (result.user) localStorage.setItem("phoneUserData", JSON.stringify(result.user));

        if (result.isNewRegistration) {
          window.location.href = "/profile";
        } else {
          // Redirect to user or customer portal based on clientStatus
          const redirectUrl = result.redirectUrl || "/dashboard";
          window.location.href = redirectUrl;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

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
          use_fedcm_for_prompt: true,
          itp_support: true,
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
      script.defer = true;
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (rateLimit.isLimited) {
      toast.error(`Too many requests. Please try again in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtpMutation.mutateAsync({ phone });
      setDevCode(result.devCode || "");
      setIsNewUser(result.isNewUser || false);
      setStep("authMethod");
      setSelectedAuthMethod(null);
      toast.success("OTP sent to your phone!");
    } catch (error: any) {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        rateLimit.setRateLimit(3600, "Too many requests. Please try again later.");
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error(error.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAuthMethod = (method: "otp" | "password") => {
    setSelectedAuthMethod(method);
    setStep(method);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      toast.error("Please enter phone and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPasswordMutation.mutateAsync({
        phoneOrEmail: phone,
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    if (rateLimit.isLimited) {
      toast.error(`Too many attempts. Please try again in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({
        phone,
        code: otp,
        rememberMe: rememberDevice,
      });

      if (result.success) {
        console.log("[PhoneAuth] OTP verification successful:", result);
        toast.success(result.message);
        // Session cookie is automatically set by the server
        // No need to store in localStorage

        if (result.isNewRegistration) {
          // Redirect new users to profile completion page
          window.location.href = "/profile";
        } else {
          // Redirect to user or customer portal based on clientStatus
          const redirectUrl = result.redirectUrl || "/dashboard";
          window.location.href = redirectUrl;
        }
      }
    } catch (error: any) {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || "60");
        rateLimit.setRateLimit(retryAfter, error.message);
        toast.error(error.message);
      } else {
        toast.error(error.message || "OTP verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-[oklch(0.88_0.008_240)] shadow-sm">
            <CardHeader className="border-b border-[oklch(0.88_0.008_240)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[oklch(0.25_0.06_155)]">
                    {step === "phone" && "Sign In or Register"}
                    {step === "authMethod" && "Choose Sign-In Method"}
                    {step === "otp" && "Verify Your Phone"}
                    {step === "password" && "Enter Password"}
                    {step === "register" && "Complete Registration"}
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_240)]">
                    {step === "phone" && "Enter your phone number"}
                    {step === "authMethod" && `Signing in with ${phone}`}
                    {step === "otp" && "Enter the 6-digit code sent to your phone"}
                    {step === "password" && "Enter your password"}
                    {step === "register" && "Complete your profile"}
                  </CardDescription>
                </div>
                {step !== "phone" && (
                  <button
                    onClick={() => {
                      setStep("phone");
                      setSelectedAuthMethod(null);
                      setOtp("");
                      setPassword("");
                    }}
                    className="p-2 hover:bg-[oklch(0.95_0.008_240)] rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-[oklch(0.52_0.015_240)]" />
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {step === "phone" && (
                <div className="space-y-4">
                  {/* Google Sign-In Button */}
                  {!googleLoaded && (
                    <div className="text-center text-sm text-[oklch(0.52_0.015_240)] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading Google Sign-In...
                    </div>
                  )}
                  {googleLoaded && (
                    <div id="google-signin-button" className="flex justify-center" />
                  )}

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[oklch(0.88_0.008_240)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-[oklch(0.52_0.015_240)]">or</span>
                    </div>
                  </div>

                  {/* Phone Sign-In Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)] mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="+353 87 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        className="border-[oklch(0.88_0.008_240)]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || rateLimit.isLimited}
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : rateLimit.isLimited ? (
                        `Retry in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`
                      ) : (
                        "Continue"
                      )}
                    </Button>
                    {rateLimit.isLimited && (
                      <RateLimitAlert
                        message={rateLimit.message}
                        timeRemaining={rateLimit.timeRemaining}
                        onFormatTime={rateLimit.formatTimeRemaining}
                      />
                    )}
                  </form>
                </div>
              )}

              {step === "authMethod" && (
                <div className="space-y-3">
                  <div className="bg-[oklch(0.95_0.008_240)] p-3 rounded-lg">
                    <p className="text-sm text-[oklch(0.52_0.015_240)]">
                      Choose how you'd like to sign in
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSelectAuthMethod("otp")}
                    className="w-full h-auto py-3 flex flex-col items-start gap-1 border-[oklch(0.88_0.008_240)] hover:bg-[oklch(0.95_0.008_240)]"
                  >
                    <span className="font-semibold text-[oklch(0.25_0.06_155)]">OTP Verification</span>
                    <span className="text-xs text-[oklch(0.52_0.015_240)]">
                      Use the 6-digit code sent to your phone
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSelectAuthMethod("password")}
                    className="w-full h-auto py-3 flex flex-col items-start gap-1 border-[oklch(0.88_0.008_240)] hover:bg-[oklch(0.95_0.008_240)]"
                  >
                    <span className="font-semibold text-[oklch(0.25_0.06_155)]">Password Login</span>
                    <span className="text-xs text-[oklch(0.52_0.015_240)]">
                      Sign in with your password
                    </span>
                  </Button>
                </div>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)] mb-2">
                      Enter OTP
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      disabled={loading}
                      className="border-[oklch(0.88_0.008_240)] text-center text-2xl tracking-widest"
                    />
                  </div>
                  <RememberDeviceCheckbox
                    checked={rememberDevice}
                    onChange={setRememberDevice}
                    showTooltip={true}
                  />
                  <Button
                    type="submit"
                    disabled={loading || rateLimit.isLimited}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : rateLimit.isLimited ? (
                      `Retry in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  {rateLimit.isLimited && (
                    <RateLimitAlert
                      message={rateLimit.message}
                      timeRemaining={rateLimit.timeRemaining}
                      onFormatTime={rateLimit.formatTimeRemaining}
                    />
                  )}
                  <ResendCodeButton
                    onResend={async () => {
                      setLoading(true);
                      try {
                        const result = await resendOtpMutation.mutateAsync({ phone });
                        setDevCode(result.devCode || "");
                        toast.success("OTP resent to your phone!");
                      } catch (error: any) {
                        if (error.data?.code === "TOO_MANY_REQUESTS") {
                          const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || "60");
                          rateLimit.setRateLimit(retryAfter, error.message);
                          toast.error(error.message);
                        } else {
                          toast.error(error.message || "Failed to resend OTP");
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={rateLimit.isLimited}
                    isLoading={loading}
                    cooldownSeconds={60}
                  />
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
                    <label className="block text-sm font-medium text-[oklch(0.25_0.06_155)] mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="border-[oklch(0.88_0.008_240)]"
                    />
                  </div>
                  <RememberDeviceCheckbox
                    checked={rememberDevice}
                    onChange={setRememberDevice}
                    showTooltip={true}
                  />
                  <Button
                    type="submit"
                    disabled={loading || rateLimit.isLimited}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50"
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 w-full text-center"
                  >
                    Forgot Password?
                  </button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-[oklch(0.52_0.015_240)]">
            Don't have an account?{" "}
            <Link href="/email-auth" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up with email
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
