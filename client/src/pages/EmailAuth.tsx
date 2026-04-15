import { useState, useEffect } from "react";
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
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const EmailAuth = () => {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { isLimited, timeRemaining, formatTimeRemaining, setRateLimit } = useRateLimit();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (authLoading) return; // Wait for auth check to complete
    if (!user) return; // User not authenticated, stay on login page

    // User is already authenticated, redirect to appropriate dashboard
    if (user.role === "admin" || user.role === "manager" || user.role === "staff") {
      setLocation("/admin");
    } else {
      setLocation(`/user/${user.id}`);
    }
  }, [user, authLoading, setLocation]);

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

  const requestOtpMutation = trpc.emailAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.emailAuth.verifyOtp.useMutation();

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
      console.log("[Gmail] Decoded user data:", { email: data.email, name: data.name, sub: data.sub });

      // Call backend endpoint to handle Google callback and set session cookie
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
        }),
      });

      if (!fetchResponse.ok) {
        const error = await fetchResponse.json();
        throw new Error(error.error || "Gmail login failed");
      }

      const result = await fetchResponse.json();
      console.log("[Gmail] Backend response:", result);

      if (result.success && result.redirectUrl) {
        console.log("[Gmail] Login successful, redirecting to:", result.redirectUrl);
        toast.success("Login successful!");
        // Redirect using window.location to ensure session cookie is recognized
        window.location.href = result.redirectUrl;
      } else {
        console.error("[Gmail] Backend returned unexpected response", result);
        toast.error("Gmail login failed");
      }
    } catch (error: any) {
      console.error("[Gmail] Error during Google Sign-in:", error);
      toast.error(error.message || "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

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

    if (isLimited) {
      toast.error(`Too many requests. Please try again in ${formatTimeRemaining(timeRemaining)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtpMutation.mutateAsync({ email });
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || "3600");
        setRateLimit(retryAfter);
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
    if (!code.trim() || code.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({ email, code, isNewUser: false, name: "", phone: "" });

      if (result.success) {
        toast.success("Email verified successfully!");

        // Redirect based on clientStatus
        if (result.clientStatus === "customer") {
          window.location.href = `/customer/${result.userId}`;
        } else {
          window.location.href = `/user/${result.userId}`;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (step === "otp") {
                    setStep("email");
                    setCode("");
                  } else {
                    window.history.back();
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <CardTitle>Sign In or Register</CardTitle>
                <CardDescription>Choose your preferred sign-in method</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <div className="space-y-4">
                {/* Google Sign-In Button */}
                <div>
                  <div id="google-signin-button" className="w-full"></div>
                  {!googleLoaded && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Loading Google Sign-In...</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Email OTP Form */}
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  {isLimited && <RateLimitAlert timeRemaining={timeRemaining} message={`Too many requests. Try again in ${formatTimeRemaining(timeRemaining)}`} onFormatTime={formatTimeRemaining} />}
                  <Button type="submit" className="w-full" disabled={loading || isLimited}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Check your email for the 6-digit code</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify OTP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                  }}
                >
                  Back
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default EmailAuth;
