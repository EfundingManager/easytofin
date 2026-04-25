import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send } from "lucide-react";
import { EmailBlasterPanel } from "@/components/EmailBlasterPanel";
import { EmailCampaignComposer } from "@/components/EmailCampaignComposer";
import { AlertCircle } from "lucide-react";

export default function EmailBlasterPage() {
  const { user, loading } = useAuth();

  // Redirect if not admin
  if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
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
              You do not have permission to access this page. Only administrators can access the Email Blaster.
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
          <p className="mt-4 text-muted-foreground">Loading Email Blaster...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Email Blaster</h1>
          </div>
          <p className="text-muted-foreground">
            Manage email campaigns and send targeted messages to your clients
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="blaster" className="space-y-4">
          <TabsList>
            <TabsTrigger value="blaster" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Email Blaster
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Email Blaster Tab */}
          <TabsContent value="blaster" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Blaster</CardTitle>
                <CardDescription>
                  Send immediate emails to selected clients or groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailBlasterPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaign Composer</CardTitle>
                <CardDescription>
                  Create and schedule email campaigns for your clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailCampaignComposer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
