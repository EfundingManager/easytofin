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

type AuthStep = "phone" | "otp" | "register";

export default function PhoneAuth() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const rateLimit = useRateLimit();

  const requestOtpMutation = trpc.phoneAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.phoneAuth.verifyOtp.useMutation();
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
      });

      if (result.success) {
        toast.success(result.message);
        localStorage.setItem("phoneUserId", result.userId.toString());
        localStorage.setItem("phoneUserData", JSON.stringify(result.user));

        if (result.isNewRegistration) {
          // New user - redirect to profile page to complete information and select services
          window.location.href = "/profile";
        } else {
          // Existing user - redirect to dashboard
          window.location.href = "/dashboard";
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
      setStep("otp");
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
      });

      if (result.success) {
        toast.success(result.message);
        localStorage.setItem("phoneUserId", result.userId.toString());
        localStorage.setItem("phoneUserData", JSON.stringify(result.user));

        if (result.isNewRegistration) {
          setStep("register");
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        rateLimit.setRateLimit(3600, "Too many verification attempts. Please try again later.");
        toast.error("Too many verification attempts. Please try again later.");
      } else {
        toast.error(error.message || "OTP verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-[oklch(0.97_0.003_240)] to-[oklch(0.92_0.02_155)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.35_0.10_195)] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="border-[oklch(0.88_0.008_240)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                {step === "phone" && "Sign In or Register"}
                {step === "otp" && "Verify Your Phone"}
                {step === "register" && "Complete Registration"}
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_240)]">
                {step === "phone" && "Choose your preferred sign-in method"}
                {step === "otp" && "Enter the 6-digit code sent to your phone"}
                {step === "register" && "Complete your profile"}
              </CardDescription>
            </CardHeader>

            <CardContent>
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
                        "Send OTP"
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
                        const result = await requestOtpMutation.mutateAsync({ phone });
                        setDevCode(result.devCode || "");
                        toast.success("OTP resent to your phone!");
                      } catch (error: any) {
                        if (error.data?.code === "TOO_MANY_REQUESTS") {
                          rateLimit.setRateLimit(3600, "Too many requests. Please try again later.");
                          toast.error("Too many requests. Please try again later.");
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("phone")}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
