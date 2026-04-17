"use client";

function formatMs(ms) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function BreakGuide({ remainingMs }) {
  return (
    <section className="stat-tile p-5">
      <h3 className="text-lg font-semibold">Recovery Protocol</h3>
      <p className="mt-2 text-sm text-(--ink-soft)">
        Walk, hydrate, breathe. Return with intent.
      </p>
      <p className="timer-mono mt-4 text-3xl">{formatMs(remainingMs)}</p>
    </section>
  );
}
