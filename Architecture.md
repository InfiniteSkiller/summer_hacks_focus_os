# 🏗️ Focus OS – Architecture Document

## 1. System Overview

Focus OS is a frontend-driven application designed to manage the full productivity cycle:

> **Lock-in → Focus → Exit → Break → Re-entry → Summary**

The system is built around a deterministic **state machine** to ensure predictable behavior and eliminate inconsistent UI states.

The architecture prioritizes:

* Simplicity (hackathon-ready)
* Responsiveness (instant UI transitions)
* Behavioral reliability (no broken states)

---

## 2. High-Level Architecture

```
Client (React + Zustand)
        │
        ├── Local Storage (session state, tasks)
        ├── IndexedDB (session history)
        │
        └── AI Edge Function (Next Step Suggestions)
```

### Key Principles:

* No traditional backend required
* All core logic runs client-side
* Serverless function used only for AI

---

## 3. Frontend Architecture

### Stack

* React 18 (UI layer)
* Vite (build tool)
* TailwindCSS (styling)
* Framer Motion (animations)
* Zustand (state management)

### Design Approach

* Screen-based architecture (no complex routing)
* Linear flow (one state → one screen)
* Minimal global state

---

## 4. State Management

### Zustand Store Structure

```js
{
  currentState: "IDLE" | "LOCK_IN" | "FOCUSED" | "EXIT_FRICTION" | "BREAK" | "REENTRY" | "SUMMARY",

  session: {
    taskName: string,
    taskNotes: string,
    startTime: number,
    plannedDuration: number,
    actualFocusTime: number,
    distractions: []
  },

  ui: {
    isLocked: boolean,
    exitHoldProgress: number
  }
}
```

### Persistence

* `persist` middleware → localStorage
* Session history → IndexedDB

---

## 5. Core Engine (State Machine)

Focus OS is powered by a strict state machine:

```
IDLE → LOCK_IN → FOCUSED → EXIT_FRICTION → BREAK → REENTRY → SUMMARY
                    ↑                                    ↓
                    └────────────────────────────────────┘
```

### Transition Rules

| From          | Allowed To       |
| ------------- | ---------------- |
| IDLE          | LOCK_IN          |
| LOCK_IN       | FOCUSED          |
| FOCUSED       | EXIT_FRICTION    |
| EXIT_FRICTION | FOCUSED, BREAK   |
| BREAK         | REENTRY          |
| REENTRY       | FOCUSED, SUMMARY |
| SUMMARY       | IDLE             |

### Why State Machine?

* Prevents invalid UI states
* Simplifies debugging
* Ensures consistent demo behavior

---

## 6. Core Modules

### 6.1 Focus Cycle Engine

* Manages session lifecycle
* Handles timers and transitions
* Tracks session metrics

---

### 6.2 Exit Friction Module

* Implements hold-to-exit gesture
* Prevents impulsive exits
* Logs distraction reasons

---

### 6.3 Re-entry Engine (Critical Module)

* Stores context snapshot
* Retrieves task on return
* Displays next-step guidance
* Integrates AI suggestions

---

### 6.4 Break Engine

* Manages timed breaks
* Enforces structured recovery
* Prevents unbounded usage

---

### 6.5 Insight Engine

* Calculates session metrics
* Generates simple insights
* Tracks distraction patterns

---

## 7. Data Layer

### Local Storage

Used for:

* Active session state
* Recent tasks
* UI preferences

---

### IndexedDB

Used for:

* Session history
* Distraction logs
* Long-term analytics

---

### Data Model Example

```js
Session {
  id: string,
  taskName: string,
  plannedDuration: number,
  actualFocusTime: number,
  distractions: [
    { reason: string, timestamp: number }
  ],
  createdAt: number
}
```

---

## 8. AI Integration

### Purpose

* Generate a single “next step” for re-entry

### Flow

1. User commits task
2. Client sends task to edge function
3. AI returns short actionable step
4. Cached in local state

### Design Constraints

* Max latency: < 2s
* Fallback: rule-based suggestion

---

## 9. UI Architecture

### Screen Flow

1. Dashboard
2. Lock-In Screen
3. Focus Mode
4. Exit Friction
5. Break Screen
6. Re-entry Screen
7. Summary Screen

---

### Component Structure

```
screens/
components/
store/
hooks/
```

### Key Components

* FocusTimer
* HoldRing
* AIStepCard
* TruthCard

---

## 10. Performance Considerations

* Avoid unnecessary re-renders (Zustand selectors)
* Keep animations GPU-accelerated
* Lazy load non-critical components
* Cache AI responses

---

## 11. Hackathon Constraints

### Built Fully

* Core state machine
* Focus mode UI
* Exit friction
* Re-entry system

### Simplified

* Break system
* AI suggestions

### Skipped

* External integrations
* Advanced analytics

---

## 12. Future Architecture Evolution

### Phase 1

* Add backend (Supabase)
* User authentication
* Cloud sync

### Phase 2

* Browser extension integration
* Real-time distraction tracking

### Phase 3

* Mobile app (React Native)
* Cross-device sync

---

## 13. Design Philosophy

Focus OS is not a feature-heavy system.

It is a **behavior-driven architecture** where:

* State controls experience
* UI enforces discipline
* Data reinforces awareness

---

## 14. Summary

Focus OS is built as:

* A deterministic system
* A minimal but powerful architecture
* A behavior-first product

The system ensures that users:

* Enter focus intentionally
* Stay with reduced friction
* Return without cognitive load

---

**End Goal:**
A system where **returning to work is easier than staying distracted.**
