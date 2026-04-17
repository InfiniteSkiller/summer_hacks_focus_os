const KEY = "focusOS_session";
const HISTORY_KEY = "focusOS_sessions";

const defaults = {
  task: "",
  duration: 25,
  startTime: "",
  endTime: "",
  exitTime: null,
  completed: false,
  exitCount: 0,
  distractionType: "",
  breakIntent: "",
  actualFocusSeconds: 0,
};

export function getSession() {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (typeof window === "undefined") {
    return;
  }
  const normalized = {
    ...defaults,
    ...session,
  };
  window.localStorage.setItem(KEY, JSON.stringify(normalized));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(KEY);
}

export function incrementExitCount() {
  const session = getSession();
  if (!session) {
    return null;
  }
  const nextSession = {
    ...session,
    exitCount: Number(session.exitCount || 0) + 1,
  };
  saveSession(nextSession);
  return nextSession;
}

export function getSessionHistory() {
  try {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionHistory(history) {
  if (typeof window === "undefined") {
    return;
  }
  const normalized = Array.isArray(history) ? history.slice(0, 5) : [];
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
}

export function appendSessionToHistory(session) {
  const history = getSessionHistory();
  const next = [session, ...history].slice(0, 5);
  saveSessionHistory(next);
  return next;
}
