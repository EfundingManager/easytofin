import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, Mail, Phone, FileText, Award, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";

export default function AdminCustomerDetail() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/customers/:customerId");
  const customerId = params?.customerId ? parseInt(params.customerId) : null;

  // Fetch customer details
  const customerQuery = trpc.admin.getCustomerDetail.useQuery(
    { customerId: customerId || 0 },
    { enabled: !!customerId }
  );

  // Redirect if not admin
  if (!loading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You do not have permission to access this page.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Customer Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/admin")} className="w-full">
                Back to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const customer = customerQuery.data;

  if (customerQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Customer Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The customer you're looking for doesn't exist.
              </p>
              <Button onClick={() => setLocation("/admin")} className="w-full">
                Back to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{customer.name}</CardTitle>
                <CardDescription>Customer ID: {customer.id}</CardDescription>
              </div>
              <Badge variant={customer.emailVerified ? "default" : "secondary"}>
                {customer.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{customer.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1">
                      {customer.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Policies, Documents, Forms */}
        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Policies</CardTitle>
                <CardDescription>All policies assigned to this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.policies && customer.policies.length > 0 ? (
                  <div className="space-y-3">
                    {customer.policies.map((policy: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-4 w-4 text-primary" />
                              <p className="font-medium">{policy.policyNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Product</p>
                                <p className="capitalize">{policy.product}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Insurer</p>
                                <p>{policy.insurer || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Premium</p>
                                <p>${policy.premium || "0.00"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Badge variant="outline" className="text-xs">
                                  {policy.status || "Active"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No policies assigned</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>Documents submitted by the customer</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.documents && customer.documents.length > 0 ? (
                  <div className="space-y-3">
                    {customer.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{doc.fileName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{doc.documentType}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {doc.status || "pending"}
                          </Badge>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fact-Finding Forms</CardTitle>
                <CardDescription>Completed fact-finding forms</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.forms && customer.forms.length > 0 ? (
                  <div className="space-y-3">
                    {customer.forms.map((form: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium capitalize">{form.product} Form</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {form.status || "completed"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(form.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No forms submitted</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
