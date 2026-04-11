import { useState, useEffect, useCallback } from 'react';

interface RateLimitState {
  isLimited: boolean;
  retryAfter: number;
  message: string;
  timeRemaining: number;
}

/**
 * Hook to manage rate limit state and countdown timer
 * @param initialRetryAfter Initial retry-after time in seconds (from error response)
 * @returns Rate limit state and reset function
 */
export function useRateLimit(initialRetryAfter?: number) {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    retryAfter: 0,
    message: '',
    timeRemaining: 0,
  });

  // Handle rate limit error
  const setRateLimit = useCallback((retryAfter: number, message?: string) => {
    setState({
      isLimited: true,
      retryAfter,
      message: message || 'Too many requests. Please try again later.',
      timeRemaining: retryAfter,
    });
  }, []);

  // Reset rate limit
  const resetRateLimit = useCallback(() => {
    setState({
      isLimited: false,
      retryAfter: 0,
      message: '',
      timeRemaining: 0,
    });
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!state.isLimited || state.timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setState((prev) => {
        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          return {
            ...prev,
            isLimited: false,
            timeRemaining: 0,
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isLimited, state.timeRemaining]);

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return {
    ...state,
    setRateLimit,
    resetRateLimit,
    formatTimeRemaining,
  };
}
