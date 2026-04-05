import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Phone, User, Building2 } from "lucide-react";

interface Policy {
  id: number;
  policyNumber: string;
  policyType: string;
  insurerName: string;
  premium: number;
  effectiveDate: Date | string;
  renewalDate: Date | string;
  status: string;
  advisorName?: string;
  advisorPhone?: string;
  advisorEmail?: string;
}

interface ClientPoliciesWidgetProps {
  policies?: Policy[];
  isLoading?: boolean;
}

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

const getPolicyTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    protection: "bg-blue-50 border-blue-200",
    pensions: "bg-purple-50 border-purple-200",
    health_insurance: "bg-green-50 border-green-200",
    general_insurance: "bg-orange-50 border-orange-200",
    investments: "bg-amber-50 border-amber-200",
  };
  return colors[type] || "bg-gray-50 border-gray-200";
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
  switch (status?.toLowerCase()) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

export function ClientPoliciesWidget({ policies = [], isLoading = false }: ClientPoliciesWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Policies
          </CardTitle>
          <CardDescription>View all your assigned policies and advisor information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Your Policies
        </CardTitle>
        <CardDescription>View all your assigned policies and advisor information</CardDescription>
      </CardHeader>
      <CardContent>
        {policies && policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className={`p-4 rounded-lg border-2 ${getPolicyTypeColor(policy.policyType)}`}
              >
                {/* Header with Policy Number and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{policy.policyNumber}</h3>
                      <Badge variant={getStatusBadgeVariant(policy.status)} className="capitalize text-xs">
                        {policy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{getPolicyTypeLabel(policy.policyType)}</p>
                  </div>
                </div>

                {/* Policy Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                  {/* Insurer Name */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Insurer Name</p>
                    <p className="text-sm font-medium">{policy.insurerName}</p>
                  </div>

                  {/* Policy Type */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Policy Type</p>
                    <p className="text-sm font-medium">{getPolicyTypeLabel(policy.policyType)}</p>
                  </div>

                  {/* Premium */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Premium</p>
                    <p className="text-sm font-medium">€{policy.premium?.toFixed(2) || "N/A"}</p>
                  </div>

                  {/* Effective Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Effective Date</p>
                    <p className="text-sm font-medium">
                      {policy.effectiveDate
                        ? new Date(policy.effectiveDate).toLocaleDateString("en-IE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  {/* Renewal Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Renewal Date</p>
                    <p className="text-sm font-medium">
                      {policy.renewalDate
                        ? new Date(policy.renewalDate).toLocaleDateString("en-IE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Advisor Information */}
                {(policy.advisorName || policy.advisorPhone || policy.advisorEmail) && (
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-3">Your Advisor</p>
                    <div className="space-y-2">
                      {/* Advisor Name */}
                      {policy.advisorName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600">Advisor Name</p>
                            <p className="text-sm font-medium">{policy.advisorName}</p>
                          </div>
                        </div>
                      )}

                      {/* Advisor Phone */}
                      {policy.advisorPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600">Phone</p>
                            <p className="text-sm font-medium">{policy.advisorPhone}</p>
                          </div>
                        </div>
                      )}

                      {/* Advisor Email */}
                      {policy.advisorEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="text-sm font-medium break-all">{policy.advisorEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No policies assigned yet</p>
            <p className="text-gray-500 text-xs mt-1">
              Once you complete your fact-finding forms, your advisor will assign policies to your account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
