"use client";

import { useCallback, useMemo, useState } from "react";

const fallbackSteps = [
  "Write the next sentence before checking notifications.",
  "Open your task file and finish one visible sub-step.",
  "Set a 5-minute sprint and ship a rough draft.",
  "List three bullets, then complete just the first one.",
];

function buildFallback(taskName) {
  const seed = taskName?.length || 0;
  return fallbackSteps[seed % fallbackSteps.length];
}

export function useAINextStep(taskName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const fallback = useMemo(() => buildFallback(taskName || ""), [taskName]);

  const fetchNextStep = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName }),
      });
      if (!response.ok) {
        throw new Error("Suggestion unavailable");
      }
      const data = await response.json();
      const step = data?.nextStep?.trim();
      setSuggestion(step || fallback);
      return step || fallback;
    } catch {
      setError("Using fallback guidance");
      setSuggestion(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [fallback, taskName]);

  return {
    loading,
    error,
    suggestion: suggestion || fallback,
    fetchNextStep,
  };
}
