"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FocusState, safeTransition } from "./cycleEngine";

const FOCUS_HISTORY_KEY = "focus-os-history";

function now() {
  return Date.now();
}

function createEmptySession() {
  return {
    id: "",
    taskName: "",
    taskNotes: "",
    startTime: 0,
    plannedDuration: 25,
    actualFocusTime: 0,
    distractions: [],
    reentryPrompt: "",
    createdAt: 0,
    endedAt: 0,
  };
}

function readHistory() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FOCUS_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(history) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(FOCUS_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export const useFocusStore = create(
  persist(
    (set, get) => ({
      currentState: FocusState.IDLE,
      stateEnteredAt: now(),
      elapsedBeforePauseMs: 0,
      session: createEmptySession(),
      history: [],
      ui: {
        isLocked: false,
        exitHoldProgress: 0,
      },

      hydrateHistory: () => {
        set({ history: readHistory() });
      },

      transition: (nextState) => {
        set((state) => ({
          currentState: safeTransition(state.currentState, nextState),
          stateEnteredAt: now(),
        }));
      },

      lockInTask: ({ taskName, taskNotes, plannedDuration }) => {
        const id = String(now());
        set((state) => ({
          session: {
            ...state.session,
            id,
            taskName: taskName.trim(),
            taskNotes: taskNotes.trim(),
            plannedDuration: Number(plannedDuration) || 25,
            startTime: now(),
            createdAt: now(),
            endedAt: 0,
            distractions: [],
            actualFocusTime: 0,
          },
          ui: {
            ...state.ui,
            isLocked: true,
            exitHoldProgress: 0,
          },
          elapsedBeforePauseMs: 0,
        }));
        get().transition(FocusState.FOCUSED);
      },

      stageTaskFromHistory: (historyItem) => {
        if (!historyItem?.taskName?.trim()) {
          return;
        }
        set((state) => ({
          session: {
            ...state.session,
            taskName: historyItem.taskName,
            taskNotes: historyItem.taskNotes || "",
            plannedDuration: Number(historyItem.plannedDuration) || 25,
          },
        }));
        get().transition(FocusState.LOCK_IN);
      },

      addDistraction: (reason) => {
        set((state) => ({
          session: {
            ...state.session,
            distractions: [
              ...state.session.distractions,
              {
                reason,
                timestamp: now(),
              },
            ],
          },
        }));
      },

      updateExitHoldProgress: (value) => {
        set((state) => ({
          ui: {
            ...state.ui,
            exitHoldProgress: value,
          },
        }));
      },

      releaseLock: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isLocked: false,
            exitHoldProgress: 0,
          },
        }));
      },

      pauseFocusClock: () => {
        const state = get();
        if (state.currentState !== FocusState.FOCUSED || !state.session.startTime) {
          return;
        }
        const elapsed = now() - state.session.startTime;
        set({ elapsedBeforePauseMs: elapsed });
      },

      resumeFocusClock: () => {
        const { elapsedBeforePauseMs } = get();
        set((state) => ({
          session: {
            ...state.session,
            startTime: now() - elapsedBeforePauseMs,
          },
          elapsedBeforePauseMs: 0,
        }));
      },

      setReentryPrompt: (prompt) => {
        set((state) => ({
          session: {
            ...state.session,
            reentryPrompt: prompt,
          },
        }));
      },

      completeSession: () => {
        const state = get();
        const end = now();
        const actualFocusTime = Math.max(0, end - (state.session.startTime || end));
        const completedSession = {
          ...state.session,
          actualFocusTime,
          endedAt: end,
        };
        const updatedHistory = [completedSession, ...state.history].slice(0, 50);
        writeHistory(updatedHistory);
        set({
          session: completedSession,
          history: updatedHistory,
          ui: {
            ...state.ui,
            isLocked: false,
            exitHoldProgress: 0,
          },
        });
      },

      resetToIdle: () => {
        set({
          currentState: FocusState.IDLE,
          stateEnteredAt: now(),
          elapsedBeforePauseMs: 0,
          session: createEmptySession(),
          ui: {
            isLocked: false,
            exitHoldProgress: 0,
          },
        });
      },
    }),
    {
      name: "focus-os-session",
      partialize: (state) => ({
        currentState: state.currentState,
        stateEnteredAt: state.stateEnteredAt,
        elapsedBeforePauseMs: state.elapsedBeforePauseMs,
        session: state.session,
        ui: state.ui,
      }),
    }
  )
);
