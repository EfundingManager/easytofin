import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Mail, Phone, AlertCircle, HelpCircle } from "lucide-react";
import { hasPermission } from "@shared/rolePermissions";

/**
 * Support Dashboard
 * 
 * Support staff can:
 * - View all clients and their details (read-only)
 * - View form submissions (read-only)
 * - Send emails to clients
 * - View activity logs (limited)
 * 
 * Support staff CANNOT:
 * - Edit client information
 * - Update KYC status
 * - Unlock accounts
 * - Edit or approve submissions
 * - Export client data
 * - View system metrics
 * - View security alerts
 * - Manage other staff
 */
export default function SupportDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading Support Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user is support
  if (user?.role !== "support") {
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
                You do not have permission to access the Support Dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const supportPermissions = {
    viewAllClients: hasPermission("support", "viewAllClients"),
    viewClientDetails: hasPermission("support", "viewClientDetails"),
    viewSubmissions: hasPermission("support", "viewSubmissions"),
    sendEmails: hasPermission("support", "sendEmails"),
    viewActivityLogs: hasPermission("support", "viewActivityLogs"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-8 w-8 text-purple-600" />
              Support Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Client support and assistance</p>
          </div>
          <Badge variant="default" className="bg-purple-600">
            Support Staff
          </Badge>
        </div>

        {/* Permission Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As Support staff, you can view client information, respond to inquiries, and send emails. 
            You have read-only access to most information. Contact a Manager or Admin for client modifications.
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">351</div>
              <p className="text-xs text-muted-foreground mt-1">Total in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">28</div>
              <p className="text-xs text-muted-foreground mt-1">Sent to clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">2.1h</div>
              <p className="text-xs text-muted-foreground mt-1">To client inquiries</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inquiries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inquiries">Client Inquiries</TabsTrigger>
            <TabsTrigger value="clients">Client Search</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="faq">FAQ & Resources</TabsTrigger>
          </TabsList>

          {/* Client Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Client Inquiries</CardTitle>
                <CardDescription>Respond to client questions and requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: 1, client: "John Smith", subject: "Question about pension options", time: "2 hours ago" },
                    { id: 2, client: "Sarah Johnson", subject: "Need help with health insurance", time: "4 hours ago" },
                    { id: 3, client: "Michael Brown", subject: "Document submission issue", time: "6 hours ago" },
                  ].map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{inquiry.client}</h4>
                          <p className="text-sm text-muted-foreground">{inquiry.subject}</p>
                          <p className="text-xs text-gray-400 mt-1">{inquiry.time}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">New</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Reply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Search Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Search</CardTitle>
                <CardDescription>Find and view client information (read-only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">Search</Button>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search for a client to view their information</p>
                  <p className="text-xs mt-2">Note: You have read-only access. Contact a Manager to make changes.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Communication</CardTitle>
                <CardDescription>Send emails to clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportPermissions.sendEmails && (
                  <div className="space-y-4">
                    <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                      <Mail className="h-4 w-4" />
                      Compose Email
                    </Button>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Recent Communications</h4>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 border rounded-lg text-sm">
                            <p className="font-medium">Email to Client {i}</p>
                            <p className="text-muted-foreground text-xs">Sent 2 hours ago</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ & Resources Tab */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FAQ & Support Resources</CardTitle>
                <CardDescription>Common questions and support documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { question: "How do I help a client with KYC verification?", answer: "Direct them to contact a Manager. Support staff cannot modify KYC status." },
                    { question: "What should I do if a client's account is locked?", answer: "Escalate to a Manager or Admin. Only they can unlock accounts." },
                    { question: "Can I view client submission details?", answer: "Yes, you can view submissions but cannot edit or approve them. Escalate approvals to a Manager." },
                    { question: "How do I send bulk emails?", answer: "Use the Email Communication feature. Bulk campaigns require Manager approval." },
                  ].map((faq, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
