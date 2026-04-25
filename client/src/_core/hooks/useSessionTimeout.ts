import { useEffect, useState, useCallback, useRef } from 'react';

export interface SessionTimeoutConfig {
  warningDuration: number; // Time before logout to show warning (in ms)
  timeoutDuration: number; // Total session timeout (in ms)
  enabled: boolean;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  warningDuration: 2 * 60 * 1000, // 2 minutes warning
  timeoutDuration: 30 * 60 * 1000, // 30 minutes total
  enabled: true,
};

export function useSessionTimeout(
  onTimeout: () => void,
  onWarning: (timeRemaining: number) => void,
  config: Partial<SessionTimeoutConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (!finalConfig.enabled) return;

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      setTimeRemaining(finalConfig.warningDuration);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }, finalConfig.timeoutDuration - finalConfig.warningDuration);

    // Set logout timer
    inactivityTimerRef.current = setTimeout(() => {
      setIsWarningVisible(false);
      onTimeout();
    }, finalConfig.timeoutDuration);
  }, [finalConfig, onTimeout]);

  // Extend session
  const extendSession = useCallback(() => {
    setIsWarningVisible(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Setup activity listeners
  useEffect(() => {
    if (!finalConfig.enabled) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [finalConfig.enabled, resetInactivityTimer]);

  // Call onWarning callback when warning is shown
  useEffect(() => {
    if (isWarningVisible) {
      onWarning(timeRemaining);
    }
  }, [isWarningVisible, timeRemaining, onWarning]);

  return {
    isWarningVisible,
    timeRemaining,
    extendSession,
  };
}
