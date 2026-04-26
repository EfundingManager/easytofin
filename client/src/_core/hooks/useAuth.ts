import { getLoginUrl } from "@/const";
import { useRouter } from "wouter";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always refetch on component mount to get fresh user data
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Immediately clear auth data on success
      utils.auth.me.setData(undefined, null);
    },
  });

  const handleLogout = useCallback(async () => {
    try {
      // Call logout endpoint to destroy server-side session
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out, continue with cleanup
      } else {
        console.error("[Auth] Logout error:", error);
      }
    } finally {
      // CRITICAL: Complete cache clearing to prevent stale data
      console.log("[Auth] Starting complete cache cleanup...");
      
      // 1. Clear auth data
      utils.auth.me.setData(undefined, null);
      
      // 2. Invalidate all queries
      await utils.invalidate();
      
      // 3. Clear all browser storage to remove stale user data
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Hard redirect to post-logout page with cache busting timestamp
      if (typeof window !== "undefined") {
        console.log("[Auth] Redirecting to post-logout page...");
        window.location.href = `/post-logout?t=${Date.now()}`;
      }
    }
  }, [logoutMutation, utils]);

  const logout = useCallback(() => {
    setLogoutDialogOpen(true);
  }, []);

  // FIXED: Do NOT store user data in localStorage
  // This causes stale data to persist across sessions
  // Only use useMemo to compute state from query data
  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    logoutDialogOpen,
    setLogoutDialogOpen,
    handleLogout,
    isLoggingOut: logoutMutation.isPending,
  };
}
