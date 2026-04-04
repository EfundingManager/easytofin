import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const verifyEmailMutation = trpc.emailVerification.verifyEmail.useMutation();
  const resendEmailMutation = trpc.emailVerification.resendVerificationEmail.useMutation();

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const result = await verifyEmailMutation.mutateAsync({ token });

        if (result.success) {
          setEmail(result.email || '');
          setStatus('success');
          toast.success('Email verified successfully!');

          // Redirect to home after 3 seconds
          setTimeout(() => {
            setLocation('/');
          }, 3000);
        } else {
          setStatus('error');
          toast.error(result.error || 'Failed to verify email');
        }
      } catch (error: any) {
        setStatus('error');
        toast.error(error.message || 'Failed to verify email');
      }
    };

    verifyToken();
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setResendLoading(true);
    try {
      const result = await resendEmailMutation.mutateAsync({ email });

      if (result.success) {
        toast.success('Verification email resent successfully');
        setStatus('resend');
      } else {
        toast.error(result.error || 'Failed to resend email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-[oklch(0.97_0.003_240)] to-[oklch(0.92_0.02_155)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-[oklch(0.88_0.008_240)]">
            <CardHeader className="text-center">
              {status === 'loading' && (
                <>
                  <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                    Verifying Email
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_240)]">
                    Please wait while we verify your email address...
                  </CardDescription>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-16 h-16 text-[oklch(0.50_0.20_142)]" />
                  </div>
                  <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                    Email Verified!
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_240)]">
                    Your email has been successfully verified. Redirecting to home...
                  </CardDescription>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="flex justify-center mb-4">
                    <AlertCircle className="w-16 h-16 text-[oklch(0.60_0.20_25)]" />
                  </div>
                  <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                    Verification Failed
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_240)]">
                    The verification link is invalid or has expired. Please request a new one.
                  </CardDescription>
                </>
              )}

              {status === 'resend' && (
                <>
                  <div className="flex justify-center mb-4">
                    <Mail className="w-16 h-16 text-[oklch(0.40_0.11_195)]" />
                  </div>
                  <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                    Email Resent
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_240)]">
                    A new verification email has been sent to {email}. Please check your inbox.
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent>
              {status === 'loading' && (
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.40_0.11_195)]" />
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <Button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>

                  <Button
                    onClick={() => setLocation('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              )}

              {status === 'success' && (
                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                >
                  Go to Home
                </Button>
              )}

              {status === 'resend' && (
                <div className="space-y-4">
                  <p className="text-sm text-[oklch(0.52_0.015_240)] text-center">
                    Didn't receive the email? Check your spam folder or try again in a few minutes.
                  </p>
                  <Button
                    onClick={() => setLocation('/')}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  >
                    Go to Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
