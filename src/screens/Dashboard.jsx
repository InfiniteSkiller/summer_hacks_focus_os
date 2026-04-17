"use client";

import { useFocusStore } from "@/src/store/useFocusStore";
import { FocusState } from "@/src/store/cycleEngine";

export default function Dashboard() {
  const transition = useFocusStore((state) => state.transition);
  const history = useFocusStore((state) => state.history);
  const stageTaskFromHistory = useFocusStore((state) => state.stageTaskFromHistory);
  const recentTasks = history.filter((item) => item?.taskName).slice(0, 3);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h1 className="text-3xl font-semibold">Focus OS</h1>
      <p className="mt-2 text-sm text-(--ink-soft)">
        Lock-in your intention before entering focus.
      </p>
      <button
        type="button"
        className="mt-6 rounded-full bg-(--accent) px-6 py-3 text-white"
        onClick={() => transition(FocusState.LOCK_IN)}
      >
        Begin Lock-In
      </button>
      {recentTasks.length ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-(--ink-soft)">Recent Tasks</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentTasks.map((item) => (
              <button
                key={item.id || `${item.taskName}-${item.createdAt}`}
                type="button"
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm hover:bg-white"
                onClick={() => stageTaskFromHistory(item)}
              >
                {item.taskName}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-(--ink-soft)">
        Commit one session goal, then enter protected focus mode.
      </p>
    </section>
  );
}
