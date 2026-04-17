"use client";

function msToMinutes(ms) {
  return Math.round(ms / 60000);
}

export default function TruthCard({ session }) {
  return (
    <section className="stat-tile p-5">
      <h3 className="text-lg font-semibold">Truth Card</h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Task: {session.taskName || "-"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[var(--ink-soft)]">Planned</p>
          <p className="font-semibold">{session.plannedDuration || 0} min</p>
        </div>
        <div>
          <p className="text-[var(--ink-soft)]">Actual Focus</p>
          <p className="font-semibold">{msToMinutes(session.actualFocusTime || 0)} min</p>
        </div>
        <div>
          <p className="text-[var(--ink-soft)]">Distractions</p>
          <p className="font-semibold">{session.distractions?.length || 0}</p>
        </div>
        <div>
          <p className="text-[var(--ink-soft)]">Status</p>
          <p className="font-semibold">{session.endedAt ? "Completed" : "In progress"}</p>
        </div>
      </div>
    </section>
  );
}
