"use client";

import { useCallback, useRef, useState } from "react";

const HOLD_DURATION_MS = 1400;

export function useHoldGesture(onComplete) {
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const [progress, setProgress] = useState(0);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    startRef.current = 0;
    setProgress(0);
  }, []);

  function tick(timestamp) {
    if (!startRef.current) {
      startRef.current = timestamp;
    }
    const elapsed = timestamp - startRef.current;
    const nextProgress = Math.min(1, elapsed / HOLD_DURATION_MS);
    setProgress(nextProgress);
    if (nextProgress >= 1) {
      stop();
      onComplete();
      return;
    }
    frameRef.current = requestAnimationFrame(tick);
  }

  const start = () => {
    stop();
    frameRef.current = requestAnimationFrame(tick);
  };

  return {
    progress,
    start,
    stop,
  };
}
