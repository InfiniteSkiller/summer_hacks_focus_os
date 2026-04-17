import { useEffect, useRef, useState } from "react";
import { appendSessionToHistory, getSession, saveSession } from "../utils/storage";

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const HOLD_RADIUS = 28;
const HOLD_CIRCUMFERENCE = 2 * Math.PI * HOLD_RADIUS;

function formatMMSS(seconds) {
  const safe = Math.max(0, seconds);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function FocusMode({ session, setAppState }) {
  const initialDuration = Number(getSession()?.duration || session?.duration || 25);
  const [totalTime] = useState(() => initialDuration * 60);
  const [timeLeft, setTimeLeft] = useState(() => initialDuration * 60);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef(null);
  const completedRef = useRef(false);
  const tabSwitchLoggedRef = useRef(false);

  function completeSession(finalTimeLeft) {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    const current = getSession();
    if (!current) {
      setAppState("summary");
      return;
    }

    const elapsed = Math.max(0, Number(current.duration || 25) * 60 - finalTimeLeft);
    const completedSession = {
      ...current,
      completed: true,
      endTime: new Date().toISOString(),
      actualFocusSeconds: elapsed,
    };
    saveSession(completedSession);
    appendSessionToHistory(completedSession);
    setAppState("summary");
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          return 0;
        }
        const next = prev - 1;
        if (next === 0) {
          completeSession(0);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [setAppState]);

  function clearHold() {
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }

  function resetHold() {
    clearHold();
    setHoldProgress(0);
  }

  function startHold() {
    if (holdIntervalRef.current) {
      return;
    }
    holdIntervalRef.current = window.setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + 100 / (3000 / 50);
        if (next >= 100) {
          clearHold();
          const current = getSession();
          if (current) {
            saveSession({
              ...current,
              exitTime: new Date().toISOString(),
              exitCount: Number(current.exitCount || 0) + 1,
              actualFocusSeconds: Math.max(0, Number(current.duration || 25) * 60 - timeLeft),
            });
          }
          setAppState("exit");
          return 100;
        }
        return next;
      });
    }, 50);
  }

  function logTabSwitchExit() {
    if (tabSwitchLoggedRef.current) {
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
      actualFocusSeconds: Math.max(0, Number(current.duration || 25) * 60 - timeLeft),
    });
    setAppState("exit");
  }

  useEffect(() => {
    return () => clearHold();
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        logTabSwitchExit();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timeLeft, setAppState]);

  const elapsed = totalTime - timeLeft;
  const progress = totalTime > 0 ? elapsed / totalTime : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = 100 + RADIUS * Math.cos(angle);
  const dotY = 100 + RADIUS * Math.sin(angle);
  const holdDashoffset = HOLD_CIRCUMFERENCE * (1 - holdProgress / 100);

  return (
    <section className="screen-shell flex h-screen w-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-focus-muted">now working on</p>
      <h2 className="mt-2 text-[20px] font-medium text-white">{session?.task || "Untitled task"}</h2>

      <div className="mt-10">
        <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
          <circle cx="100" cy="100" r={RADIUS} stroke="#1e1e2e" strokeWidth="6" fill="none" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#7c6ff7"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          <circle cx={dotX} cy={dotY} r="4" fill="#a78bfa" />
          <text
            x="100"
            y="100"
            fill="white"
            fontSize="32"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {formatMMSS(timeLeft)}
          </text>
        </svg>
      </div>

      <div className="relative mt-10 inline-flex items-center justify-center">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          className="pointer-events-none absolute"
          aria-hidden="true"
        >
          <circle cx="36" cy="36" r="28" fill="none" stroke="#1e1e2e" strokeWidth="4" />
          <circle
            cx="36"
            cy="36"
            r="28"
            fill="none"
            stroke="#7c6ff7"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={HOLD_CIRCUMFERENCE}
            strokeDashoffset={holdDashoffset}
            transform="rotate(-90 36 36)"
          />
        </svg>

        <button
          type="button"
          onMouseDown={startHold}
          onTouchStart={startHold}
          onMouseUp={resetHold}
          onTouchEnd={resetHold}
          onMouseLeave={resetHold}
          style={{
            background: "#13131a",
            border: "1px solid #2a2a3a",
            color: "#6b6880",
            borderRadius: "9999px",
            padding: "12px 32px",
            fontSize: "14px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Hold to exit
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          completeSession(timeLeft);
        }}
        style={{
          fontSize: "12px",
          color: "#6b6880",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginTop: "8px",
        }}
      >
        Mark complete ✓
      </button>
    </section>
  );
}
