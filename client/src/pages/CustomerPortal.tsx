import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, LogOut, FileText, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Customer Portal - For KYC-approved customers
 * Accessible via /customer/:customerId
 */
export default function CustomerPortal() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const fullUserQuery = trpc.auth.getFullUserInfo.useQuery();
  const policiesQuery = trpc.policies.getClientPolicies.useQuery();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/email-auth");
    }
  }, [loading, user, navigate]);

  // If user is not a customer, redirect to user portal
  useEffect(() => {
    const fullUser = fullUserQuery.data as any;
    if (fullUser && fullUser.clientStatus !== "customer" && fullUser?.id) {
      navigate(`/user/${fullUser.id}`);
    }
  }, [fullUserQuery.data, navigate]);

  if (loading || fullUserQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to access your account.
            </p>
            <Button onClick={() => navigate("/email-auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullUser = fullUserQuery.data as any;
  const policiesData = policiesQuery.data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name || "Customer"}!</h1>
            <p className="text-muted-foreground mt-2">
              Manage your policies and account settings
            </p>
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

        {/* Customer Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Verified Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              Your account has been verified and approved. You now have full access to all our services and products.
            </p>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all text-sm">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Policies</span>
                  <span className="font-bold text-lg">{policiesData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Policies & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policies Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Policies
                </CardTitle>
                <CardDescription>
                  View and manage all your active insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policiesData.length > 0 ? (
                  <div className="space-y-3">
                    {policiesData.map((policy: any) => (
                      <div key={policy.id} className="p-3 border rounded-lg hover:bg-muted/50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{policy.policyNumber || "Policy"}</p>
                            <p className="text-sm text-muted-foreground">{policy.product || "Insurance Product"}</p>
                          </div>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No active policies yet</p>
                    <Button variant="outline" className="mt-4">
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    View Documents
                  </Button>
                  <Button variant="outline" className="w-full">
                    Claims
                  </Button>
                  <Button variant="outline" className="w-full">
                    Renewals
                  </Button>
                  <Button variant="outline" className="w-full">
                    Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Explore More Services
            </CardTitle>
            <CardDescription>
              Expand your coverage with our other insurance products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Protection</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Pensions</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Health Insurance</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
