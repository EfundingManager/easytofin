import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Send, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CampaignStep {
  step: "template" | "recipients" | "schedule" | "review";
  title: string;
  description: string;
}

const CAMPAIGN_STEPS: CampaignStep[] = [
  { step: "template", title: "Select Template", description: "Choose an email template" },
  { step: "recipients", title: "Recipients", description: "Select recipient list" },
  { step: "schedule", title: "Schedule", description: "Set send time" },
  { step: "review", title: "Review", description: "Review and send" },
];

const ROLES = ["user", "admin", "manager", "staff", "super_admin"] as const;
const CLIENT_STATUSES = ["queue", "in_progress", "assigned", "customer"] as const;
const KYC_STATUSES = ["pending", "submitted", "verified", "rejected"] as const;

export function EmailCampaignComposer() {
  const [currentStep, setCurrentStep] = useState<"template" | "recipients" | "schedule" | "review">("template");
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<any>(null);
  const [recipientFilter, setRecipientFilter] = useState({
    roles: [] as typeof ROLES[number][],
    clientStatus: [] as typeof CLIENT_STATUSES[number][],
    kycStatus: [] as typeof KYC_STATUSES[number][],
  });
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("09:00");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch templates
  const { data: templates = [] } = trpc.emailBlaster.getAllTemplates.useQuery();
  const createCampaign = trpc.emailCampaign.createCampaign.useMutation();

  const handleRoleToggle = (role: typeof ROLES[number]) => {
    setRecipientFilter((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }));
  };

  const handleClientStatusToggle = (status: typeof CLIENT_STATUSES[number]) => {
    setRecipientFilter((prev) => ({
      ...prev,
      clientStatus: prev.clientStatus.includes(status)
        ? prev.clientStatus.filter((s) => s !== status)
        : [...prev.clientStatus, status],
    }));
  };

  const handleKycStatusToggle = (status: typeof KYC_STATUSES[number]) => {
    setRecipientFilter((prev) => ({
      ...prev,
      kycStatus: prev.kycStatus.includes(status)
        ? prev.kycStatus.filter((s) => s !== status)
        : [...prev.kycStatus, status],
    }));
  };

  const handleCreateCampaign = async () => {
    if (!selectedTemplate || !campaignName || !subject) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const scheduledDateTime = scheduledAt
        ? new Date(`${scheduledAt}T${scheduledTime}`)
        : undefined;

      await createCampaign.mutateAsync({
        templateId: selectedTemplate,
        campaignName,
        subject,
        recipientFilter,
        scheduledAt: scheduledDateTime,
      });

      // Reset form
      setCampaignName("");
      setSubject("");
      setSelectedTemplate(null);
      setRecipientFilter({ roles: [], clientStatus: [], kycStatus: [] });
      setScheduledAt("");
      setScheduledTime("09:00");
      setCurrentStep("template");

      alert("Campaign created successfully!");
    } catch (error) {
      alert(`Failed to create campaign: ${(error as any).message}`);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "template":
        return selectedTemplate && campaignName && subject;
      case "recipients":
        return recipientFilter.roles.length > 0 || recipientFilter.clientStatus.length > 0;
      case "schedule":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CAMPAIGN_STEPS.map((s, idx) => (
          <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setCurrentStep(s.step)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                currentStep === s.step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {idx + 1}
            </button>
            {idx < CAMPAIGN_STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-300 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{CAMPAIGN_STEPS.find((s) => s.step === currentStep)?.title}</CardTitle>
          <CardDescription>
            {CAMPAIGN_STEPS.find((s) => s.step === currentStep)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          {currentStep === "template" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Q2 Marketing Campaign"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Special Offer Inside"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="template">Select Template *</Label>
                <Select
                  value={selectedTemplate?.toString() || ""}
                  onValueChange={(val) => {
                    const templateId = parseInt(val);
                    setSelectedTemplate(templateId);
                    setSelectedTemplateObj(templates.find((t: any) => t.id === templateId));
                  }}
                >
                  <SelectTrigger id="template" className="mt-2">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateObj && (
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Preview Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedTemplateObj.name}</DialogTitle>
                      <DialogDescription>{selectedTemplateObj.category}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Subject</p>
                        <p className="mt-1">{selectedTemplateObj.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Preview</p>
                        <iframe
                          srcDoc={selectedTemplateObj.htmlContent}
                          className="w-full border rounded-lg mt-2"
                          style={{ height: "400px" }}
                          title="Email Preview"
                          sandbox={{} as any}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {/* Recipients Selection */}
          {currentStep === "recipients" && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Filter by Role</Label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={recipientFilter.roles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <Label htmlFor={`role-${role}`} className="capitalize cursor-pointer">
                        {role.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Filter by Client Status</Label>
                <div className="space-y-2">
                  {CLIENT_STATUSES.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={recipientFilter.clientStatus.includes(status)}
                        onCheckedChange={() => handleClientStatusToggle(status)}
                      />
                      <Label htmlFor={`status-${status}`} className="capitalize cursor-pointer">
                        {status.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Filter by KYC Status</Label>
                <div className="space-y-2">
                  {KYC_STATUSES.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`kyc-${status}`}
                        checked={recipientFilter.kycStatus.includes(status)}
                        onCheckedChange={() => handleKycStatusToggle(status)}
                      />
                      <Label htmlFor={`kyc-${status}`} className="capitalize cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule */}
          {currentStep === "schedule" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Leave empty to send immediately, or select a date and time to schedule for later.
                </p>
              </div>

              <div>
                <Label htmlFor="schedule-date">Send Date (Optional)</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-2"
                />
              </div>

              {scheduledAt && (
                <div>
                  <Label htmlFor="schedule-time">Send Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Review */}
          {currentStep === "review" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Campaign Name</p>
                  <p className="font-semibold">{campaignName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-semibold">{subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Template</p>
                  <p className="font-semibold">
                    {templates.find((t: any) => t.id === selectedTemplate)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recipients</p>
                  <p className="font-semibold">
                    {recipientFilter.roles.length > 0 && `Roles: ${recipientFilter.roles.join(", ")}`}
                    {recipientFilter.clientStatus.length > 0 &&
                      ` | Status: ${recipientFilter.clientStatus.join(", ")}`}
                  </p>
                </div>
                {scheduledAt && (
                  <div>
                    <p className="text-sm text-gray-600">Scheduled For</p>
                    <p className="font-semibold">
                      {new Date(`${scheduledAt}T${scheduledTime}`).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const currentIdx = CAMPAIGN_STEPS.findIndex((s) => s.step === currentStep);
            if (currentIdx > 0) {
              setCurrentStep(CAMPAIGN_STEPS[currentIdx - 1].step);
            }
          }}
          disabled={currentStep === "template"}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep !== "review" && (
            <Button
              onClick={() => {
                const currentIdx = CAMPAIGN_STEPS.findIndex((s) => s.step === currentStep);
                if (currentIdx < CAMPAIGN_STEPS.length - 1) {
                  setCurrentStep(CAMPAIGN_STEPS[currentIdx + 1].step);
                }
              }}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}

          {currentStep === "review" && (
            <Button
              onClick={handleCreateCampaign}
              disabled={createCampaign.isPending}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              {createCampaign.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
