import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, Settings, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch admin data
  const statsQuery = trpc.admin.getStats.useQuery();
  const productStatsQuery = trpc.admin.getProductStats.useQuery();
  const recentActivityQuery = trpc.admin.getRecentActivity.useQuery({ limit: 10 });
  const clientSubmissionsQuery = trpc.admin.getClientSubmissions.useQuery({
    page: 1,
    limit: 10,
    search: searchQuery || undefined,
  });

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
            <p className="text-sm text-muted-foreground">
              You do not have permission to access this page. Only administrators can view the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const productStats = productStatsQuery.data;
  const recentActivity = recentActivityQuery.data;
  const clientSubmissions = clientSubmissionsQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage client submissions, configurations, and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">Registered clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">Form submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingReview || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Form completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Product Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Statistics</CardTitle>
                  <CardDescription>Form responses by product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {productStats && Object.entries(productStats).map(([product, count]) => (
                    <div key={product} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{product.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest submissions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{activity.product}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">{activity.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Submissions</CardTitle>
                <CardDescription>View and manage all client submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline">Search</Button>
                </div>

                {clientSubmissions && clientSubmissions.submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-2">Name</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Phone</th>
                          <th className="text-left py-2 px-2">Verified</th>
                          <th className="text-left py-2 px-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientSubmissions.submissions.map((submission: any) => (
                          <tr key={submission.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{submission.name}</td>
                            <td className="py-2 px-2">{submission.email}</td>
                            <td className="py-2 px-2">{submission.phone}</td>
                            <td className="py-2 px-2">
                              <Badge variant={submission.verified ? "default" : "secondary"}>
                                {submission.verified ? "Yes" : "No"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No submissions found</p>
                  </div>
                )}

                {clientSubmissions && clientSubmissions.total > clientSubmissions.limit && (
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {clientSubmissions.submissions.length} of {clientSubmissions.total}
                    </p>
                    <Button variant="outline" size="sm">Load More</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fact-Finding Forms</CardTitle>
                <CardDescription>View and manage form responses by product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {["protection", "pensions", "healthInsurance", "generalInsurance", "investments"].map(
                    (product: string) => (
                      <Card key={product} className="cursor-pointer hover:bg-accent">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="font-medium text-sm capitalize">{product.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-2xl font-bold mt-2">
                              {productStats?.[product as keyof typeof productStats] || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">responses</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage application settings and configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send notifications on new submissions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Form Settings</p>
                      <p className="text-sm text-muted-foreground">Manage form templates and fields</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">User Management</p>
                      <p className="text-sm text-muted-foreground">Manage admin users and permissions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">API Settings</p>
                      <p className="text-sm text-muted-foreground">Configure API keys and webhooks</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
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
