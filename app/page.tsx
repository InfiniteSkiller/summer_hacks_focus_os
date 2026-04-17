"use client";

import { useEffect } from "react";
import Dashboard from "@/src/screens/Dashboard";
import LockIn from "@/src/screens/LockIn";
import FocusMode from "@/src/screens/FocusMode";
import ExitFriction from "@/src/screens/ExitFriction";
import Break from "@/src/screens/Break";
import Reentry from "@/src/screens/Reentry";
import Summary from "@/src/screens/Summary";
import { FocusState } from "@/src/store/cycleEngine";
import { useFocusStore } from "@/src/store/useFocusStore";

function FocusRenderer() {
  const currentState = useFocusStore((state) => state.currentState);

  if (currentState === FocusState.LOCK_IN) {
    return <LockIn />;
  }
  if (currentState === FocusState.FOCUSED) {
    return <FocusMode />;
  }
  if (currentState === FocusState.EXIT_FRICTION) {
    return <ExitFriction />;
  }
  if (currentState === FocusState.BREAK) {
    return <Break />;
  }
  if (currentState === FocusState.REENTRY) {
    return <Reentry />;
  }
  if (currentState === FocusState.SUMMARY) {
    return <Summary />;
  }
  return <Dashboard />;
}

export default function Home() {
  const hydrateHistory = useFocusStore((state) => state.hydrateHistory);

  useEffect(() => {
    hydrateHistory();
  }, [hydrateHistory]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <main className="w-full max-w-2xl">
        <FocusRenderer />
      </main>
    </div>
  );
}
