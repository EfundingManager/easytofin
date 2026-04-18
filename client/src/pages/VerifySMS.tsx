import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, CheckCircle2, AlertCircle, Phone } from 'lucide-react';

interface VerifySMSProps {
  phone: string;
  phoneUserId: number;
  onSuccess?: () => void;
}

export default function VerifySMS({ phone, phoneUserId, onSuccess }: VerifySMSProps) {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const verifySMSMutation = trpc.smsVerification.verifySMS.useMutation();
  const resendSMSMutation = trpc.smsVerification.resendVerificationSMS.useMutation();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrorMessage('OTP must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await verifySMSMutation.mutateAsync({
        otp,
        phoneUserId,
      });

      if (result.success) {
        setVerificationStatus('success');

        // Redirect after 2 seconds
        setTimeout(() => {
          onSuccess?.();
          setLocation('/dashboard');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Failed to verify OTP');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      const errorMsg = error?.message || 'Failed to verify OTP';
      setErrorMessage(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      const result = await resendSMSMutation.mutateAsync({
        phone,
      });

      if (result.success) {
        setCooldownSeconds(result.cooldownSeconds || 60);
      } else {
        const errorMsg = result.error || 'Failed to resend SMS';
        setErrorMessage(errorMsg);
        if (result.remainingSeconds) {
          setCooldownSeconds(result.remainingSeconds);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to resend SMS';
      setErrorMessage(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            {verificationStatus === 'success' ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : verificationStatus === 'error' ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <Phone className="w-12 h-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Phone</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'success'
              ? 'Phone verified successfully!'
              : `Enter the 6-digit code sent to ${phone}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationStatus === 'success' ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Your phone has been verified</p>
              <p className="text-sm text-slate-600">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Verification Code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setErrorMessage('');
                  }}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={isVerifying}
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={otp.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              {/* Resend Section */}
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-slate-600 text-center">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={cooldownSeconds > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : cooldownSeconds > 0 ? (
                    `Resend in ${cooldownSeconds}s`
                  ) : (
                    'Resend Code'
                  )}
                </Button>

                {/* Cooldown Progress Bar */}
                {cooldownSeconds > 0 && (
                  <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-1000"
                      style={{
                        width: `${((60 - cooldownSeconds) / 60) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 space-y-1">
            <p>Code expires in 10 minutes</p>
            <p>Max 5 resend attempts per hour</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
