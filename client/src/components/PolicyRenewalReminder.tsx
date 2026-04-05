import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, CheckCircle2, Bell } from "lucide-react";

interface RenewalPolicy {
  id: number;
  policyNumber: string;
  policyType: string;
  insurerName: string;
  renewalDate: Date | string;
  daysUntilRenewal: number;
  status: string;
}

interface PolicyRenewalReminderProps {
  renewals?: RenewalPolicy[];
  isLoading?: boolean;
}

const getRenewalUrgency = (daysUntilRenewal: number): "critical" | "warning" | "info" => {
  if (daysUntilRenewal <= 7) return "critical";
  if (daysUntilRenewal <= 30) return "warning";
  return "info";
};

const getRenewalBadgeVariant = (urgency: "critical" | "warning" | "info"): "default" | "secondary" | "outline" => {
  switch (urgency) {
    case "critical":
      return "default";
    case "warning":
      return "secondary";
    default:
      return "outline";
  }
};

const getRenewalBadgeLabel = (daysUntilRenewal: number): string => {
  if (daysUntilRenewal <= 0) return "Renewal Due";
  if (daysUntilRenewal === 1) return "Renews Tomorrow";
  if (daysUntilRenewal <= 7) return `Renews in ${daysUntilRenewal} days`;
  if (daysUntilRenewal <= 30) return `Renews in ${Math.ceil(daysUntilRenewal / 7)} weeks`;
  return `Renews in ${Math.ceil(daysUntilRenewal / 30)} months`;
};

const getRenewalColor = (urgency: "critical" | "warning" | "info"): string => {
  switch (urgency) {
    case "critical":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const getPolicyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    protection: "Protection",
    pensions: "Pensions",
    health_insurance: "Health Insurance",
    general_insurance: "General Insurance",
    investments: "Investments",
  };
  return labels[type] || type;
};

export function PolicyRenewalReminder({ renewals = [], isLoading = false }: PolicyRenewalReminderProps) {
  if (isLoading) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Upcoming Renewals
          </CardTitle>
          <CardDescription>Your policies renewing soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-yellow-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter and sort renewals by urgency
  const sortedRenewals = [...renewals]
    .filter((r) => r.daysUntilRenewal <= 90) // Show renewals within 90 days
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  if (sortedRenewals.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Renewal Status
          </CardTitle>
          <CardDescription>Your policies are up to date</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            No policies renewing in the next 90 days. We'll notify you when a renewal is coming up.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Upcoming Renewals
        </CardTitle>
        <CardDescription>
          {sortedRenewals.length} {sortedRenewals.length === 1 ? "policy" : "policies"} renewing soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRenewals.map((renewal) => {
            const urgency = getRenewalUrgency(renewal.daysUntilRenewal);
            const renewalDate = new Date(renewal.renewalDate);
            const isOverdue = renewal.daysUntilRenewal <= 0;

            return (
              <div
                key={renewal.id}
                className={`p-4 rounded-lg border-2 ${getRenewalColor(urgency)}`}
              >
                {/* Header with Policy Number and Urgency Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{renewal.policyNumber}</h3>
                      <Badge
                        variant={getRenewalBadgeVariant(urgency)}
                        className={`text-xs ${
                          urgency === "critical" ? "bg-red-600 text-white" : ""
                        }`}
                      >
                        {isOverdue ? (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {getRenewalBadgeLabel(renewal.daysUntilRenewal)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{getPolicyTypeLabel(renewal.policyType)}</p>
                  </div>
                </div>

                {/* Renewal Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Insurer</p>
                    <p className="text-sm font-medium">{renewal.insurerName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Renewal Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium">
                        {renewalDate.toLocaleDateString("en-IE", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  variant={urgency === "critical" ? "default" : "outline"}
                  className="w-full"
                >
                  {isOverdue ? "Renew Now" : "Review & Renew"}
                </Button>

                {/* Alert Message for Critical Renewals */}
                {urgency === "critical" && (
                  <div className="mt-3 p-2 rounded bg-red-100 border border-red-300">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ This policy is renewing very soon. Please take action to avoid coverage gaps.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {sortedRenewals.length > 0 && (
          <div className="mt-4 pt-4 border-t text-xs text-gray-600">
            <p>
              You have{" "}
              <strong>
                {sortedRenewals.filter((r) => r.daysUntilRenewal <= 7).length}
              </strong>{" "}
              {sortedRenewals.filter((r) => r.daysUntilRenewal <= 7).length === 1
                ? "policy"
                : "policies"}{" "}
              renewing within 7 days.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
