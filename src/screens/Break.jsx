import { useEffect, useState } from "react";
import { getSession, saveSession } from "../utils/storage";

const INTENTS = ["Rest", "Move", "Hydrate", "Reflect"];

function formatBreak(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function getPrompt(intent) {
  if (intent === "Rest") {
    return "Look away from all screens. Let your eyes rest.";
  }
  if (intent === "Move") {
    return "Stand up. Roll your shoulders. Walk if you can.";
  }
  if (intent === "Hydrate") {
    return "Get up and drink a full glass of water.";
  }
  if (intent === "Reflect") {
    return "What went well? What will you do differently?";
  }
  return "";
}

export default function Break({ setAppState }) {
  const [intent, setIntent] = useState(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const isDone = started && timeLeft === 0;

  useEffect(() => {
    if (!started || timeLeft <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, timeLeft]);

  function chooseIntent(nextIntent) {
    setIntent(nextIntent);
    setStarted(true);
    const current = getSession();
    if (current) {
      saveSession({ ...current, breakIntent: nextIntent });
    }
  }

  function goReentry() {
    const current = getSession();
    if (current) {
      saveSession({ ...current, breakIntent: intent || "" });
    }
    setAppState("reentry");
  }

  return (
    <section className="screen-shell flex h-screen w-screen flex-col items-center justify-center px-6 text-center">
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.12em",
          color: "#6b6880",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        session complete · take a real break
      </p>
      <h2 style={{ fontSize: "28px", color: "#f0effe", fontWeight: 500, marginBottom: "32px" }}>
        recover well.
      </h2>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {INTENTS.map((option) => {
          const active = option === intent;
          return (
            <button
              key={option}
              type="button"
              onClick={() => chooseIntent(option)}
              style={
                active
                  ? {
                      background: "#7c6ff7",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "8px 20px",
                      fontSize: "13px",
                    }
                  : {
                      background: "#13131a",
                      border: "1px solid #2a2a3a",
                      color: "#6b6880",
                      borderRadius: "9999px",
                      padding: "8px 20px",
                      fontSize: "13px",
                    }
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      <p
        style={{
          fontSize: "48px",
          fontWeight: 300,
          color: "#f0effe",
          letterSpacing: "-0.02em",
        }}
      >
        {intent ? formatBreak(timeLeft) : "--:--"}
      </p>

      {isDone ? <p className="mt-2 text-sm text-focus-muted">Time&apos;s up</p> : null}

      {intent ? (
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(124, 111, 247, 0.15)",
            border: "1px solid rgba(124, 111, 247, 0.3)",
            margin: "24px auto",
            animation: "breathe 4s ease-in-out infinite",
          }}
        />
      ) : null}

      <p
        style={{
          fontSize: "14px",
          color: "#6b6880",
          textAlign: "center",
          maxWidth: "280px",
          margin: "0 auto",
          minHeight: "40px",
        }}
      >
        {getPrompt(intent)}
      </p>

      <button
        type="button"
        className="mt-8 h-12 w-full max-w-xs rounded-xl bg-focus-accent text-[15px] text-white"
        onClick={goReentry}
      >
        I&apos;m ready — lock in →
      </button>

      <button
        type="button"
        style={{ fontSize: "12px", color: "#6b6880", cursor: "pointer", marginTop: "12px" }}
        onClick={() => setAppState("reentry")}
      >
        skip break
      </button>
    </section>
  );
}
