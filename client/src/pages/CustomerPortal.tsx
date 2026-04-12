import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, LogOut, FileText, BarChart3, Calendar, DollarSign, Bell, Download, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Customer Portal - For KYC-approved customers
 * Accessible via /customer/:customerId
 * Comprehensive dashboard for managing policies, viewing documents, and exploring services
 */
export default function CustomerPortal() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const fullUserQuery = trpc.auth.getFullUserInfo.useQuery();
  const policiesQuery = trpc.policies.getClientPolicies.useQuery();
  const [selectedTab, setSelectedTab] = useState<"overview" | "policies" | "documents" | "support">("overview");

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleBrowseProducts = (product: string) => {
    navigate(`/${product.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name || "Customer"}!</h1>
            <p className="text-sm text-muted-foreground">Manage your policies and account</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Verified Customer Badge */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Verified Customer Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              Your account has been verified and approved. You have full access to all our services and products.
            </p>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                  <p className="font-semibold text-sm">{user.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-xs break-all">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
                  <p className="font-semibold text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <Button variant="outline" className="w-full text-sm" size="sm">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Active Policies</p>
                      <p className="font-bold text-lg">{policiesData.length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Status</p>
                      <p className="font-bold text-sm">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">No active alerts</p>
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Policies Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Your Policies
                    </CardTitle>
                    <CardDescription>
                      View and manage all your active insurance policies
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {policiesData.length > 0 ? (
                  <div className="space-y-3">
                    {policiesData.map((policy: any) => (
                      <div key={policy.id} className="p-4 border rounded-lg hover:bg-muted/50 transition cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{policy.policyNumber || "Policy"}</p>
                            <p className="text-sm text-muted-foreground">{policy.product || "Insurance Product"}</p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Premium: €{policy.premium || "N/A"}</span>
                          <span>Renewal: {policy.renewalDate || "N/A"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground mb-4">No active policies yet</p>
                    <Button onClick={() => handleBrowseProducts("Protection")}>
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-xs">
                    <Download className="h-5 w-5" />
                    <span>Documents</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-xs">
                    <Calendar className="h-5 w-5" />
                    <span>Renewals</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-xs">
                    <DollarSign className="h-5 w-5" />
                    <span>Claims</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-xs">
                    <AlertCircle className="h-5 w-5" />
                    <span>Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Explore Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Explore More Services
                </CardTitle>
                <CardDescription>
                  Expand your coverage with our comprehensive insurance products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-3"
                    onClick={() => handleBrowseProducts("Protection")}
                  >
                    <FileText className="h-8 w-8" />
                    <span className="font-medium">Protection</span>
                    <span className="text-xs text-muted-foreground">Life & Income Protection</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-3"
                    onClick={() => handleBrowseProducts("Pensions")}
                  >
                    <Calendar className="h-8 w-8" />
                    <span className="font-medium">Pensions</span>
                    <span className="text-xs text-muted-foreground">Retirement Planning</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-3"
                    onClick={() => handleBrowseProducts("Health-Insurance")}
                  >
                    <CheckCircle2 className="h-8 w-8" />
                    <span className="font-medium">Health Insurance</span>
                    <span className="text-xs text-muted-foreground">Medical Coverage</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is available 24/7 to assist you with any questions.
                </p>
              </div>
              <Button>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
