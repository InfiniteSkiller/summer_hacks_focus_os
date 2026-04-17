"use client";

import { useFocusStore } from "@/src/store/useFocusStore";
import { FocusState } from "@/src/store/cycleEngine";

export default function Dashboard() {
  const transition = useFocusStore((state) => state.transition);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h1 className="text-3xl font-semibold">Focus OS</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Lock-in your intention before entering focus.
      </p>
      <button
        type="button"
        className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-white"
        onClick={() => transition(FocusState.LOCK_IN)}
      >
        Begin Lock-In
      </button>
      <p className="mt-3 text-xs text-[var(--ink-soft)]">
        Commit one session goal, then enter protected focus mode.
      </p>
    </section>
  );
}
