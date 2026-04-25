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


  // Send verification email mutation
  const sendVerificationEmailMutation = trpc.emailVerification.sendVerificationEmail.useMutation();
  


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
                        onCheckedChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
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
