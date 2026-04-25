import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Lock, Unlock, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AccountLockoutManagement() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"active" | "expired" | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [unlockReason, setUnlockReason] = useState("");
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // Fetch locked accounts
  const { data: lockedAccountsData, isLoading: isLoadingAccounts, refetch: refetchAccounts } =
    trpc.accountLockoutManagement.getLockedAccounts.useQuery({
      page,
      pageSize: 20,
      filterByStatus: filterStatus,
    });

  // Fetch statistics
  const { data: statsData } = trpc.accountLockoutManagement.getStatistics.useQuery();

  // Fetch activity pattern
  const { data: activityData, isLoading: isLoadingActivity } =
    trpc.accountLockoutManagement.getActivityPattern.useQuery(
      selectedAccount
        ? {
            phoneUserId: selectedAccount.phoneUserId,
            email: selectedAccount.email,
            phone: selectedAccount.phone,
            hoursBack: 24,
          }
        : skipToken,
      { enabled: !!selectedAccount }
    );

  // Fetch audit log
  const { data: auditLogData, isLoading: isLoadingAuditLog } =
    trpc.accountLockoutManagement.getAuditLog.useQuery(
      selectedAccount
        ? {
            phoneUserId: selectedAccount.phoneUserId,
            email: selectedAccount.email,
            phone: selectedAccount.phone,
            daysBack: 30,
            page: 1,
            pageSize: 50,
          }
        : skipToken,
      { enabled: !!selectedAccount }
    );

  // Unlock account mutation
  const unlockMutation = trpc.accountLockoutManagement.unlockAccount.useMutation({
    onSuccess: () => {
      toast.success("Account unlocked successfully");
      setShowUnlockDialog(false);
      setUnlockReason("");
      setSelectedAccount(null);
      refetchAccounts();
    },
    onError: (error) => {
      toast.error(`Failed to unlock account: ${error.message}`);
    },
  });

  const handleUnlock = async () => {
    if (!selectedAccount || !unlockReason.trim()) {
      toast.error("Please provide a reason for unlocking");
      return;
    }

    await unlockMutation.mutateAsync({
      phoneUserId: selectedAccount.phoneUserId,
      email: selectedAccount.email,
      phone: selectedAccount.phone,
      reason: unlockReason,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Lockout Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage locked accounts due to suspicious activity</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lockouts</CardTitle>
            <Lock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.stats?.activeLockouts || 0}</div>
            <p className="text-xs text-gray-600">Accounts currently locked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.stats?.lockoutsLast24h || 0}</div>
            <p className="text-xs text-gray-600">New lockouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="locked-accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="locked-accounts">Locked Accounts</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedAccount}>
            Details & Activity
          </TabsTrigger>
        </TabsList>

        {/* Locked Accounts Tab */}
        <TabsContent value="locked-accounts">
          <Card>
            <CardHeader>
              <CardTitle>Locked Accounts</CardTitle>
              <CardDescription>View and manage accounts locked due to suspicious activity</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter */}
              <div className="flex gap-4 mb-6">
                <Button
                  variant={filterStatus === undefined ? "default" : "outline"}
                  onClick={() => setFilterStatus(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "expired" ? "default" : "outline"}
                  onClick={() => setFilterStatus("expired")}
                >
                  Expired
                </Button>
              </div>

              {/* Accounts List */}
              {isLoadingAccounts ? (
                <div className="text-center py-8">Loading accounts...</div>
              ) : lockedAccountsData?.accounts && lockedAccountsData.accounts.length > 0 ? (
                <div className="space-y-4">
                  {lockedAccountsData.accounts.map((account: any) => (
                    <div
                      key={account.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {account.userInfo?.email || account.userInfo?.phone || "Unknown User"}
                            </h3>
                            <Badge variant={account.isActive ? "destructive" : "secondary"}>
                              {account.isActive ? "Active" : "Expired"}
                            </Badge>
                            <Badge variant="outline">{account.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Locked: {new Date(account.lockedAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Unlocks: {new Date(account.unlocksAt).toLocaleString()}
                          </p>
                          {account.isActive && (
                            <p className="text-sm text-red-600 mt-1">
                              <Clock className="inline h-4 w-4 mr-1" />
                              {account.remainingSeconds} seconds remaining
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccount(account);
                            setShowUnlockDialog(true);
                          }}
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">No locked accounts found</div>
              )}

              {/* Pagination */}
              {lockedAccountsData && lockedAccountsData.total > 20 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(lockedAccountsData.total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= lockedAccountsData.total}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details & Activity Tab */}
        <TabsContent value="details">
          {selectedAccount && (
            <div className="space-y-6">
              {/* Activity Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Pattern (Last 24 Hours)</CardTitle>
                  <CardDescription>
                    Review login/logout activity that triggered the lockout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="text-center py-8">Loading activity...</div>
                  ) : activityData?.summary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border rounded p-3">
                          <p className="text-sm text-gray-600">Total Activities</p>
                          <p className="text-2xl font-bold">{activityData.summary.totalActivities}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-gray-600">Login Attempts</p>
                          <p className="text-2xl font-bold">{activityData.summary.loginAttempts}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-gray-600">Failed Attempts</p>
                          <p className="text-2xl font-bold text-red-600">
                            {activityData.summary.failedAttempts}
                          </p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-gray-600">Successful Logins</p>
                          <p className="text-2xl font-bold text-green-600">
                            {activityData.summary.successfulLogins}
                          </p>
                        </div>
                      </div>

                      {activityData.summary.suspiciousPattern && (
                        <div className="bg-red-50 border border-red-200 rounded p-4 flex gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-900">Suspicious Pattern Detected</p>
                            <p className="text-sm text-red-800">
                              Multiple login/logout attempts detected within a short timeframe
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600">No activity data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Audit Log */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Audit Log (Last 30 Days)</CardTitle>
                  <CardDescription>All security events for this account</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAuditLog ? (
                    <div className="text-center py-8">Loading audit log...</div>
                  ) : auditLogData?.logs && auditLogData.logs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogData.logs.map((log: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-gray-300 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{log.eventType}</p>
                              <p className="text-sm text-gray-600">{log.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">{log.severity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600">No audit logs found</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Unlock Dialog */}
      {showUnlockDialog && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Unlock Account</CardTitle>
              <CardDescription>
                Provide a reason for manually unlocking this account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Account</p>
                <p className="text-sm text-gray-600">
                  {selectedAccount.userInfo?.email || selectedAccount.userInfo?.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Reason for Unlock</label>
                <textarea
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  placeholder="Enter reason (minimum 10 characters)"
                  className="w-full border rounded p-2 text-sm"
                  rows={4}
                  minLength={10}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnlockDialog(false);
                    setUnlockReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnlock}
                  disabled={unlockReason.length < 10 || unlockMutation.isPending}
                >
                  {unlockMutation.isPending ? "Unlocking..." : "Unlock Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
