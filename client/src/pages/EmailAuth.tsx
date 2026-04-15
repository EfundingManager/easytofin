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

  // Initialize mutations at the top level (before any conditional returns)
  const requestOtpMutation = trpc.emailAuth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.emailAuth.verifyOtp.useMutation();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (user.role === "admin" || user.role === "manager" || user.role === "staff") {
      setLocation("/admin");
    } else {
      setLocation(`/user/${user.id}`);
    }
  }, [user, authLoading, setLocation]);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
      }
    };
    document.head.appendChild(script);
  }, []);

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
      await requestOtpMutation.mutateAsync({ email });
      setStep("otp");
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({ email, code, isNewUser: false });
      toast.success("Login successful!");
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
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
            <CardTitle>Client Login</CardTitle>
            <CardDescription>Sign in to your EasyToFin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLimited && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Too many attempts. Please wait {timeRemaining}s before trying again.
              </div>
            )}

            {step === "email" ? (
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
                    "Send OTP"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div id="google-signin-button" className="flex justify-center">
                  {googleLoaded && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.google?.accounts?.id) {
                          window.google.accounts.id.renderButton(
                            document.getElementById("google-signin-button"),
                            { theme: "outline", size: "large", text: "signin_with" }
                          );
                        }
                      }}
                      className="text-sm text-muted-foreground"
                    >
                      Sign in with Google
                    </button>
                  )}
                </div>
              </form>
            ) : (
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

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Email
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
