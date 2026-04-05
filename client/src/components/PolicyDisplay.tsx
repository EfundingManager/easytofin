import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, FileText, User, Phone } from "lucide-react";

interface Policy {
  id: number;
  policyNumber: string;
  product: string;
  insurerName: string;
  premium: number;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  advisorName: string;
  advisorPhone: string;
}

interface PolicyDisplayProps {
  policies: Policy[];
}

export function PolicyDisplay({ policies }: PolicyDisplayProps) {
  if (!policies || policies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Policies</CardTitle>
          <CardDescription>All policies assigned to this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No policies assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Policies</CardTitle>
        <CardDescription>All policies assigned to this customer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {policies.map((policy: Policy, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {/* Policy Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">{policy.policyNumber}</p>
                    <p className="text-sm text-gray-600 capitalize">{policy.product} Policy</p>
                  </div>
                </div>
                <Badge
                  variant={policy.status === "active" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {policy.status || "Active"}
                </Badge>
              </div>

              {/* Policy Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Insurer Name */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-600 mb-1">Insurer Name</p>
                  <p className="text-sm font-medium">{policy.insurerName || "N/A"}</p>
                </div>

                {/* Policy Type */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-600 mb-1">Policy Type</p>
                  <p className="text-sm font-medium capitalize">{policy.product || "N/A"}</p>
                </div>

                {/* Policy Number */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-600 mb-1">Policy Number</p>
                  <p className="text-sm font-medium font-mono">{policy.policyNumber}</p>
                </div>

                {/* Premium */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-600 mb-1">Premium</p>
                  <p className="text-sm font-medium">€{parseFloat(policy.premium?.toString() || "0").toFixed(2)}</p>
                </div>

                {/* Effective Date */}
                <div className="bg-gray-50 p-3 rounded flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Effective Date</p>
                    <p className="text-sm font-medium">
                      {policy.startDate
                        ? new Date(policy.startDate).toLocaleDateString("en-IE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Renewal Date */}
                <div className="bg-gray-50 p-3 rounded flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Renewal Date</p>
                    <p className="text-sm font-medium">
                      {policy.endDate
                        ? new Date(policy.endDate).toLocaleDateString("en-IE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advisor Information */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-3">Advisor Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Advisor Name */}
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Advisor Name</p>
                      <p className="text-sm font-medium">{policy.advisorName || "N/A"}</p>
                    </div>
                  </div>

                  {/* Advisor Phone */}
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Advisor Number</p>
                      <p className="text-sm font-medium">{policy.advisorPhone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
