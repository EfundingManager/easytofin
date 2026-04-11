import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, RefreshCw, Lock } from "lucide-react";

/**
 * Admin dashboard for monitoring and managing rate limit violations
 */
export default function AdminRateLimitDashboard() {
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"phone" | "email">("phone");
  const [sortBy, setSortBy] = useState<"createdAt" | "attemptCount">("createdAt");
  const [page, setPage] = useState(0);

  // Fetch violations
  const { data: violations, isLoading: violationsLoading, refetch: refetchViolations } = trpc.admin.getRateLimitViolationsData.useQuery({
    identifier: identifier || undefined,
    identifierType: identifierType || undefined,
    limit: 20,
    offset: page * 20,
    sortBy,
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getRateLimitStatsData.useQuery();

  // Whitelist mutation
  const whitelistMutation = trpc.admin.whitelistIdentifierFromRateLimit.useMutation({
    onSuccess: () => {
      refetchViolations();
      refetchStats();
    },
  });

  // Reset mutation
  const resetMutation = trpc.admin.resetRateLimitForIdentifier.useMutation({
    onSuccess: () => {
      refetchViolations();
      refetchStats();
    },
  });

  const handleWhitelist = (id: string, type: "phone" | "email") => {
    whitelistMutation.mutate({
      identifier: id,
      identifierType: type,
      notes: "Whitelisted from admin dashboard",
    });
  };

  const handleReset = (id: string, type: "phone" | "email") => {
    resetMutation.mutate({
      identifier: id,
      identifierType: type,
      notes: "Reset from admin dashboard",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Rate Limit Monitoring</h1>
        <p className="text-gray-600">Monitor and manage rate limit violations</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViolations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unresolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unresolvedViolations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Whitelisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.whitelistedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Violators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topViolators.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Identifier</label>
              <Input
                placeholder="Phone or email"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={identifierType} onValueChange={(value) => setIdentifierType(value as "phone" | "email")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "createdAt" | "attemptCount")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="attemptCount">Attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={() => refetchViolations()} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>Violations</CardTitle>
          <CardDescription>Recent rate limit violations</CardDescription>
        </CardHeader>
        <CardContent>
          {violationsLoading ? (
            <div className="text-center py-8">Loading violations...</div>
          ) : violations && violations.length > 0 ? (
            <div className="space-y-4">
              {violations.map((violation) => (
                <div key={violation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {violation.isWhitelisted === "true" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">{violation.identifier}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{violation.identifierType}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {violation.violationType === "send_otp" ? "Send OTP" : "Verify OTP"} - {violation.attemptCount} attempts
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(violation.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {violation.isWhitelisted !== "true" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReset(violation.identifier, violation.identifierType as "phone" | "email")}
                            disabled={resetMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhitelist(violation.identifier, violation.identifierType as "phone" | "email")}
                            disabled={whitelistMutation.isPending}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No violations found</div>
          )}

          {/* Pagination */}
          {violations && violations.length > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="px-4 py-2">Page {page + 1}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={violations.length < 20}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Violators */}
      {stats && stats.topViolators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Violators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topViolators.map((violator, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{violator.identifier}</span>
                  <span className="text-sm text-red-600 font-bold">{violator.count} attempts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
