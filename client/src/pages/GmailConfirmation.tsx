import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Gmail Confirmation Page
 * Displays after Gmail login to confirm account and provide option to proceed to dashboard
 */
export default function GmailConfirmation() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("/dashboard");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Get redirect URL and email from URL parameters
    const params = new URLSearchParams(window.location.search);
    const url = params.get("redirectUrl") || "/dashboard";
    const userEmail = params.get("email") || "";
    
    setRedirectUrl(url);
    setEmail(userEmail);
    
    console.log("[Gmail Confirmation] Page loaded with:", { url, userEmail });
    
    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      console.log("[Gmail Confirmation] Auto-redirecting to:", url);
      window.location.href = url;
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleProceedToDashboard = async () => {
    try {
      setLoading(true);
      console.log("[Gmail Confirmation] User proceeding to dashboard:", redirectUrl);
      // Redirect immediately to the dashboard
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("[Gmail Confirmation] Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-[oklch(0.25_0.06_155)]">
              Gmail Account Confirmed
            </CardTitle>
            <CardDescription className="text-[oklch(0.52_0.015_240)]">
              Your Gmail account has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Email Confirmed</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {email || "Your email address has been verified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                You're all set! Click the button below to proceed to your dashboard.
              </p>
              
              <Button
                onClick={handleProceedToDashboard}
                disabled={loading}
                className="w-full bg-[oklch(0.40_0.10_155)] hover:bg-[oklch(0.35_0.10_155)] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Dashboard...
                  </>
                ) : (
                  "Proceed to Dashboard"
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                Redirecting automatically in 2 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
