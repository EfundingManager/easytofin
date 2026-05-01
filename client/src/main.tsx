import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// Initialize global error reporting
declare global {
  interface Window {
    addEventListener(type: 'error' | 'unhandledrejection', listener: EventListener): void;
  }
}

// Create QueryClient with proper defaults to prevent infinite refetch loops
// staleTime: 0 was causing infinite refetches when combined with component re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 60 seconds staleTime prevents excessive refetching while keeping data relatively fresh
      staleTime: 60 * 1000,
      // 5 minutes garbage collection time
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Debounce redirect to prevent multiple simultaneous redirects
let redirectTimeout: NodeJS.Timeout | null = null;

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Prevent multiple redirects
  if (window.location.pathname === '/auth-selection' || window.location.pathname === '/post-logout') {
    return;
  }

  // Debounce the redirect to prevent rapid repeated redirects
  if (redirectTimeout) clearTimeout(redirectTimeout);
  redirectTimeout = setTimeout(() => {
    console.log("[Auth] Unauthorized error detected, clearing cache and redirecting...");
    queryClient.clear();
    window.location.href = getLoginUrl();
  }, 100);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// Global error listener for unhandled errors and promise rejections
window.addEventListener('error', (event: ErrorEvent) => {
  const errorMessage = event.message || String(event.error);
  const errorStack = event.error?.stack || '';
  const url = window.location.href;
  
  console.error('[Global Error]', {
    message: errorMessage,
    stack: errorStack,
    url,
    timestamp: new Date().toISOString(),
  });
  
  // Report to backend logs API
  fetch('/api/trpc/logs.reportError', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      json: {
        message: errorMessage,
        stack: errorStack,
        url,
        timestamp: new Date().toISOString(),
      },
    }),
  }).catch(err => console.error('[Error Reporting Failed]', err));
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const errorMessage = event.reason?.message || String(event.reason);
  const errorStack = event.reason?.stack || '';
  const url = window.location.href;
  
  console.error('[Unhandled Promise Rejection]', {
    message: errorMessage,
    stack: errorStack,
    url,
    timestamp: new Date().toISOString(),
  });
  
  // Report to backend logs API
  fetch('/api/trpc/logs.reportError', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      json: {
        message: `[Unhandled Promise] ${errorMessage}`,
        stack: errorStack,
        url,
        timestamp: new Date().toISOString(),
      },
    }),
  }).catch(err => console.error('[Error Reporting Failed]', err));
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
