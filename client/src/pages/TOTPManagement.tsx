import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Lock, RotateCcw, RefreshCw, Unlock, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

type TOTPStatus = "active" | "not_setup" | "disabled" | "locked";

interface UserTOTPStatus {
  id: number;
  name: string;
  email: string;
  role: string;
  totpStatus: TOTPStatus;
  setupDate?: string;
  lastUsed?: string;
  failedAttempts: number;
  isLocked: boolean;
}

/**
 * TOTP Management Dashboard
 * Allows Super Admin and Admin to manage TOTP 2FA for users
 * Manager/Staff/Support get read-only access
 * User/Customer cannot access this page
 */
export default function TOTPManagement() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "lockouts">("users");

  // Check authorization
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-red-600">Access Denied: Please log in</div>;
  }

  const hasWriteAccess = ["super_admin", "admin"].includes(user.role || "");
  const hasReadAccess = ["super_admin", "admin", "manager", "staff", "support"].includes(
    user.role || ""
  );

  if (!hasReadAccess) {
    return (
      <div className="p-8 text-red-600">
        Access Denied: Only privileged roles can access TOTP management
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold">2FA Management</h1>
          <Badge variant="secondary">{user.role}</Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "users"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600"
            }`}
          >
            User TOTP Status
          </button>
          {hasWriteAccess && (
            <>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 font-semibold ${
                  activeTab === "audit"
                    ? "border-b-2 border-teal-600 text-teal-600"
                    : "text-gray-600"
                }`}
              >
                Audit Log
              </button>
              <button
                onClick={() => setActiveTab("lockouts")}
                className={`px-4 py-2 font-semibold ${
                  activeTab === "lockouts"
                    ? "border-b-2 border-teal-600 text-teal-600"
                    : "text-gray-600"
                }`}
              >
                Account Lockouts
              </button>
            </>
          )}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <UserTOTPStatusTab
            user={user}
            hasWriteAccess={hasWriteAccess}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && hasWriteAccess && (
          <AuditLogTab user={user} />
        )}

        {/* Lockouts Tab */}
        {activeTab === "lockouts" && hasWriteAccess && (
          <LockoutsTab user={user} />
        )}
      </div>
    </div>
  );
}

/**
 * User TOTP Status Tab Component
 */
function UserTOTPStatusTab({
  user,
  hasWriteAccess,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: {
  user: any;
  hasWriteAccess: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}) {
  // Mock data - in production, this would come from the API
  const mockUsers: UserTOTPStatus[] = [
    {
      id: 1,
      name: "John Admin",
      email: "john@easytofin.com",
      role: "admin",
      totpStatus: "active",
      setupDate: "2026-04-15",
      lastUsed: "2026-05-03",
      failedAttempts: 0,
      isLocked: false,
    },
    {
      id: 2,
      name: "Jane Manager",
      email: "jane@easytofin.com",
      role: "manager",
      totpStatus: "not_setup",
      failedAttempts: 0,
      isLocked: false,
    },
    {
      id: 3,
      name: "Bob Staff",
      email: "bob@easytofin.com",
      role: "staff",
      totpStatus: "active",
      setupDate: "2026-03-20",
      lastUsed: "2026-05-02",
      failedAttempts: 0,
      isLocked: false,
    },
    {
      id: 4,
      name: "Alice Support",
      email: "alice@easytofin.com",
      role: "support",
      totpStatus: "locked",
      setupDate: "2026-02-10",
      failedAttempts: 3,
      isLocked: true,
    },
  ];

  // Filter users based on role and search
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      // Filter by search term
      if (
        searchTerm &&
        !u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by role
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && u.totpStatus !== statusFilter) {
        return false;
      }

      // Role hierarchy: Admin can only see subordinates
      if (user.role === "admin" && ["admin", "super_admin"].includes(u.role)) {
        return false;
      }

      return true;
    });
  }, [searchTerm, roleFilter, statusFilter, user.role]);

  const getStatusBadge = (status: TOTPStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "not_setup":
        return <Badge className="bg-yellow-600">Not Set Up</Badge>;
      case "disabled":
        return <Badge className="bg-gray-600">Disabled</Badge>;
      case "locked":
        return <Badge className="bg-red-600">Locked</Badge>;
    }
  };

  const canEditUser = (targetUser: UserTOTPStatus) => {
    if (!hasWriteAccess) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "admin") {
      // Admin cannot edit other Admins or Super Admin
      return !["admin", "super_admin"].includes(targetUser.role);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="not_setup">Not Set Up</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">TOTP Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Setup Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Last Used</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Failed Attempts</th>
                {hasWriteAccess && (
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{u.name}</td>
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="outline">{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(u.totpStatus)}</td>
                  <td className="px-6 py-4 text-sm">{u.setupDate || "—"}</td>
                  <td className="px-6 py-4 text-sm">{u.lastUsed || "—"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        u.failedAttempts > 0 ? "text-red-600 font-semibold" : ""
                      }
                    >
                      {u.failedAttempts}
                    </span>
                  </td>
                  {hasWriteAccess && (
                    <td className="px-6 py-4 text-sm">
                      {canEditUser(u) ? (
                        <div className="flex gap-2">
                          {u.totpStatus === "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Disable TOTP"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Reset TOTP"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Regenerate Backup Codes"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          {u.isLocked && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Unlock Account"
                              className="text-red-600 hover:text-red-900"
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            title="View Backup Codes"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No access</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center text-gray-600">
          No users found matching the selected filters
        </Card>
      )}
    </div>
  );
}

/**
 * Audit Log Tab Component
 */
function AuditLogTab({ user }: { user: any }) {
  const mockAuditLog = [
    {
      id: 1,
      timestamp: "2026-05-03 14:30:00",
      user: "John Admin",
      action: "setup_completed",
      performedBy: "John Admin",
      ipAddress: "192.168.1.100",
      reason: "Initial setup",
    },
    {
      id: 2,
      timestamp: "2026-05-02 10:15:00",
      user: "Jane Manager",
      action: "verification_failed",
      performedBy: "Jane Manager",
      ipAddress: "192.168.1.101",
      reason: "Invalid code entered",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Performed By</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">IP Address</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockAuditLog.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm">{log.user}</td>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="outline">{log.action}</Badge>
                </td>
                <td className="px-6 py-4 text-sm">{log.performedBy}</td>
                <td className="px-6 py-4 text-sm font-mono text-xs">{log.ipAddress}</td>
                <td className="px-6 py-4 text-sm">{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * Lockouts Tab Component
 */
function LockoutsTab({ user }: { user: any }) {
  const mockLockouts = [
    {
      id: 1,
      user: "Alice Support",
      email: "alice@easytofin.com",
      lockedAt: "2026-05-03 12:00:00",
      reason: "3 failed TOTP attempts",
      failedAttempts: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Lockout Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Failed Attempts (default: 3)
            </label>
            <Input type="number" defaultValue="3" min="1" max="10" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Lockout Duration (minutes, 0 = permanent)
            </label>
            <Input type="number" defaultValue="0" min="0" />
          </div>
        </div>
        <Button className="mt-4">Save Settings</Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Locked At</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Failed Attempts</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockLockouts.map((lockout) => (
                <tr key={lockout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{lockout.user}</td>
                  <td className="px-6 py-4 text-sm">{lockout.email}</td>
                  <td className="px-6 py-4 text-sm">{lockout.lockedAt}</td>
                  <td className="px-6 py-4 text-sm">{lockout.reason}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-red-600 font-semibold">{lockout.failedAttempts}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button size="sm" variant="destructive">
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
