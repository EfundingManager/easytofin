import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { trpc } from '@/lib/trpc';

// Mock trpc
vi.mock('@/lib/trpc', () => ({
  trpc: {
    useUtils: vi.fn(),
    auth: {
      me: {
        useQuery: vi.fn(),
      },
      logout: {
        useMutation: vi.fn(),
      },
    },
  },
}));

describe('useAuth Hook - Cache Clearing Fixes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should clear localStorage on logout', async () => {
    // Setup
    localStorage.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');

    // Mock the logout mutation
    const mockLogoutMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    };

    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue(mockLogoutMutation as any);
    vi.mocked(trpc.auth.me.useQuery).mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    // Render and logout
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogout();
    });

    // Verify localStorage was cleared
    expect(localStorage.getItem('test-key')).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('should clear sessionStorage on logout', async () => {
    // Setup
    sessionStorage.setItem('test-session-key', 'test-session-value');
    expect(sessionStorage.getItem('test-session-key')).toBe('test-session-value');

    // Mock the logout mutation
    const mockLogoutMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    };

    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue(mockLogoutMutation as any);
    vi.mocked(trpc.auth.me.useQuery).mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    // Render and logout
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogout();
    });

    // Verify sessionStorage was cleared
    expect(sessionStorage.getItem('test-session-key')).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('should not store user data in localStorage', () => {
    // Mock the queries
    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    vi.mocked(trpc.auth.me.useQuery).mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Render hook
    renderHook(() => useAuth());

    // Verify that user data is NOT stored in localStorage
    expect(localStorage.getItem('manus-runtime-user-info')).toBeNull();
  });

  it('should call utils.invalidate() to clear React Query cache', async () => {
    // Mock the logout mutation
    const mockLogoutMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    };

    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue(mockLogoutMutation as any);
    vi.mocked(trpc.auth.me.useQuery).mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    // Render and logout
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogout();
    });

    // Verify utils.invalidate was called
    expect(mockUtils.invalidate).toHaveBeenCalled();
  });

  it('should redirect to post-logout page with cache busting', async () => {
    // Mock the logout mutation
    const mockLogoutMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    };

    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue(mockLogoutMutation as any);
    vi.mocked(trpc.auth.me.useQuery).mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    // Render and logout
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogout();
    });

    // Verify redirect happened
    expect(window.location.href).toMatch(/\/post-logout\?t=\d+/);
  });

  it('should have staleTime: 0 for fresh user data on each mount', () => {
    // Mock the queries
    const mockUtils = {
      auth: {
        me: {
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
      invalidate: vi.fn().mockResolvedValue(undefined),
    };

    const mockUseQuery = vi.fn().mockReturnValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(trpc.useUtils).mockReturnValue(mockUtils as any);
    vi.mocked(trpc.auth.logout.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);
    vi.mocked(trpc.auth.me.useQuery).mockImplementation(mockUseQuery);

    // Render hook
    renderHook(() => useAuth());

    // Verify staleTime: 0 was passed
    expect(mockUseQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        staleTime: 0,
      })
    );
  });
});
