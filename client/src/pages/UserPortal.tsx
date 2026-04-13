import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, FileText, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { KycForm } from "@/components/KycForm";

/**
 * User Portal - For registered users who haven't been approved as customers yet
 * Accessible via /user/:userId
 */
export default function UserPortal() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showKycForm, setShowKycForm] = useState(false);
  const fullUserQuery = trpc.auth.getFullUserInfo.useQuery();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/email-auth");
    }
  }, [loading, user, navigate]);

  // If user is a customer, redirect to customer portal
  useEffect(() => {
    const fullUser = fullUserQuery.data as any;
    if (fullUser?.clientStatus === "customer" && fullUser?.id) {
      navigate(`/customer/${fullUser.id}`);
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
  const clientStatus = fullUser?.clientStatus || "queue";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name || "User"}!</h1>
            <p className="text-muted-foreground mt-2">
              Your account is being processed. Complete the steps below to become a verified customer.
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

        {/* Status Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Current Status</p>
                    <p className="text-xs text-muted-foreground">
                      {clientStatus === "queue"
                        ? "Pending Review"
                        : clientStatus === "in_progress"
                        ? "In Progress"
                        : clientStatus === "assigned"
                        ? "Policy Assigned"
                        : "Customer"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      {clientStatus.replace("_", " ").toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Your application is being reviewed by our team. You'll be notified once your status changes.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{user.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Form or Progress Steps */}
        {showKycForm ? (
          <KycForm
            onSuccess={() => {
              setShowKycForm(false);
              fullUserQuery.refetch();
            }}
            onCancel={() => setShowKycForm(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Journey to Verified Customer</CardTitle>
              <CardDescription>
                Follow these steps to complete your registration and become a verified customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
                      ✓
                    </div>
                    <div className="w-0.5 h-12 bg-muted my-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Step 1: Account Created</p>
                    <p className="text-sm text-muted-foreground">Your account has been successfully created</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div className="w-0.5 h-12 bg-muted my-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Step 2: KYC Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your KYC (Know Your Customer) verification to proceed.
                    </p>
                    <Button
                      onClick={() => setShowKycForm(true)}
                      className="mt-3"
                      size="sm"
                    >
                      Start KYC Verification
                    </Button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div className="w-0.5 h-12 bg-muted my-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Step 3: Under Review</p>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your KYC application. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div className="w-0.5 h-12 bg-muted my-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Step 4: Policy Assignment</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, we'll assign your policy and provide you with full access to our services.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
                      5
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Step 5: Verified Customer</p>
                    <p className="text-sm text-muted-foreground">
                      Access your customer portal, manage policies, and enjoy all our services.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have any questions about your application status or need assistance, please contact our support team.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1">
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
