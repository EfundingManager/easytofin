import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AuthSelection() {
  const [, setLocation] = useLocation();
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleGoogleCallbackMutation = trpc.gmailAuth.handleGoogleCallback.useMutation();
  const { refetch: refetchAuth } = trpc.auth.me.useQuery();

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
        rememberMe: false,
      });

      if (result.success) {
        console.log("[Google Sign-In] Backend response received:", { success: result.success, requires2FA: result.requires2FA, redirectUrl: result.redirectUrl, userId: result.userId, role: result.user?.role });
        
        // Privileged role: redirect to phone 2FA challenge
        if (result.requires2FA && result.pendingToken) {
          console.log("[Google Sign-In] Redirecting to 2FA verification");
          toast.info("Phone verification required for your account.");
          window.location.href = `/2fa?token=${encodeURIComponent(result.pendingToken)}`;
          return;
        }

        toast.success(result.message);
        if (result.userId) localStorage.setItem("phoneUserId", result.userId.toString());
        if (result.user) localStorage.setItem("phoneUserData", JSON.stringify(result.user));

        // CRITICAL: Session cookie is set by backend via Set-Cookie header
        // Redirect immediately using the redirectUrl from backend response
        // The browser will automatically send the cookie on the next request
        const redirectUrl = result.redirectUrl || "/user/dashboard";
        console.log("[Google Sign-In] Session established. Redirecting to:", redirectUrl);
        
        // Use window.location.href for hard redirect to ensure fresh page load with session cookie
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

    const buttonElement = document.getElementById("google-signin-button-auth-selection");
    if (buttonElement) {
      try {
        // Clear any existing content
        if (buttonElement.children.length === 0) {
          googleWindow.google.accounts.id.renderButton(buttonElement, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            locale: "en",
          });
          console.log("Google Sign-In button rendered successfully");
        }
      } catch (error) {
        console.error("Error rendering Google button:", error);
      }
    }
  }, [googleLoaded]);

  // Check if Google API is loaded
  useEffect(() => {
    const checkGoogleAPI = () => {
      const googleWindow = window as any;
      if (googleWindow.google && googleWindow.google.accounts) {
        if (!googleLoaded) {
          if (initializeGoogleSignIn()) {
            setGoogleLoaded(true);
          }
        }
      } else {
        // Retry if Google API not loaded yet
        setTimeout(checkGoogleAPI, 100);
      }
    };

    checkGoogleAPI();
  }, [googleLoaded]);

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
                Choose Registration Method
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_240)]">
                Select how you'd like to sign in or register
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Google Sign-In */}
              <div id="google-signin-button-auth-selection" className="flex justify-center" />

              {/* Phone Registration */}
              <Button
                onClick={() => setLocation("/phone-auth")}
                className="w-full h-auto py-6 px-4 bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white flex flex-col items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Sign in with Phone</div>
                  <div className="text-xs opacity-90">Receive OTP via SMS</div>
                </div>
              </Button>

              {/* Email Registration */}
              <Button
                onClick={() => setLocation("/email-auth")}
                className="w-full h-auto py-6 px-4 bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white flex flex-col items-center gap-3"
              >
                <Mail className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Sign in with Email</div>
                  <div className="text-xs opacity-90">Receive OTP via email</div>
                </div>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[oklch(0.88_0.008_240)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[oklch(0.52_0.015_240)]">or</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-[oklch(0.52_0.015_240)]">
                By signing in, you agree to our{" "}
                <a href="/terms-of-business" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.40_0.11_195)] hover:underline">
                  Terms of Business
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.40_0.11_195)] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
