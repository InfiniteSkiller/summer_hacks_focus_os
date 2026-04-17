"use client";

import FocusTimer from "@/src/components/FocusTimer";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function FocusMode() {
  const transition = useFocusStore((state) => state.transition);
  const session = useFocusStore((state) => state.session);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Focus Mode</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Task: {session.taskName}</p>
      <div className="mt-6">
        <FocusTimer startTime={session.startTime} />
      </div>
      <p className="mt-3 text-sm text-[var(--ink-soft)]">{session.taskNotes || "No notes added."}</p>
      <button
        type="button"
        className="mt-6 rounded-full bg-[var(--accent-2)] px-6 py-3 text-white"
        onClick={() => transition(FocusState.EXIT_FRICTION)}
      >
        Attempt Exit
      </button>
    </section>
  );
}
