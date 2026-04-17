"use client";

import { useEffect } from "react";
import HoldRing from "@/src/components/HoldRing";
import { useHoldGesture } from "@/src/hooks/useHoldGesture";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function ExitFriction() {
  const transition = useFocusStore((state) => state.transition);
  const addDistraction = useFocusStore((state) => state.addDistraction);
  const updateExitHoldProgress = useFocusStore((state) => state.updateExitHoldProgress);

  const { progress, start, stop } = useHoldGesture(() => {
    addDistraction("User exited focus before completion");
    transition(FocusState.BREAK);
  });

  useEffect(() => {
    updateExitHoldProgress(progress);
  }, [progress, updateExitHoldProgress]);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Exit Friction</h2>
      <p className="mt-2 text-sm text-(--ink-soft)">
        Hold for 1.4s to confirm you want to break focus.
      </p>
      <div className="mt-6 flex flex-col items-center gap-4">
        <HoldRing progress={progress} />
        <button
          type="button"
          className="rounded-full bg-(--accent-2) px-6 py-3 text-white"
          onMouseDown={start}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchEnd={stop}
        >
          Hold to Exit
        </button>
      </div>
      <button
        type="button"
        className="mt-6 rounded-full border border-black/10 px-6 py-3"
        onClick={() => transition(FocusState.FOCUSED)}
      >
        Return to Focus
      </button>
    </section>
  );
}
