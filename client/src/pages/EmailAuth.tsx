import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

type AuthStep = "email" | "otp" | "register";

export default function EmailAuth() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [, setLocation] = useLocation();
  const rateLimit = useRateLimit();

  const requestOtpMutation = trpc.emailAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.emailAuth.verifyOtp.useMutation();
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
        
        // Set session token as cookie for authentication
        if (result.sessionToken) {
          const oneYearSeconds = 365 * 24 * 60 * 60;
          const isSecure = window.location.protocol === 'https:';
          // Set cookie without domain restriction for better compatibility
          const cookieString = `app_session_id=${result.sessionToken}; path=/; max-age=${oneYearSeconds}; SameSite=None${isSecure ? '; Secure' : ''}`;
          document.cookie = cookieString;
        }
        
        localStorage.setItem("emailUserId", result.userId.toString());
        localStorage.setItem("emailUserData", JSON.stringify(result.user));

        // Redirect based on registration status
        const redirectUrl = result.isNewRegistration ? "/profile" : "/dashboard";
        window.location.href = redirectUrl;
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
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (rateLimit.isLimited) {
      toast.error(`Too many requests. Please try again in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtpMutation.mutateAsync({ email });
      setIsNewUser(result.isNewUser || false);
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || "3600");
        rateLimit.setRateLimit(retryAfter, error.message);
        toast.error(error.message);
      } else {
        toast.error(error.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (isNewUser && (!name.trim() || !phone.trim())) {
      toast.error("Please enter your name and phone number");
      return;
    }

    if (rateLimit.isLimited) {
      toast.error(`Too many verification attempts. Please try again in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({
        email,
        code: otp,
        name: isNewUser ? name : undefined,
        phone: isNewUser ? phone : undefined,
        isNewUser,
      });

      if (result.success) {
        toast.success(result.message);
        localStorage.setItem("emailUserId", result.userId.toString());
        localStorage.setItem("emailUserData", JSON.stringify(result.user));

        if (result.isNewRegistration) {
          window.location.href = "/profile";
        } else {
          // Existing user - redirect to dashboard
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || "3600");
        rateLimit.setRateLimit(retryAfter, error.message);
        toast.error(error.message);
      } else {
        toast.error(error.message || "Failed to verify OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-[oklch(0.97_0.003_240)] to-[oklch(0.92_0.02_155)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/auth-selection" className="inline-flex items-center text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.35_0.10_195)] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Link>

          <Card className="border-[oklch(0.88_0.008_240)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                {step === "email" && "Sign In or Register"}
                {step === "otp" && "Verify Your Email"}
                {step === "register" && "Complete Registration"}
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_240)]">
                {step === "email" && "Choose your preferred sign-in method"}
                {step === "otp" && "Enter the 6-digit code sent to your email"}
                {step === "register" && "Complete your profile"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "email" && (
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

                  {/* Email Sign-In Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[oklch(0.18_0.015_240)] mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="border-[oklch(0.88_0.008_240)]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[oklch(0.18_0.015_240)] mb-2">
                      Enter 6-Digit OTP
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

                  {isNewUser && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[oklch(0.18_0.015_240)] mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={loading}
                          className="border-[oklch(0.88_0.008_240)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[oklch(0.18_0.015_240)] mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          placeholder="+353 1 234 5678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={loading}
                          className="border-[oklch(0.88_0.008_240)]"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <ResendCodeButton
                    onResend={async () => {
                      setLoading(true);
                      try {
                        await requestOtpMutation.mutateAsync({ email });
                        toast.success("OTP resent to your email!");
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
                    onClick={() => setStep("email")}
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
