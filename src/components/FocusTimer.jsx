"use client";

import { useEffect, useMemo, useState } from "react";

function formatMs(ms) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FocusTimer({ startTime }) {
  const [now, setNow] = useState(() => startTime || 0);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = useMemo(() => now - startTime, [now, startTime]);

  return <p className="timer-mono text-4xl font-semibold">{formatMs(elapsed)}</p>;
}
