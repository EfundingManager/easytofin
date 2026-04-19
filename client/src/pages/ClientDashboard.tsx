import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, FileText, Settings, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Client Dashboard
 * Landing page for newly registered clients
 * Displays profile status, form progress, and quick actions
 */
export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch client profile data
  const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch form progress - placeholder for now
  const formProgress: any[] = [];
  const progressLoading = false;

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Not Authenticated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to access your dashboard.
            </p>
            <Button onClick={() => setLocation("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {user.name || "Client"}!</h1>
          <p className="text-muted-foreground">
            Your EasyToFin dashboard — manage your profile, complete forms, and track your progress.
          </p>
        </div>

        {/* Profile Status Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Profile Status
            </CardTitle>
            <CardDescription>Your account information and verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{user.name || "Not set"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg font-semibold">{user.email || "Not set"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg font-semibold">{(profile as any)?.phone || "Not set"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                <Badge className={`w-fit ${getStatusColor((profile as any)?.kycStatus || "pending")}`}>
                  {(profile as any)?.kycStatus ? (profile as any).kycStatus.charAt(0).toUpperCase() + (profile as any).kycStatus.slice(1) : "Pending"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setLocation("/profile")}
                className="gap-2"
              >
                Edit Profile <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Progress Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Your Forms</h2>
            <p className="text-muted-foreground">Complete your fact-finding forms to get personalized recommendations</p>
          </div>

          {progressLoading ? (
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ) : formProgress && formProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formProgress.map((form: any) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{form.productType}</CardTitle>
                    <CardDescription>
                      {form.status === "completed"
                        ? "Form completed"
                        : `${form.completionPercentage}% complete`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{form.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${form.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={`w-fit capitalize ${
                        form.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : form.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {form.status === "in_progress" ? "In Progress" : form.status}
                    </Badge>

                    {/* Action Button */}
                    <Button
                      onClick={() => setLocation(`/fact-finding-form?product=${form.productType}`)}
                      className="w-full gap-2"
                    >
                      {form.status === "completed" ? "View" : "Continue"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No forms started yet</p>
                <Button onClick={() => setLocation("/fact-finding-form")} className="gap-2">
                  Start Your First Form <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/profile")}>
              <CardHeader className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Update your personal information and preferences
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/fact-finding-form")}>
              <CardHeader className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Complete Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Fill out fact-finding forms for our services
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <CardHeader className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">View Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Track your application progress and status
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              If you have any questions about completing your forms or our services, please don't hesitate to reach out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.href = "mailto:info@easytofin.com"}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
