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
      toast.error(error.message || "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In button
  const initializeGoogleSignIn = () => {
    const googleWindow = window as any;
    if (googleWindow.google && googleWindow.google.accounts) {
      try {
        googleWindow.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleSignIn,
          ux_mode: "popup",
          auto_select: false,
          itp_support: true,
        });

        const buttonElement = document.getElementById("google-signin-button");
        if (buttonElement) {
          googleWindow.google.accounts.id.renderButton(buttonElement, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
          });
          setGoogleLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setGoogleLoaded(false);
      }
    }
  };

  // Load Google Sign-In script on mount
  useEffect(() => {
    // Check if script already exists to avoid duplicate loading
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait a bit for the script to be ready
      setTimeout(() => {
        initializeGoogleSignIn();
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(() => {
        initializeGoogleSignIn();
      }, 100);
    };
    script.onerror = () => {
      console.error("Failed to load Google Sign-In script");
      setGoogleLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // Keep script for other components that might need it
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
                  {googleLoaded && (
                    <div id="google-signin-button" className="flex justify-center" />
                  )}
                  {!googleLoaded && (
                    <div className="text-center text-sm text-[oklch(0.52_0.015_240)]">
                      Loading Google Sign-In...
                    </div>
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
                  {rateLimit.isLimited && (
                    <RateLimitAlert
                      message={rateLimit.message}
                      timeRemaining={rateLimit.timeRemaining}
                      onFormatTime={rateLimit.formatTimeRemaining}
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[oklch(0.18_0.015_240)] mb-2">
                      Enter OTP
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={loading}
                      maxLength={6}
                      className="border-[oklch(0.88_0.008_240)] text-center text-2xl tracking-widest font-mono"
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
                        <p className="text-xs text-[oklch(0.52_0.015_240)] mt-1">
                          Include country code (e.g., +353 for Ireland)
                        </p>
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || rateLimit.isLimited}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : rateLimit.isLimited ? (
                      `Try again in ${rateLimit.formatTimeRemaining(rateLimit.timeRemaining)}`
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setName("");
                      setPhone("");
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-[oklch(0.52_0.015_240)] mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-[oklch(0.40_0.11_195)] hover:underline">
              Terms of Business
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[oklch(0.40_0.11_195)] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
