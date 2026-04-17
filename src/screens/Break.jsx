"use client";

import BreakGuide from "@/src/components/BreakGuide";
import { useBreakEnforcer } from "@/src/hooks/useBreakEnforcer";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function Break() {
  const transition = useFocusStore((state) => state.transition);
  const stateEnteredAt = useFocusStore((state) => state.stateEnteredAt);
  const { remainingMs, isBreakComplete } = useBreakEnforcer(stateEnteredAt, 5);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Break</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Structured recovery before re-entry.</p>
      <div className="mt-6">
        <BreakGuide remainingMs={remainingMs} />
      </div>
      <button
        type="button"
        className="mt-6 rounded-full bg-[var(--accent-3)] px-6 py-3 text-white disabled:opacity-40"
        disabled={!isBreakComplete}
        onClick={() => transition(FocusState.REENTRY)}
      >
        Continue to Re-entry
      </button>
    </section>
  );
}
