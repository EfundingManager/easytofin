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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  const verifyEmailMutation = trpc.emailVerification.verifyEmail.useMutation();
  const resendEmailMutation = trpc.emailVerification.resendVerificationEmail.useMutation();

  // Countdown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

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

    // Check if cooldown is still active
    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${cooldownSeconds} seconds before resending`);
      return;
    }

    setResendLoading(true);
    try {
      const result = await resendEmailMutation.mutateAsync({ email });

      if (result.success) {
        toast.success('Verification email resent successfully');
        setStatus('resend');
        // Start 60-second cooldown
        setCooldownSeconds(60);
        setLastResendTime(Date.now());
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
                    disabled={resendLoading || cooldownSeconds > 0}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : cooldownSeconds > 0 ? (
                      `Resend in ${cooldownSeconds}s`
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>

                  {cooldownSeconds > 0 && (
                    <div className="w-full bg-[oklch(0.92_0.02_155)] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[oklch(0.52_0.015_240)]">Cooldown active:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[oklch(0.88_0.008_240)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[oklch(0.40_0.11_195)] transition-all duration-1000"
                              style={{ width: `${((60 - cooldownSeconds) / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[oklch(0.40_0.11_195)] w-8 text-right">
                            {cooldownSeconds}s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {cooldownSeconds > 0 && (
                    <div className="w-full bg-[oklch(0.92_0.02_155)] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[oklch(0.52_0.015_240)]">Cooldown active:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[oklch(0.88_0.008_240)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[oklch(0.40_0.11_195)] transition-all duration-1000"
                              style={{ width: `${((60 - cooldownSeconds) / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[oklch(0.40_0.11_195)] w-8 text-right">
                            {cooldownSeconds}s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

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
