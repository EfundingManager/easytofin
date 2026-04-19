import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Mail, Send } from "lucide-react";


interface Template {
  id: string;
  name: string;
  subject: string;
  description: string;
}

interface Recipient {
  id: number;
  name: string;
  email: string;
  type: string;
}

export default function EmailBlasterPage() {
  const showToast = (title: string, description: string, variant?: string) => {
    console.log(`[${variant || 'info'}] ${title}: ${description}`);
    alert(`${title}\n${description}`);
  };
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [recipientType, setRecipientType] = useState<string>("all_clients");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Mock templates - in production these would come from the backend
  const templates: Template[] = [
    {
      id: "welcome",
      name: "Welcome Email",
      subject: "Welcome to EasyToFin",
      description: "Send welcome email to new clients",
    },
    {
      id: "kyc_reminder",
      name: "KYC Reminder",
      subject: "Complete Your KYC Verification",
      description: "Remind clients to complete KYC verification",
    },
    {
      id: "policy_update",
      name: "Policy Update",
      subject: "Important Policy Update",
      description: "Notify clients about policy updates",
    },
    {
      id: "renewal_reminder",
      name: "Renewal Reminder",
      subject: "Your Policy Renewal is Due",
      description: "Send renewal reminders to clients",
    },
  ];

  // Mock recipients - in production these would come from the backend
  const mockRecipients: Recipient[] = [
    { id: 1, name: "John Doe", email: "john@example.com", type: "client" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", type: "client" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", type: "client" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", type: "client" },
    { id: 5, name: "Charlie Wilson", email: "charlie@example.com", type: "client" },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
    }
  };

  const handleRecipientToggle = (recipientId: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === mockRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(mockRecipients.map((r) => r.id));
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      showToast("Error", "Please enter an email subject", "destructive");
      return;
    }

    if (!content.trim()) {
      showToast("Error", "Please enter email content", "destructive");
      return;
    }

    if (selectedRecipients.length === 0) {
      showToast("Error", "Please select at least one recipient", "destructive");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = {
        success: true,
        successCount: selectedRecipients.length,
        failureCount: 0,
        message: `Successfully sent ${selectedRecipients.length} email(s)`,
      };

      setSendResult(result);
      showToast("Success", result.message);

      // Reset form
      setSubject("");
      setContent("");
      setSelectedRecipients([]);
      setSelectedTemplate("");
    } catch (error: any) {
      showToast("Error", error.message || "Failed to send emails", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Email Blaster</h1>
            <p className="text-muted-foreground">Send bulk emails to clients and team members</p>
          </div>
        </div>
      </div>

      {/* Send Result Alert */}
      {sendResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{sendResult.message}</p>
                <p className="text-sm text-green-700">
                  {sendResult.successCount} sent, {sendResult.failureCount} failed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Template & Recipients */}
            <div className="space-y-6 lg:col-span-1">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Template</CardTitle>
                  <CardDescription>Choose a pre-built template or start fresh</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Recipient Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recipient Type</CardTitle>
                  <CardDescription>Filter recipients by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_clients">All Clients</SelectItem>
                      <SelectItem value="pending_kyc">Pending KYC</SelectItem>
                      <SelectItem value="verified_clients">Verified Clients</SelectItem>
                      <SelectItem value="team_members">Team Members</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Email Compose */}
            <div className="space-y-6 lg:col-span-2">
              {/* Subject */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="text-base"
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Content</CardTitle>
                  <CardDescription>
                    Use HTML or plain text. You can include variables like {"{name}"} and {"{email}"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter email content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-64 font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recipients List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recipients</CardTitle>
                  <span className="text-sm font-semibold text-primary">
                    {selectedRecipients.length}/{mockRecipients.length}
                  </span>
                </div>
                <CardDescription>Select recipients to send to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="w-full"
                >
                  {selectedRecipients.length === mockRecipients.length ? "Deselect All" : "Select All"}
                </Button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mockRecipients.map((recipient) => (
                    <label
                      key={recipient.id}
                      className="flex items-center gap-3 rounded-lg border p-2 cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(recipient.id)}
                        onChange={() => handleRecipientToggle(recipient.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{recipient.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
                <CardDescription>This is how your email will appear</CardDescription>
              </CardHeader>
              <CardContent>
                {subject || content ? (
                  <div className="space-y-4 rounded-lg border bg-background p-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">SUBJECT:</p>
                      <p className="text-base font-semibold">{subject || "(No subject)"}</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">CONTENT:</p>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {content || "(No content)"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                    <div>
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No email content to preview. Go to the Compose tab to create your email.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSendResult(null)}>
              Back to Compose
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isLoading || !subject || !content || selectedRecipients.length === 0}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
