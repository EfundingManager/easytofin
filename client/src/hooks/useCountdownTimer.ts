import { useState, useEffect, useCallback } from "react";

interface CountdownTimerState {
  isActive: boolean;
  secondsRemaining: number;
  isEnabled: boolean;
  formattedTime: string;
}

/**
 * Hook for managing countdown timer with automatic re-enable after cooldown
 * @param cooldownSeconds - Total cooldown duration in seconds (default: 300 = 5 minutes)
 * @returns Timer state and control functions
 */
export function useCountdownTimer(cooldownSeconds: number = 300): CountdownTimerState & {
  start: () => void;
  reset: () => void;
  stop: () => void;
} {
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(cooldownSeconds);

  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  // Start the countdown
  const start = useCallback(() => {
    setIsActive(true);
    setSecondsRemaining(cooldownSeconds);
  }, [cooldownSeconds]);

  // Reset to initial state
  const reset = useCallback(() => {
    setIsActive(false);
    setSecondsRemaining(cooldownSeconds);
  }, [cooldownSeconds]);

  // Stop the countdown but keep the timer running
  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return cooldownSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, cooldownSeconds]);

  return {
    isActive,
    secondsRemaining,
    isEnabled: !isActive,
    formattedTime: formattedTime(),
    start,
    reset,
    stop,
  };
}
