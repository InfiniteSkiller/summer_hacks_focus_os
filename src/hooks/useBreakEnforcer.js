"use client";

import { useEffect, useMemo, useState } from "react";

export function useBreakEnforcer(stateEnteredAt, breakDurationMinutes = 5) {
  const breakDurationMs = breakDurationMinutes * 60 * 1000;
  const [now, setNow] = useState(() => stateEnteredAt || 0);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = useMemo(() => {
    const elapsed = now - stateEnteredAt;
    return Math.max(0, breakDurationMs - elapsed);
  }, [breakDurationMs, now, stateEnteredAt]);

  const isBreakComplete = remainingMs <= 0;

  return {
    remainingMs,
    isBreakComplete,
  };
}
