"use client";

import TruthCard from "@/src/components/TruthCard";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function Summary() {
  const session = useFocusStore((state) => state.session);
  const completeSession = useFocusStore((state) => state.completeSession);
  const resetToIdle = useFocusStore((state) => state.resetToIdle);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Session Summary</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Awareness is built by closing the loop.
      </p>
      <div className="mt-6">
        <TruthCard session={session} />
      </div>
      <button
        type="button"
        className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-white"
        onClick={() => {
          completeSession();
          resetToIdle();
        }}
      >
        Back to Dashboard
      </button>
    </section>
  );
}
