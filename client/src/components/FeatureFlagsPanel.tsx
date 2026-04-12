import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FeatureFlagsPanel() {
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState("");

  // Fetch all feature flags
  const { data: flags, isLoading, refetch } = trpc.featureFlags.getAllDetailed.useQuery();

  // Update flag mutation
  const updateFlagMutation = trpc.featureFlags.updateFlag.useMutation({
    onSuccess: () => {
      refetch();
      setChangeReason("");
      setSelectedFlag(null);
    },
  });

  // Create flag mutation
  const createFlagMutation = trpc.featureFlags.createFlag.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleFlag = async (flagName: string, currentEnabled: boolean) => {
    const flag = flags?.find((f) => f.flagName === flagName);
    if (!flag) return;

    await updateFlagMutation.mutateAsync({
      flagName,
      enabled: !currentEnabled,
      changeReason: changeReason || `Toggled ${flagName} to ${!currentEnabled ? "enabled" : "disabled"}`,
    });
  };

  const handleCreateClientLoginFlag = async () => {
    await createFlagMutation.mutateAsync({
      flagName: "clientLoginVisible",
      description: "Controls visibility of Client Login button in navigation",
      enabled: false,
      targetAudience: "all",
      rolloutPercentage: 100,
      changeReason: "Initial setup for Client Login visibility control",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const clientLoginFlag = flags?.find((f) => f.flagName === "clientLoginVisible");

  return (
    <div className="space-y-6">
      {/* Client Login Visibility Control */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🔐</span> Client Login Visibility
          </CardTitle>
          <CardDescription>
            Toggle the visibility of the Client Login button in the navigation menu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clientLoginFlag ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Client Login Button</h3>
                  <p className="text-sm text-gray-500">
                    Status: {clientLoginFlag.enabled ? "Visible" : "Hidden"}
                  </p>
                  {clientLoginFlag.changeReason && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last change: {clientLoginFlag.changeReason}
                    </p>
                  )}
                </div>
                <Switch
                  checked={clientLoginFlag.enabled}
                  onCheckedChange={() =>
                    handleToggleFlag("clientLoginVisible", clientLoginFlag.enabled)
                  }
                  disabled={updateFlagMutation.isPending}
                />
              </div>

              {/* Change Reason Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Reason for Change (Optional)
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g., Temporarily hiding for maintenance..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              {/* Status Messages */}
              {updateFlagMutation.isPending && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Updating feature flag...
                  </AlertDescription>
                </Alert>
              )}

              {updateFlagMutation.isSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Feature flag updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              {updateFlagMutation.isError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {updateFlagMutation.error?.message || "Failed to update feature flag"}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Client Login visibility flag not found. Create it to enable control.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleCreateClientLoginFlag}
                disabled={createFlagMutation.isPending}
                className="w-full"
              >
                {createFlagMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Client Login Flag"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Feature Flags */}
      {flags && flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Feature Flags</CardTitle>
            <CardDescription>Manage all active feature flags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flags.map((flag) => (
                <div key={flag.flagName} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{flag.flagName}</h4>
                    {flag.description && (
                      <p className="text-sm text-gray-500">{flag.description}</p>
                    )}
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>Audience: {flag.targetAudience}</span>
                      <span>Rollout: {flag.rolloutPercentage}%</span>
                    </div>
                  </div>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => handleToggleFlag(flag.flagName, flag.enabled)}
                    disabled={updateFlagMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
