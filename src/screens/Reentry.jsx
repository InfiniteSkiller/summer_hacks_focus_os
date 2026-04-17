"use client";

import { useEffect } from "react";
import AIStepCard from "@/src/components/AIStepCard";
import { useAINextStep } from "@/src/hooks/useAINextStep";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

export default function Reentry() {
  const session = useFocusStore((state) => state.session);
  const transition = useFocusStore((state) => state.transition);
  const setReentryPrompt = useFocusStore((state) => state.setReentryPrompt);
  const { loading, error, suggestion, fetchNextStep } = useAINextStep(session.taskName);

  useEffect(() => {
    fetchNextStep().then((step) => setReentryPrompt(step));
  }, [fetchNextStep, setReentryPrompt]);

  return (
    <section className="phase-reveal focus-shell rounded-3xl border border-black/10 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">Re-entry</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Return with one clear next action.</p>
      <div className="mt-6">
        <AIStepCard suggestion={suggestion} loading={loading} error={error} />
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="rounded-full border border-black/10 px-5 py-2"
          onClick={() => transition(FocusState.SUMMARY)}
        >
          End Session
        </button>
        <button
          type="button"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-white"
          onClick={() => transition(FocusState.FOCUSED)}
        >
          Resume Focus
        </button>
      </div>
    </section>
  );
}
