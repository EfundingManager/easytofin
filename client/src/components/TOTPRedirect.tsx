import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

/**
 * TOTP Redirect Component
 * Intercepts authenticated users and redirects to TOTP setup/verification if needed
 */
export function TOTPRedirect() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Get TOTP status from context (if available through a query)
  const totpStatusQuery = trpc.admin.getTotpStatus.useQuery(
    { phoneUserId: user?.id as number },
    {
      enabled: !!user?.id && location !== "/totp/setup" && location !== "/totp/verify",
      retry: false,
    }
  );

  useEffect(() => {
    if (!user?.id) return;

    // Skip TOTP redirect if already on TOTP pages
    if (location === "/totp/setup" || location === "/totp/verify") {
      return;
    }

    // Check if user has privileged role
    const privilegedRoles = ["admin", "super_admin", "manager", "staff", "support"];
    if (!privilegedRoles.includes(user.role)) {
      return; // Non-privileged users don't need TOTP
    }

    // If TOTP status is being loaded, wait
    if (totpStatusQuery.isLoading) {
      return;
    }

    const totpStatus = totpStatusQuery.data;
    if (!totpStatus) return;

    // Redirect to TOTP setup if first login and TOTP not completed
    if (totpStatus.isFirstLogin && !totpStatus.totpSetupCompleted) {
      navigate("/totp/setup");
      return;
    }

    // Redirect to TOTP verification if TOTP enabled but not verified in this session
    if (totpStatus.totpEnabled && totpStatus.requiresTOTP) {
      navigate("/totp/verify");
      return;
    }
  }, [user?.id, user?.role, location, totpStatusQuery.data, totpStatusQuery.isLoading]);

  return null;
}
