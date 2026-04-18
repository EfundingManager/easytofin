import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface LoginAttempt {
  timestamp: Date;
  attemptType: 'password' | 'otp' | 'email_link';
  status: 'success' | 'failed';
  failureReason?: string;
  ipAddress?: string;
  location?: string;
}

interface LoginAttemptMonitorProps {
  attempts?: LoginAttempt[];
  recentFailedCount?: number;
  showAlert?: boolean;
}

/**
 * Component to display login attempt history and security alerts
 */
export function LoginAttemptMonitor({
  attempts = [],
  recentFailedCount = 0,
  showAlert = false,
}: LoginAttemptMonitorProps) {
  const [displayAttempts, setDisplayAttempts] = useState<LoginAttempt[]>(attempts);

  useEffect(() => {
    setDisplayAttempts(attempts);
  }, [attempts]);

  const failedAttempts = displayAttempts.filter((a) => a.status === 'failed');
  const successfulAttempts = displayAttempts.filter((a) => a.status === 'success');

  const formatAttemptType = (type: string): string => {
    const typeMap: Record<string, string> = {
      password: 'Password Login',
      otp: 'OTP Verification',
      email_link: 'Email Link',
    };
    return typeMap[type] || type;
  };

  const formatFailureReason = (reason?: string): string => {
    if (!reason) return 'Unknown reason';
    const reasonMap: Record<string, string> = {
      invalid_password: 'Invalid password',
      invalid_otp: 'Invalid OTP code',
      expired_otp: 'OTP code expired',
      invalid_email: 'Email not found',
      account_locked: 'Account temporarily locked',
      rate_limited: 'Too many attempts',
      invalid_token: 'Invalid or expired link',
      user_not_found: 'User not found',
    };
    return reasonMap[reason] || reason;
  };

  const formatTime = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  if (displayAttempts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Security Alert */}
      {showAlert && recentFailedCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {recentFailedCount} failed login attempt{recentFailedCount !== 1 ? 's' : ''} detected in the last hour.
            If this wasn't you, please change your password immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Login Attempt Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>Recent login attempts on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successfulAttempts.length}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedAttempts.length}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayAttempts.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Recent Attempts List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Attempts</h4>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {displayAttempts.slice(0, 10).map((attempt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    attempt.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {attempt.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {formatAttemptType(attempt.attemptType)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(attempt.timestamp)}
                          </div>
                        </div>
                        {attempt.status === 'failed' && attempt.failureReason && (
                          <div className="text-xs text-red-600 mt-1">
                            Reason: {formatFailureReason(attempt.failureReason)}
                          </div>
                        )}
                        {attempt.ipAddress && (
                          <div className="text-xs text-gray-600 mt-1">
                            IP: {attempt.ipAddress}
                          </div>
                        )}
                        {attempt.location && (
                          <div className="text-xs text-gray-600">
                            Location: {attempt.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-semibold ml-2 flex-shrink-0">
                      <span
                        className={
                          attempt.status === 'success'
                            ? 'text-green-600 bg-green-100 px-2 py-1 rounded'
                            : 'text-red-600 bg-red-100 px-2 py-1 rounded'
                        }
                      >
                        {attempt.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayAttempts.length > 10 && (
              <div className="text-xs text-gray-600 text-center pt-2">
                Showing 10 of {displayAttempts.length} attempts
              </div>
            )}
          </div>

          {/* Security Recommendations */}
          {failedAttempts.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-sm text-blue-900 mb-2">Security Recommendations</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Change your password if you don't recognize these attempts</li>
                <li>• Enable two-factor authentication for additional security</li>
                <li>• Review and revoke access from untrusted devices</li>
                <li>• Contact support if you suspect unauthorized access</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginAttemptMonitor;
