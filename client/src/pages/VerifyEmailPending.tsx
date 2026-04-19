import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function VerifyEmailPending() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const resendMutation = trpc.emailVerification.resendVerificationEmail.useMutation({
    onSuccess: () => {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    },
  });

  useEffect(() => {
    // Get email from session or localStorage
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await resendMutation.mutateAsync({ email });
    } finally {
      setResendLoading(false);
    }
  };

  const handleContinue = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">Verification email sent to:</p>
                <p className="font-semibold text-slate-900 break-all">{email || "your email"}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">Check your email</p>
                    <p className="text-sm text-slate-600">
                      Click the verification link in the email we sent you to confirm your account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">Check spam folder</p>
                    <p className="text-sm text-slate-600">
                      If you don't see the email, please check your spam or junk folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resend Success Message */}
              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                  ✓ Verification email resent successfully!
                </div>
              )}

              {/* Resend Button */}
              <Button
                onClick={handleResendEmail}
                disabled={resendLoading || !email}
                variant="outline"
                className="w-full"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </Button>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue to Home
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Help Text */}
              <p className="text-xs text-slate-500 text-center">
                Verification link expires in 24 hours. Create a new account if your link has expired.
              </p>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> After verifying your email, you'll be able to access your account and start using EasyToFin's financial services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
