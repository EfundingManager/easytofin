import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import FormProgress from '@/components/FormProgress';
import { useLocation } from 'wouter';
import { Mail, Phone, User, FileText, Award, LogOut, Edit2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';
import { ClientPoliciesWidget } from '@/components/ClientPoliciesWidget';
import { PolicyRenewalReminder } from '@/components/PolicyRenewalReminder';
import { useAuth } from '@/_core/hooks/useAuth';
import { KYCPDFExportButton } from '@/components/KYCPDFExportButton';

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const profileQuery = trpc.profile.getProfile.useQuery();
  const progressQuery = trpc.profileProgress.getFormProgress.useQuery();
  const policiesQuery = trpc.policies.getClientPolicies.useQuery();
  const renewalsQuery = trpc.policies.getUpcomingRenewals.useQuery();

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
            <Button onClick={() => setLocation('/phone-auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = profileQuery.data?.data;
  const progressData = progressQuery.data?.data;
  const policiesData = policiesQuery.data?.data || [];
  const renewalsData = renewalsQuery.data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome Back, {profileData?.user?.name || 'User'}!</h1>
            <p className="text-muted-foreground mt-2">Manage your profile and track your fact-finding progress</p>
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.user ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{profileData.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="break-all">{profileData.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profileData.user.phone}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Email Status</span>
                        <Badge variant={profileData.user.emailVerified ? 'default' : 'secondary'}>
                          {profileData.user.emailVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Account Status</span>
                        <Badge variant="outline" className="capitalize">
                          {profileData.user.clientStatus || 'new'}
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-3 border-t space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setLocation('/profile')}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                      <KYCPDFExportButton
                        variant="outline"
                        size="sm"
                        className="w-full"
                        showLabel={true}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading profile information...</p>
                )}
              </CardContent>
            </Card>

            {/* Selected Services Card */}
            {profileData?.selectedServices && profileData.selectedServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.selectedServices.map((service: string) => (
                      <Badge key={service} variant="secondary" className="block w-full text-center py-2">
                        {service.charAt(0).toUpperCase() + service.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Progress & Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Progress */}
            {progressData && (
              <FormProgress
                progress={progressData.progress}
                completedCount={progressData.completedCount}
                totalCount={progressData.totalCount}
                completionPercentage={progressData.completionPercentage}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progressData && progressData.completionPercentage < 100 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      You have {progressData.totalCount - progressData.completedCount} fact-finding form{progressData.totalCount - progressData.completedCount !== 1 ? 's' : ''} remaining.
                    </p>
                    <Button
                      onClick={() => setLocation('/fact-finding')}
                      className="w-full"
                    >
                      Continue Fact-Finding Forms
                    </Button>
                  </>
                ) : (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-900">
                      <strong>✅ All forms completed!</strong> Our team is reviewing your information and will contact you shortly with personalized recommendations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {profileData?.user?.createdAt
                      ? new Date(profileData.user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {profileData?.user?.updatedAt
                      ? new Date(profileData.user.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Renewal Reminders Section */}
        <div className="mt-8">
          <PolicyRenewalReminder renewals={renewalsData} isLoading={renewalsQuery.isLoading} />
        </div>

        {/* Policies Section */}
        <div className="mt-8">
          <ClientPoliciesWidget policies={policiesData} isLoading={policiesQuery.isLoading} />
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="max-w-6xl mx-auto mt-8">
        <DocumentUpload />
      </div>
    </div>
  );
}
