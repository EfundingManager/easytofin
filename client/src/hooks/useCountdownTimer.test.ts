import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCountdownTimer } from "./useCountdownTimer";

describe("useCountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useCountdownTimer(300));

    expect(result.current.isActive).toBe(false);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.secondsRemaining).toBe(300);
    expect(result.current.formattedTime).toBe("05:00");
  });

  it("should start countdown when start() is called", () => {
    const { result } = renderHook(() => useCountdownTimer(300));

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isEnabled).toBe(false);
  });

  it("should decrement timer every second", () => {
    const { result } = renderHook(() => useCountdownTimer(300));

    act(() => {
      result.current.start();
    });

    expect(result.current.secondsRemaining).toBe(300);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.secondsRemaining).toBe(299);
    expect(result.current.formattedTime).toBe("04:59");
  });

  it("should format time correctly as MM:SS", () => {
    const { result } = renderHook(() => useCountdownTimer(125)); // 2:05

    expect(result.current.formattedTime).toBe("02:05");

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000); // 5 seconds
    });

    expect(result.current.formattedTime).toBe("02:00");
  });

  it("should stop timer at 0 and disable active state", () => {
    const { result } = renderHook(() => useCountdownTimer(5));

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.secondsRemaining).toBe(5); // Reset to cooldown value
  });

  it("should reset to initial state", () => {
    const { result } = renderHook(() => useCountdownTimer(300));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(60000); // 60 seconds
    });

    expect(result.current.secondsRemaining).toBe(240);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsRemaining).toBe(300);
    expect(result.current.isEnabled).toBe(true);
  });

  it("should stop timer without resetting", () => {
    const { result } = renderHook(() => useCountdownTimer(300));

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsRemaining).toBe(240); // Time preserved
  });

  it("should handle custom cooldown duration", () => {
    const { result } = renderHook(() => useCountdownTimer(60));

    expect(result.current.formattedTime).toBe("01:00");

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.formattedTime).toBe("00:30");
  });

  it("should enable resend button after countdown completes", async () => {
    const { result } = renderHook(() => useCountdownTimer(5));

    act(() => {
      result.current.start();
    });

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isEnabled).toBe(true);
  });

  it("should pad single digit minutes and seconds", () => {
    const { result } = renderHook(() => useCountdownTimer(65)); // 1:05

    expect(result.current.formattedTime).toBe("01:05");

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.formattedTime).toBe("01:00");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formattedTime).toBe("00:59");
  });
});
