import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, Edit2, Trash2, Plus, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type UserRole = "super_admin" | "admin" | "staff" | "support";

export default function UserManagement() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("staff");

  // Fetch users
  const usersQuery = trpc.admin.getUsers.useQuery({
    role: selectedRole === "all" ? undefined : selectedRole,
    search: searchQuery || undefined,
  });

  // Mutations
  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setEditingUser(null);
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      setNewUserEmail("");
      setNewUserRole("staff");
      setIsDialogOpen(false);
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  // Access control
  if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access this page. Only administrators can manage users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    );
  }

  const users = usersQuery.data || [];
  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super_admin";

  // Determine which roles can be edited
  const canEditRole = (targetRole: UserRole) => {
    if (isSuperAdmin) return true;
    if (isAdmin) {
      // Admin can edit staff and support, but not other admins or super_admin
      return targetRole === "staff" || targetRole === "support";
    }
    return false;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and their roles
          </p>
        </div>
        {(isAdmin || isSuperAdmin) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new team member to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && (
                        <>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </>
                      )}
                      {isSuperAdmin && (
                        <>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createUserMutation.mutate({ email: newUserEmail, role: newUserRole })}
                  disabled={!newUserEmail || createUserMutation.isPending}
                  className="w-full"
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{u.name || "—"}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {u.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="gap-1">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canEditRole(u.role) && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingUser(u)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                    <DialogDescription>
                                      Update user details
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                          value={editingUser.email}
                                          disabled
                                          className="bg-muted"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Role</label>
                                        <Select
                                          value={editingUser.role}
                                          onValueChange={(value) =>
                                            setEditingUser({ ...editingUser, role: value })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {isAdmin && (
                                              <>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="support">Support</SelectItem>
                                              </>
                                            )}
                                            {isSuperAdmin && (
                                              <>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="support">Support</SelectItem>
                                              </>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        onClick={() =>
                                          updateUserMutation.mutate({
                                            id: editingUser.id,
                                            role: editingUser.role,
                                          })
                                        }
                                        disabled={updateUserMutation.isPending}
                                        className="w-full"
                                      >
                                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUserMutation.mutate({ id: u.id })}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
