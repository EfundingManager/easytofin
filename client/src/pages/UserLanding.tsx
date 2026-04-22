import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Loader2, LogOut, User, Mail, Phone, Shield, TrendingUp, Heart, Home as HomeIcon } from 'lucide-react';

const SERVICES = [
  {
    id: 'protection',
    icon: <Shield className="w-8 h-8" />,
    title: 'Life Protection',
    description: 'Life assurance and protection coverage',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    id: 'pensions',
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Pensions',
    description: 'Retirement planning and pension schemes',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  },
  {
    id: 'healthInsurance',
    icon: <Heart className="w-8 h-8" />,
    title: 'Health Insurance',
    description: 'Private medical insurance',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
  {
    id: 'generalInsurance',
    icon: <HomeIcon className="w-8 h-8" />,
    title: 'General Insurance',
    description: 'Home, motor, and business insurance',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    id: 'investments',
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Investments',
    description: 'Savings and investment solutions',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
  },
];

export default function UserLanding() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation('/email-auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user.name || 'User'}!</h1>
            <p className="text-muted-foreground mt-2">Explore our financial services and get expert advice</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">Active User</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Our Services</h2>
            <p className="text-muted-foreground mt-1">Explore the financial services we offer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <Card key={service.id} className={`border-2 ${service.color}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-3 ${service.iconColor}`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => setLocation(`/service/${service.id}`)}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-900">
            <p>1. Complete your profile to unlock personalized recommendations</p>
            <p>2. Explore our services to find solutions that fit your needs</p>
            <p>3. Schedule a consultation with our financial advisors</p>
            <Button className="w-full mt-4" onClick={() => setLocation('/profile')}>
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
