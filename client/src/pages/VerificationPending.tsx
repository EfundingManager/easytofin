import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import SMSVerificationModal from "@/components/SMSVerificationModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function VerificationPending() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "sms">("email");
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [phoneUserId, setPhoneUserId] = useState<number | null>(null);

  useEffect(() => {
    // Extract email and phone from query params
    const params = new URLSearchParams(search);
    const emailParam = params.get("email");
    const phoneParam = params.get("phone");
    const methodParam = params.get("method");
    const userIdParam = params.get("userId");

    if (emailParam) setEmail(emailParam);
    if (phoneParam) setPhone(phoneParam);
    if (methodParam === "sms" || methodParam === "email") setVerificationMethod(methodParam);
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      setPhoneUserId(userId);
      localStorage.setItem('phoneUserId', userIdParam);
    }
  }, [search]);

  const handleSwitchToSMS = () => {
    setVerificationMethod("sms");
    setShowSMSModal(true);
  };

  const handleVerificationSuccess = () => {
    // Redirect to login or dashboard after successful verification
    setLocation("/auth-selection");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {verificationMethod === "email" ? (
                    <Mail className="w-8 h-8 text-blue-600" />
                  ) : (
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)] text-center">
                {verificationMethod === "email" ? "Verify Your Email" : "Verify Your Phone"}
              </CardTitle>
              <CardDescription className="text-center text-[oklch(0.52_0.015_155)]">
                {verificationMethod === "email"
                  ? "We've sent a verification link to your email"
                  : "We've sent a verification code to your phone"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Verification Method Display */}
              <div className="bg-[oklch(0.96_0.01_155)] rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[oklch(0.25_0.06_155)]">
                      {verificationMethod === "email" ? "Email Verification" : "SMS Verification"}
                    </p>
                    <p className="text-xs text-[oklch(0.52_0.015_240)] mt-1">
                      {verificationMethod === "email" 
                        ? `Check your inbox at ${email || "your email address"}` 
                        : `Check your SMS messages at ${phone || "your phone number"}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[oklch(0.25_0.06_155)] text-sm">
                  What to do next:
                </h3>
                <ol className="space-y-2 text-sm text-[oklch(0.52_0.015_240)]">
                  <li className="flex gap-3">
                    <span className="font-semibold text-[oklch(0.40_0.11_195)] flex-shrink-0">1.</span>
                    <span>
                      {verificationMethod === "email" 
                        ? "Open your email and click the verification link" 
                        : "Enter the 6-digit code you received"}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-[oklch(0.40_0.11_195)] flex-shrink-0">2.</span>
                    <span>Your account will be activated immediately</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-[oklch(0.40_0.11_195)] flex-shrink-0">3.</span>
                    <span>You can then log in and complete your profile</span>
                  </li>
                </ol>
              </div>

              {/* Didn't receive email/SMS section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900 mb-3">
                  <strong>Didn't receive the {verificationMethod === "email" ? "email" : "SMS"}?</strong>
                </p>
                <ul className="text-xs text-amber-800 space-y-2 mb-3">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct {verificationMethod === "email" ? "email address" : "phone number"}</li>
                  <li>• Wait a few minutes and refresh this page</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {verificationMethod === "email" && (
                  <Button
                    variant="outline"
                    className="w-full border-[oklch(0.40_0.11_195)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.01_155)]"
                    onClick={handleSwitchToSMS}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Use SMS Code Instead
                  </Button>
                )}

                {verificationMethod === "sms" && (
                  <Button
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                    onClick={() => setShowSMSModal(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enter SMS Code
                  </Button>
                )}

                <Button
                  className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  onClick={() => setLocation("/auth-selection")}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>

                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="w-full text-sm text-[oklch(0.52_0.015_240)] hover:text-[oklch(0.25_0.06_155)] font-medium py-2"
                >
                  Back to Home
                </button>
              </div>

              {/* Help section */}
              <div className="border-t border-[oklch(0.92_0.02_155)] pt-4 text-center">
                <p className="text-xs text-[oklch(0.52_0.015_240)] mb-2">
                  Need help with verification?
                </p>
                <a 
                  href="mailto:support@easytofin.com" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contact Support
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-[oklch(0.52_0.015_240)]">
            <p>
              By verifying your account, you agree to our{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* SMS Verification Modal */}
      <SMSVerificationModal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        phone={phone}
        email={email}
        onVerificationSuccess={handleVerificationSuccess}
      />

      <Footer />
    </div>
  );
}
