import { useState, useEffect } from "react";
import { useRouter } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, AlertCircle, Clock } from "lucide-react";

export default function Gmail2FAVerification() {
  const params = new URLSearchParams(window.location.search);
  const phoneUserId = params.get("phoneUserId");
  const email = params.get("email");
  const redirectUrl = params.get("redirectUrl");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [verificationSent, setVerificationSent] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-gmail-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneUserId: parseInt(phoneUserId || "0"),
          otp,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "OTP verification failed");
        setOtp("");
        return;
      }

      // Redirect to admin dashboard on success
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error("[2FA] Verification error:", err);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-gmail-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneUserId: parseInt(phoneUserId || "0") }),
      });

      if (response.ok) {
        setTimeLeft(300);
        setOtp("");
      } else {
        setError("Failed to resend OTP");
      }
    } catch (err) {
      console.error("[2FA] Resend error:", err);
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              We've sent a 6-digit code to your registered phone number
            </p>

            {/* Email Display */}
            <div className="bg-muted p-3 rounded-md mb-6 text-center">
              <p className="text-sm text-muted-foreground">Verifying:</p>
              <p className="font-medium text-foreground">{email}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium mb-2">
                  Enter Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                />
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className={timeLeft < 60 ? "text-destructive font-medium" : "text-muted-foreground"}>
                  Code expires in {formatTime(timeLeft)}
                </span>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length !== 6 || timeLeft <= 0}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>

            {/* Resend Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={loading || timeLeft > 240} // Only allow resend after 1 minute
                className="text-primary hover:text-primary/80"
              >
                Resend Code
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                For security reasons, this code is only valid for 5 minutes. If you didn't request this, please contact support immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
