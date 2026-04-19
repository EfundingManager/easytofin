import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function UserManagement() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [isLoading, setIsLoading] = useState(false);

  const promoteMutation = trpc.admin.promoteToSuperAdmin.useMutation({
    onSuccess: (data) => {
      setMessageType("success");
      setMessage(data.message);
      setEmail("");
      setPhone("");
      setTimeout(() => setMessage(""), 5000);
    },
    onError: (error) => {
      setMessageType("error");
      setMessage(error.message || "Failed to promote user");
    },
  });

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setMessageType("error");
      setMessage("Please enter email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      await promoteMutation.mutateAsync({
        email: email || undefined,
        phone: phone || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Promote users to Super Admin role</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromote} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number (Alternative)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+353879158817"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <p className="text-sm text-slate-600">
                Provide either email or phone number to promote the user to Super Admin.
              </p>

              {message && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg ${
                    messageType === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (!email && !phone)}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  "Promote to Super Admin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-slate-600">
            <p>1. Enter the email or phone number of the user to promote</p>
            <p>2. Click "Promote to Super Admin" button</p>
            <p>3. The user will be promoted to the super_admin role</p>
            <p className="text-xs text-slate-500 mt-4">
              Note: Only Super Admin users can access this page
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
