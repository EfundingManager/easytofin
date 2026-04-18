import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Link2, Unlink2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Account Linking Component
 * Allows users to link and manage multiple authentication methods
 */

export function AccountLinking() {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedLinkType, setSelectedLinkType] = useState<"oauth_to_phone" | "oauth_to_email">("oauth_to_phone");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // Queries
  const { data: linkedAccounts, isLoading: isLoadingAccounts, refetch: refetchAccounts } = trpc.accountLinking.getLinkedAccounts.useQuery();

  // Mutations
  const initiateLink = trpc.accountLinking.initiateLink.useMutation({
    onSuccess: (data) => {
      if (data.verificationToken) {
        setVerificationToken(data.verificationToken);
        setShowLinkDialog(false);
        setShowVerificationDialog(true);
      }
    },
  });

  const verifyLink = trpc.accountLinking.verifyLink.useMutation({
    onSuccess: () => {
      setShowVerificationDialog(false);
      setVerificationCode("");
      refetchAccounts();
    },
  });

  const revokeLink = trpc.accountLinking.revokeLink.useMutation({
    onSuccess: () => {
      refetchAccounts();
    },
  });

  const handleInitiateLink = () => {
    initiateLink.mutate({
      phoneUserId: undefined,
      linkMethod: selectedLinkType,
    });
  };

  const handleVerifyLink = () => {
    if (!verificationCode.trim()) {
      return;
    }
    verifyLink.mutate({
      token: verificationToken,
      verificationCode,
    });
  };

  const handleRevokeLink = (accountLinkId: number) => {
    if (confirm("Are you sure you want to unlink this account?")) {
      revokeLink.mutate({
        accountLinkId,
        reason: "User requested",
      });
    }
  };

  if (isLoadingAccounts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const links = linkedAccounts?.links || [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Linked Accounts</CardTitle>
              <CardDescription>Manage your connected authentication methods</CardDescription>
            </div>
            <Button onClick={() => setShowLinkDialog(true)} variant="outline" size="sm">
              <Link2 className="mr-2 h-4 w-4" />
              Link Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No linked accounts yet</p>
              <p className="text-xs text-muted-foreground">Link your OAuth account with phone or email for flexible sign-in</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {link.linkMethod === "oauth_to_phone" ? "Phone Number" : "Email Address"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {link.isVerified === "true" ? "Verified" : "Pending verification"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRevokeLink(link.id)}
                    variant="ghost"
                    size="sm"
                    disabled={revokeLink.isPending}
                  >
                    {revokeLink.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Unlink2 className="mr-2 h-4 w-4" />
                        Unlink
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Account Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Account</DialogTitle>
            <DialogDescription>Choose which authentication method to link with your account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Link Type</label>
              <select
                value={selectedLinkType}
                onChange={(e) => setSelectedLinkType(e.target.value as "oauth_to_phone" | "oauth_to_email")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="oauth_to_phone">Link with Phone Number</option>
                <option value="oauth_to_email">Link with Email Address</option>
              </select>
            </div>

            <Button onClick={handleInitiateLink} disabled={initiateLink.isPending} className="w-full">
              {initiateLink.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Account Link</DialogTitle>
            <DialogDescription>Enter the verification code sent to your {selectedLinkType === "oauth_to_phone" ? "phone" : "email"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-widest"
              />
            </div>

            <Button onClick={handleVerifyLink} disabled={verifyLink.isPending || verificationCode.length !== 6} className="w-full">
              {verifyLink.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
