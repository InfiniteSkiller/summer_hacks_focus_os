import { useEffect, useRef, useState } from "react";
import { getSession, saveSession } from "../utils/storage";

const RING_SIZE = 200;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FocusWorkspace({ session, onExit }) {
  const totalSeconds = Math.max(1, Number(session.duration || 25) * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdActive, setHoldActive] = useState(false);
  const tabSwitchLoggedRef = useRef(false);

  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds, session.startTime]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!holdActive) {
      return;
    }

    const start = Date.now();
    const holdInterval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / 3000);
      setHoldProgress(progress);

      if (progress >= 1) {
        setHoldActive(false);
        setHoldProgress(0);
        onExit();
      }
    }, 30);

    return () => window.clearInterval(holdInterval);
  }, [holdActive, onExit]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden || tabSwitchLoggedRef.current) {
        return;
      }

      const current = getSession();
      if (!current) {
        return;
      }

      tabSwitchLoggedRef.current = true;
      saveSession({
        ...current,
        exitTime: Date.now(),
        exitCount: Number(current.exitCount || 0) + 1,
        distractionType: "tab-switch",
      });
      onExit();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onExit]);

  function cancelHold() {
    setHoldActive(false);
    setHoldProgress(0);
  }

  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = Math.max(0, Math.min(1, elapsedSeconds / totalSeconds));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <section className="screen-shell screen-enter flex h-screen w-screen flex-col items-center justify-center px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-focus-muted">now working on</p>
      <h2 className="mt-2 text-center text-xl font-medium text-focus-text">{session.task}</h2>

      <div className="mt-10">
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#1e1e2e"
            strokeWidth={STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#7c6ff7"
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f0effe"
            fontSize="36"
            fontWeight="500"
          >
            {formatTime(remainingSeconds)}
          </text>
        </svg>
      </div>

      <div className="mt-14 rounded-full p-0.5" style={{ background: `conic-gradient(#7c6ff7 ${holdProgress * 360}deg, #232334 0deg)` }}>
        <button
          type="button"
          className="min-w-45 rounded-full border border-[#2b2b3d] bg-[#13131a] px-8 py-3 text-sm font-medium text-focus-text"
          onMouseDown={() => setHoldActive(true)}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={() => setHoldActive(true)}
          onTouchEnd={cancelHold}
        >
          Hold to exit
        </button>
      </div>
    </section>
  );
}
