import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, CheckCircle2, Clock, FileText, Download, Mail, AlertCircle } from "lucide-react";
import { hasPermission } from "@shared/rolePermissions";

/**
 * Manager Dashboard
 * 
 * Managers can:
 * - View all clients and their details
 * - Review and update KYC status
 * - View and edit form submissions
 * - Approve submissions
 * - Send emails to clients
 * - Export client data
 * - View activity logs
 * - View reports
 * 
 * Managers CANNOT:
 * - Unlock accounts (admin only)
 * - View system metrics
 * - Manage other admins/managers
 * - Configure system settings
 * - Create reports
 */
export default function ManagerDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading Manager Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user is manager
  if (user?.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You do not have permission to access the Manager Dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const managerPermissions = {
    viewAllClients: hasPermission("manager", "viewAllClients"),
    updateKYCStatus: hasPermission("manager", "updateKYCStatus"),
    viewSubmissions: hasPermission("manager", "viewSubmissions"),
    editSubmissions: hasPermission("manager", "editSubmissions"),
    approveSubmissions: hasPermission("manager", "approveSubmissions"),
    sendEmails: hasPermission("manager", "sendEmails"),
    exportClientData: hasPermission("manager", "exportClientData"),
    viewActivityLogs: hasPermission("manager", "viewActivityLogs"),
    viewReports: hasPermission("manager", "viewReports"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage clients, KYC reviews, and submissions</p>
          </div>
          <Badge variant="default" className="bg-blue-600">
            Manager
          </Badge>
        </div>

        {/* Permission Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As a Manager, you can review and update KYC status, manage submissions, and export client data. 
            Account unlocking and system configuration require Admin privileges.
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">351</div>
              <p className="text-xs text-muted-foreground mt-1">Under management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">24</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">18</div>
              <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">127</div>
              <p className="text-xs text-muted-foreground mt-1">KYC completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kyc" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kyc">KYC Reviews</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* KYC Reviews Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>KYC Review Queue</CardTitle>
                <CardDescription>
                  {managerPermissions.updateKYCStatus 
                    ? "Review and update client KYC status" 
                    : "View-only access to KYC records"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Client {i} - Pending Verification</h4>
                        <p className="text-sm text-muted-foreground">Submitted 2 days ago</p>
                      </div>
                      {managerPermissions.updateKYCStatus && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Review</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
                <CardDescription>
                  {managerPermissions.approveSubmissions
                    ? "Review and approve client form submissions"
                    : "View client submissions"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Fact-Finding Form - Client {i}</h4>
                          <p className="text-sm text-muted-foreground">Protection Insurance</p>
                        </div>
                      </div>
                      {managerPermissions.approveSubmissions && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Review</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>View and manage client information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Client search and management interface</p>
                  {managerPermissions.exportClientData && (
                    <Button size="sm" className="mt-4 gap-2">
                      <Download className="h-4 w-4" />
                      Export Clients
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Communications</CardTitle>
                <CardDescription>
                  {managerPermissions.sendEmails
                    ? "Send emails and manage communications"
                    : "View communication history"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {managerPermissions.sendEmails && (
                  <div className="space-y-4">
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                      <Mail className="h-4 w-4" />
                      Send Email Campaign
                    </Button>
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Email templates and communication history</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View performance reports and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">KYC Completion Rate</h4>
                    <p className="text-2xl font-bold text-green-600">36%</p>
                    <p className="text-sm text-muted-foreground mt-1">127 of 351 clients verified</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Submission Approval Rate</h4>
                    <p className="text-2xl font-bold text-blue-600">89%</p>
                    <p className="text-sm text-muted-foreground mt-1">Average approval time: 2.3 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
