import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';

const SERVICES = [
  { id: 'protection', label: 'Life Protection', description: 'Life assurance and protection coverage' },
  { id: 'pensions', label: 'Pensions', description: 'Retirement planning and pension schemes' },
  { id: 'healthInsurance', label: 'Health Insurance', description: 'Private medical insurance' },
  { id: 'generalInsurance', label: 'General Insurance', description: 'Home, motor, and business insurance' },
  { id: 'investments', label: 'Investments', description: 'Savings and investment solutions' },
];

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password strength requirements
  const passwordRequirements = {
    minLength: passwordData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordData.password),
    hasLowercase: /[a-z]/.test(passwordData.password),
    hasNumber: /[0-9]/.test(passwordData.password),
    hasSpecial: /[!@#$%^&*]/.test(passwordData.password),
  };
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = passwordData.password && passwordData.confirmPassword && passwordData.password === passwordData.confirmPassword;

  // Send verification email mutation
  const sendVerificationEmailMutation = trpc.emailVerification.sendVerificationEmail.useMutation();
  
  // Set password mutation
  const setPasswordMutation = trpc.passwordLogin.setPassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordData({ password: '', confirmPassword: '' });
      setPasswordError(null);
      setTimeout(() => setPasswordSuccess(false), 5000);
    },
    onError: (error) => {
      setPasswordError(error.message || 'Failed to set password');
    },
  });

  // Fetch current profile
  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    enabled: !!user && !authLoading,
  });

  // Initialize form with user data
  useEffect(() => {
    if (profileQuery.data?.success && profileQuery.data.data) {
      const userData = profileQuery.data.data.user;
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
      setSelectedServices(profileQuery.data.data.selectedServices || []);
    }
  }, [profileQuery.data]);

  // Submit profile mutation
  const submitMutation = trpc.profile.submitProfile.useMutation({
    onSuccess: async (data) => {
      if (data.success) {
        // Send verification email
        try {
          await sendVerificationEmailMutation.mutateAsync({ email: formData.email });
          setVerificationEmail(formData.email);
        } catch (error) {
          console.error('Failed to send verification email:', error);
        }
        
        setSubmitted(true);
        setError(null);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          setLocation('/dashboard');
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit profile');
      }
    },
    onError: (error) => {
      setError(error.message || 'An error occurred');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      setLoading(false);
      return;
    }

    // Submit
    await submitMutation.mutateAsync({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      services: selectedServices as any,
    });

    setLoading(false);
  };

  if (authLoading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please log in to continue.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Profile Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div>
              <p className="text-sm text-green-800 font-medium mb-2">Thank you, {formData.name}!</p>
              <p className="text-sm text-green-700">
                We have received your profile and service preferences.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-900">Selected Services: {selectedServices.length}</p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedServices.map(s => SERVICES.find(srv => srv.id === s)?.label).join(', ')}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Verification Email Sent!</strong>
              </p>
              <p className="text-xs text-amber-800 mt-1">
                A verification link has been sent to <strong>{verificationEmail}</strong>. Please check your inbox and click the link to confirm your email address.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>We will contact you soon!</strong>
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Our team will reach out to you at {formData.phone} or {formData.email} within 24 hours.
              </p>
            </div>
            <p className="text-xs text-gray-500 pt-2">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide your information and select the services you're interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Services Selection Section */}
              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Services *</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose one or more services you're interested in
                  </p>
                </div>

                <div className="space-y-3">
                  {SERVICES.map(service => (
                    <div
                      key={service.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.label}</p>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>{selectedServices.length}</strong> service{selectedServices.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>

              {/* Password Section */}
              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Create Password</h3>
                  <p className="text-sm text-muted-foreground">Set a password to enable password-based login in the future</p>
                </div>

                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">Password set successfully!</p>
                  </div>
                )}

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a strong password"
                      value={passwordData.password}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, password: e.target.value }));
                        setPasswordError(null);
                      }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setPasswordError(null);
                      }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                {passwordData.password && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                    <p className="text-sm font-medium text-gray-900">Password Requirements:</p>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-700' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.minLength ? 'bg-green-200' : 'bg-gray-200'}`}>
                          {passwordRequirements.minLength && <span className="text-green-700 font-bold">✓</span>}
                        </div>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasUppercase ? 'text-green-700' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasUppercase ? 'bg-green-200' : 'bg-gray-200'}`}>
                          {passwordRequirements.hasUppercase && <span className="text-green-700 font-bold">✓</span>}
                        </div>
                        One uppercase letter (A-Z)
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasLowercase ? 'text-green-700' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasLowercase ? 'bg-green-200' : 'bg-gray-200'}`}>
                          {passwordRequirements.hasLowercase && <span className="text-green-700 font-bold">✓</span>}
                        </div>
                        One lowercase letter (a-z)
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-700' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasNumber ? 'bg-green-200' : 'bg-gray-200'}`}>
                          {passwordRequirements.hasNumber && <span className="text-green-700 font-bold">✓</span>}
                        </div>
                        One number (0-9)
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasSpecial ? 'text-green-700' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.hasSpecial ? 'bg-green-200' : 'bg-gray-200'}`}>
                          {passwordRequirements.hasSpecial && <span className="text-green-700 font-bold">✓</span>}
                        </div>
                        One special character (!@#$%^&*)
                      </div>
                      {passwordsMatch && (
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-200">
                            <span className="text-green-700 font-bold">✓</span>
                          </div>
                          Passwords match
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={async () => {
                    if (!allRequirementsMet) {
                      setPasswordError('Please meet all password requirements');
                      return;
                    }
                    if (!passwordsMatch) {
                      setPasswordError('Passwords do not match');
                      return;
                    }
                    setPasswordLoading(true);
                    try {
                      await setPasswordMutation.mutateAsync({
                        password: passwordData.password,
                        confirmPassword: passwordData.confirmPassword,
                      });
                    } finally {
                      setPasswordLoading(false);
                    }
                  }}
                  disabled={!allRequirementsMet || !passwordsMatch || passwordLoading || setPasswordMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {passwordLoading || setPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    'Set Password'
                  )}
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading || submitMutation.isPending}
                  className="flex-1"
                >
                  {loading || submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Profile'
                  )}
                </Button>
              </div>

              {/* Info Text */}
              <p className="text-xs text-muted-foreground text-center">
                By submitting your profile, you agree to be contacted by our team regarding your selected services.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
