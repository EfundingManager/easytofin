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
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
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
        console.error("Logout error:", error);
      }
    } finally {
      // Clear all frontend state and caches
      // 1. Clear React Query cache completely
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      
      // 2. Clear all other queries to prevent stale data
      await utils.invalidate();
      
      // 3. Clear localStorage (including quick re-login data)
      localStorage.clear();
      
      // 4. Clear sessionStorage
      sessionStorage.clear();
      
      // 5. Hard redirect to post-logout page with cache busting
      if (typeof window !== "undefined") {
        // Use window.location.href for full page reload to clear all in-memory state
        window.location.href = `/post-logout?t=${Date.now()}`;
      }
    }
  }, [logoutMutation, utils]);

  const logout = useCallback(() => {
    setLogoutDialogOpen(true);
  }, []);

  const state = useMemo(() => {
    // Store comprehensive user info for quick re-login (only when logged in)
    if (meQuery.data && !logoutMutation.isPending) {
      const userInfo = {
        id: meQuery.data.id,
        name: meQuery.data.name,
        email: meQuery.data.email,
        role: meQuery.data.role,
      };
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(userInfo)
      );
    }
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

    window.location.href = redirectPath
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
