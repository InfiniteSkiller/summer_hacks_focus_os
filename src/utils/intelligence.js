function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const HISTORY_KEY = "focusOS_intelligence_history";

function normalizeDistraction(distractionType) {
  const text = String(distractionType || "").trim().toLowerCase();

  if (!text) {
    return "none";
  }

  if (text.includes("bored")) {
    return "bored";
  }

  if (text.includes("phone") || text.includes("social")) {
    return "phone";
  }

  return text;
}

function getElapsedSecondsFromExitTime(session) {
  const { exitTime, startTime } = session || {};

  if (typeof exitTime === "number" && Number.isFinite(exitTime)) {
    return Math.max(0, exitTime);
  }

  if (typeof exitTime === "string") {
    const asNumber = Number(exitTime);
    if (Number.isFinite(asNumber)) {
      return Math.max(0, asNumber);
    }

    const exitDateMs = Date.parse(exitTime);
    const startDateMs = Date.parse(startTime || "");
    if (Number.isFinite(exitDateMs) && Number.isFinite(startDateMs)) {
      return Math.max(0, Math.round((exitDateMs - startDateMs) / 1000));
    }
  }

  return null;
}

function getStoredHistory() {
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

function saveStoredHistory(history) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 3)));
}

export function storeSessionHistory(session) {
  const history = getStoredHistory();
  const normalized = {
    plannedMinutes: Number(session?.plannedMinutes || session?.duration || 0),
    actualFocusSeconds: Number(session?.actualFocusSeconds || 0),
    exitCount: Number(session?.exitCount || 0),
    distractionType: session?.distractionType || "",
    exitTime: session?.exitTime ?? null,
    startTime: session?.startTime ?? null,
  };
  const next = [normalized, ...history].slice(0, 3);
  saveStoredHistory(next);
  return next;
}

export function getSessionHistory() {
  return getStoredHistory().slice(0, 3);
}

export function computeSessionMetrics(session) {
  const plannedMinutes = Number(session?.plannedMinutes || session?.duration || 0);
  const plannedSeconds = Math.max(0, plannedMinutes * 60);
  const actualFocusSeconds = Math.max(0, Number(session?.actualFocusSeconds || 0));
  const exitCount = Math.max(0, Number(session?.exitCount || 0));

  const focusRatio = plannedSeconds > 0 ? clamp(actualFocusSeconds / plannedSeconds, 0, 1) : 0;

  const elapsedAtExit = getElapsedSecondsFromExitTime(session);
  const earlyExitThreshold = plannedSeconds * 0.4;
  const earlyExit =
    exitCount > 0 &&
    plannedSeconds > 0 &&
    elapsedAtExit !== null &&
    elapsedAtExit < earlyExitThreshold;

  const dominantDistraction = normalizeDistraction(session?.distractionType);

  const history = getSessionHistory();
  const recent = [
    {
      plannedMinutes,
      exitCount,
      exitTime: session?.exitTime ?? null,
      startTime: session?.startTime ?? null,
      distractionType: session?.distractionType || "",
    },
    ...history,
  ].slice(0, 3);

  const exitTimes = recent
    .map((item) => {
      const elapsed = getElapsedSecondsFromExitTime(item);
      return elapsed !== null ? elapsed : null;
    })
    .filter((value) => typeof value === "number");

  const avgExitTimeSeconds =
    exitTimes.length > 0
      ? Math.round(exitTimes.reduce((sum, value) => sum + value, 0) / exitTimes.length)
      : null;
  const avgExitTime = avgExitTimeSeconds !== null ? avgExitTimeSeconds / 60 : null;

  const earlyExitCountInRecent = recent.filter((item) => {
    const planned = Number(item?.plannedMinutes || item?.duration || 0) * 60;
    const itemExitCount = Number(item?.exitCount || 0);
    const itemElapsed = getElapsedSecondsFromExitTime(item);
    return itemExitCount > 0 && planned > 0 && itemElapsed !== null && itemElapsed < planned * 0.4;
  }).length;

  const repeatedEarlyExits = earlyExitCountInRecent >= 2;

  const distractionFreq = recent.reduce((acc, item) => {
    const key = normalizeDistraction(item?.distractionType);
    if (!key || key === "none") {
      return acc;
    }
    return {
      ...acc,
      [key]: (acc[key] || 0) + 1,
    };
  }, {});

  const historyDominantDistraction =
    Object.entries(distractionFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || dominantDistraction;

  let productivityLevel = "low";
  if (focusRatio >= 0.8) {
    productivityLevel = "high";
  } else if (focusRatio >= 0.5) {
    productivityLevel = "medium";
  }

  return {
    focusRatio,
    earlyExit,
    dominantDistraction: historyDominantDistraction,
    productivityLevel,
    exitCount,
    avgExitTime,
    repeatedEarlyExits,
  };
}

export function generateInsight(metrics) {
  const exitCount = Math.max(0, Number(metrics?.exitCount || 0));
  const earlyExit = Boolean(metrics?.earlyExit);
  const dominantDistraction = String(metrics?.dominantDistraction || "none");
  const focusRatio = Number(metrics?.focusRatio || 0);
  const avgExitTime = metrics?.avgExitTime;
  const repeatedEarlyExits = Boolean(metrics?.repeatedEarlyExits);

  const insights = [];

  if (exitCount === 0) {
    insights.push("You stayed focused throughout the session.");
  }

  if (earlyExit) {
    insights.push("You tend to lose focus early in your sessions.");
  }

  if (focusRatio < 0.5) {
    insights.push("You are losing more than half your planned focus time.");
  }

  if (dominantDistraction === "bored") {
    insights.push("Boredom is your main distraction.");
  }

  if (exitCount >= 2) {
    insights.push("Multiple interruptions are breaking your flow.");
  }

  if (typeof avgExitTime === "number" && Number.isFinite(avgExitTime)) {
    insights.push(`You usually lose focus around ${Math.round(avgExitTime)} minutes.`);
  }

  if (repeatedEarlyExits) {
    insights.push("You’ve exited early in most recent sessions.");
  }

  if (!insights.length) {
    insights.push("Decent session, but there is room for improvement.");
  }

  return insights.join(" ");
}

export function generateActionSuggestion(metrics) {
  if (metrics?.earlyExit) {
    return "Start with a smaller goal (10–15 min sessions)";
  }

  if (Number(metrics?.focusRatio || 0) < 0.5) {
    return "Reduce distractions or shorten your focus window";
  }

  if (String(metrics?.dominantDistraction || "") === "bored") {
    return "Break your task into smaller steps";
  }

  return "Continue with the same strategy";
}

export function getReentrySuggestion(task, distractionType, options = {}) {
  const taskText = String(task || "").toLowerCase();
  const distraction = String(distractionType || "").toLowerCase();
  const earlyExit = Boolean(options?.earlyExit);

  if (earlyExit && distraction.includes("bored")) {
    return "You left early due to boredom. Start small: -> Do the first simple step only";
  }

  if (taskText.includes("ppt")) {
    return "Start by writing the title of the first slide.";
  }

  if (taskText.includes("code")) {
    return "Start with a small function or bug fix.";
  }

  if (distraction.includes("bored")) {
    return "Start with a very small step to regain momentum.";
  }

  return "Resume your task with the next small step.";
}
