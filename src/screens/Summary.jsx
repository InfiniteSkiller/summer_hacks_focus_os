import { clearSession, getSession, getSessionHistory } from "../utils/storage";
import { computeSessionMetrics, generateInsight } from "../utils/intelligence";

export default function Summary({ setAppState }) {
  const session = getSession() || {};
  const history = getSessionHistory();
  const metrics = computeSessionMetrics({
    plannedMinutes: Number(session.duration || 25),
    actualFocusSeconds: Number(session.actualFocusSeconds || 0),
    exitCount: Number(session.exitCount || 0),
    distractionType: session.distractionType || null,
    exitTime: session.exitTime || null,
    startTime: session.startTime || null,
  });
  const insight = generateInsight(metrics);

  const plannedSecs = Number(session.duration || 25) * 60;
  const actualSecs = session.actualFocusSeconds ?? plannedSecs;
  const exits = session.exitCount ?? 0;
  const raw = (actualSecs / plannedSecs) * (1 - exits * 0.1);
  const focusScore = Math.min(100, Math.max(0, Math.round(raw * 100)));

  const frequency = history.reduce((acc, item) => {
    const key = item?.distractionType?.trim();
    if (!key) {
      return acc;
    }
    return {
      ...acc,
      [key]: (acc[key] || 0) + 1,
    };
  }, {});

  const topDistraction = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  let scoreColor = "#f87171";
  if (focusScore >= 80) {
    scoreColor = "#4ade80";
  } else if (focusScore >= 50) {
    scoreColor = "#7c6ff7";
  }

  return (
    <section className="screen-shell flex h-screen w-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-[#0a0a0f] p-6">
        <p
          style={{
            fontSize: "11px",
            color: "#7c6ff7",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          session complete
        </p>

        <h2 style={{ fontSize: "22px", color: "#f0effe", fontWeight: 500, marginBottom: "24px" }}>
          {session.task || "Untitled"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div style={{ background: "#13131a", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: "#6b6880", marginBottom: "4px" }}>Planned</p>
            <p style={{ fontSize: "28px", color: "#f0effe", fontWeight: 500 }}>{session.duration || 25} min</p>
          </div>
          <div style={{ background: "#13131a", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: "#6b6880", marginBottom: "4px" }}>Focused</p>
            <p style={{ fontSize: "28px", color: "#f0effe", fontWeight: 500 }}>
              {Math.round(actualSecs / 60)} min
            </p>
          </div>
          <div style={{ background: "#13131a", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: "#6b6880", marginBottom: "4px" }}>Exits</p>
            <p style={{ fontSize: "28px", color: "#f0effe", fontWeight: 500 }}>{exits}</p>
          </div>
          <div style={{ background: "#13131a", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", color: "#6b6880", marginBottom: "4px" }}>Score</p>
            <p style={{ fontSize: "28px", color: scoreColor, fontWeight: 500 }}>{focusScore}</p>
          </div>
        </div>

        {session.distractionType ? (
          <p
            style={{
              background: "#1e1e2e",
              borderRadius: "9999px",
              padding: "4px 14px",
              fontSize: "12px",
              color: "#6b6880",
              display: "inline-block",
              marginTop: "16px",
              marginBottom: "24px",
            }}
          >
            You left for: {session.distractionType}
          </p>
        ) : null}

        {topDistraction ? (
          <p className="mb-4 text-sm text-focus-muted">
            You usually leave due to: {topDistraction}
          </p>
        ) : null}

        <p className="mb-4 text-sm text-focus-muted">{insight}</p>

        <button
          type="button"
          className="h-12 w-full rounded-xl bg-focus-accent text-white"
          onClick={() => {
            clearSession();
            setAppState("lockin");
          }}
        >
          Start next session →
        </button>

        <button
          type="button"
          className="mt-2 h-11 w-full rounded-xl border border-[#2a2a3a] bg-transparent text-[#6b6880]"
          onClick={() => setAppState("dashboard")}
        >
          View dashboard →
        </button>
      </div>
    </section>
  );
}
