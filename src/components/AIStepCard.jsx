"use client";

export default function AIStepCard({ suggestion, loading, error }) {
  return (
    <section className="stat-tile p-5">
      <h3 className="text-lg font-semibold">Next Step Guidance</h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        {loading ? "Thinking..." : suggestion}
      </p>
      {error ? <p className="mt-3 text-xs text-[var(--accent-2)]">{error}</p> : null}
    </section>
  );
}
