"use client";

import { useState } from "react";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function LockIn() {
  const transition = useFocusStore((state) => state.transition);
  const lockInTask = useFocusStore((state) => state.lockInTask);
  const existing = useFocusStore((state) => state.session);
  const [taskName, setTaskName] = useState(existing.taskName || "");
  const [taskNotes, setTaskNotes] = useState(existing.taskNotes || "");
  const [plannedDuration, setPlannedDuration] = useState(existing.plannedDuration || 25);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Lock-In</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Commit one task. Everything else can wait.
      </p>
      <div className="mt-6 space-y-4">
        <input
          value={taskName}
          onChange={(event) => setTaskName(event.target.value)}
          placeholder="Task name"
          className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3"
        />
        <textarea
          value={taskNotes}
          onChange={(event) => setTaskNotes(event.target.value)}
          placeholder="Task notes"
          className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3"
          rows={3}
        />
        <input
          type="number"
          min={10}
          max={120}
          value={plannedDuration}
          onChange={(event) => setPlannedDuration(Number(event.target.value))}
          className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3"
        />
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="rounded-full border border-black/10 px-5 py-2"
          onClick={() => transition(FocusState.IDLE)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-white"
          onClick={() => lockInTask({ taskName, taskNotes, plannedDuration })}
          disabled={!taskName.trim()}
        >
          Commit and Focus
        </button>
      </div>
    </section>
  );
}
