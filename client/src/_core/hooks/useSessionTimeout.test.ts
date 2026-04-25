import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionTimeout } from './useSessionTimeout';

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with warning not visible', () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    const { result } = renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: true,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    expect(result.current.isWarningVisible).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should show warning after timeout - warning duration', async () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    const { result } = renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: true,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    // Advance time to trigger warning
    act(() => {
      vi.advanceTimersByTime(25000);
    });

    await waitFor(() => {
      expect(result.current.isWarningVisible).toBe(true);
    });
  });

  it('should call onTimeout after total timeout duration', async () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: true,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    // Advance time past total timeout
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalled();
    });
  });

  it('should extend session when extendSession is called', async () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    const { result } = renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: true,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    // Advance time to show warning
    act(() => {
      vi.advanceTimersByTime(25000);
    });

    await waitFor(() => {
      expect(result.current.isWarningVisible).toBe(true);
    });

    // Extend session
    act(() => {
      result.current.extendSession();
    });

    expect(result.current.isWarningVisible).toBe(false);

    // Advance time again - should not timeout
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('should not trigger timeout when disabled', () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: false,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    // Advance time past timeout
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('should reset timer on user activity', async () => {
    const onTimeout = vi.fn();
    const onWarning = vi.fn();

    const { result } = renderHook(() =>
      useSessionTimeout(onTimeout, onWarning, {
        enabled: true,
        timeoutDuration: 30000,
        warningDuration: 5000,
      })
    );

    // Advance time close to warning
    act(() => {
      vi.advanceTimersByTime(24000);
    });

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    // Advance time again - should not show warning yet
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.isWarningVisible).toBe(false);
  });
});
