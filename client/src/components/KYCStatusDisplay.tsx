import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Edit2, X } from "lucide-react";

interface KYCStatusDisplayProps {
  customerId: number;
  currentStatus: "pending" | "verified" | "rejected";
  onStatusUpdate?: () => void;
}

export function KYCStatusDisplay({
  customerId,
  currentStatus,
  onStatusUpdate,
}: KYCStatusDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "verified" | "rejected">(currentStatus);

  const updateMutation = trpc.admin.updateKycStatus.useMutation();

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      description: "Awaiting KYC verification",
    },
    verified: {
      icon: CheckCircle2,
      label: "Verified",
      color: "bg-green-50 text-green-700 border-green-200",
      description: "KYC verification completed",
    },
    rejected: {
      icon: AlertCircle,
      label: "Rejected",
      color: "bg-red-50 text-red-700 border-red-200",
      description: "KYC verification failed",
    },
  };

  const currentConfig = statusConfig[currentStatus] || statusConfig.pending;
  const CurrentIcon = currentConfig?.icon || Clock;

  const handleStatusChange = async (newStatus: "pending" | "verified" | "rejected") => {
    try {
      await updateMutation.mutateAsync({
        customerId,
        kycStatus: newStatus,
      });
      setIsEditing(false);
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to update KYC status:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">KYC Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-4">
            {/* Current Status Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <CurrentIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">{currentConfig.label}</p>
                  <p className="text-xs text-gray-600">{currentConfig.description}</p>
                </div>
              </div>
              <Badge className={`${currentConfig.color} border`}>
                {currentConfig.label}
              </Badge>
            </div>

            {/* Edit Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Edit2 className="h-3 w-3 mr-2" />
              Change Status
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Select New Status</p>
              <div className="space-y-2">
                {(["pending", "verified", "rejected"] as const).map((status) => {
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        selectedStatus === status
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-gray-600">{config.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={updateMutation.isPending || selectedStatus === currentStatus}
                className="flex-1"
              >
                {updateMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedStatus(currentStatus);
                }}
                disabled={updateMutation.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
