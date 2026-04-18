// Focus OS Tab Manager - Service Worker
console.log("BACKGROUND SERVICE WORKER RUNNING");

let isFocusActive = false;
let isBreak = false;
let focusGroupId = null;
const focusTabIds = new Set();
const STATE_STORAGE_KEYS = [
  "isFocusActive",
  "isBreak",
  "focusSites",
  "blockedSites",
  "focusGroupId"
];

const DEFAULT_FOCUS_SITES = [
  "localhost",
  "docs.google.com",
  "github.com"
];

const DEFAULT_BLOCKED_SITES = [];

let focusSites = [...DEFAULT_FOCUS_SITES];
let blockedSites = [...DEFAULT_BLOCKED_SITES];

async function hydrateStateFromStorage() {
  try {
    const stored = await chrome.storage.local.get(STATE_STORAGE_KEYS);

    isFocusActive = Boolean(stored?.isFocusActive);
    isBreak = Boolean(stored?.isBreak);
    focusSites = normalizeSiteList(stored?.focusSites, DEFAULT_FOCUS_SITES);
    blockedSites = normalizeSiteList(stored?.blockedSites, DEFAULT_BLOCKED_SITES);
    focusGroupId = Number.isInteger(stored?.focusGroupId) ? stored.focusGroupId : null;

    focusTabIds.clear();
    if (focusGroupId !== null) {
      try {
        const groupedTabs = await chrome.tabs.query({ groupId: focusGroupId });
        groupedTabs.forEach((tab) => {
          if (typeof tab?.id === "number") {
            focusTabIds.add(tab.id);
          }
        });
      } catch {
        focusGroupId = null;
      }
    }
  } catch (error) {
    console.warn("[background.js] Failed to hydrate state:", error);
  }
}

function persistRuntimeState() {
  return chrome.storage.local.set({
    isFocusActive,
    isBreak,
    focusSites,
    blockedSites,
    focusGroupId
  });
}

const stateHydrationPromise = hydrateStateFromStorage();

function normalizeSiteList(value, fallback = []) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean);

  return normalized.length > 0 ? [...new Set(normalized)] : [...fallback];
}

function toRuntimeUrl(site) {
  if (!site) {
    return "";
  }

  if (site.startsWith("http://") || site.startsWith("https://")) {
    return site;
  }

  if (site === "localhost") {
    return "http://localhost:5173";
  }

  if (site.startsWith("localhost:")) {
    return `http://${site}`;
  }

  return `https://${site}`;
}

function isAllowed(url, tab = null) {
  const normalizedUrl = (url || "").toLowerCase();

  if (isBreak) {
    return true;
  }

  if (blockedSites.some((site) => normalizedUrl.includes(site))) {
    return false;
  }

  const tabId = tab?.id;
  const belongsToFocusGroup =
    focusGroupId !== null &&
    ((tab?.groupId ?? -1) === focusGroupId || (typeof tabId === "number" && focusTabIds.has(tabId)));

  if (belongsToFocusGroup) {
    return true;
  }

  return focusSites.some((site) => normalizedUrl.includes(site));
}

function isIgnoredUrl(url) {
  if (!url) {
    return true;
  }

  const blockedPageUrl = chrome.runtime.getURL("blocked.html");
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith(blockedPageUrl)
  );
}

async function handleDistraction(tab) {
  if (!isFocusActive) {
    return;
  }

  if (isBreak) {
    return;
  }

  const tabId = tab?.id;
  const url = tab?.url || "";

  if (!tabId) {
    return;
  }

  if (isIgnoredUrl(url)) {
    return;
  }

  if (blockedSites.some((site) => url.toLowerCase().includes(site))) {
    console.log(`BLOCKED: ${url}`);
  } else if (isAllowed(url, tab)) {
    return;
  } else {
    console.log(`BLOCKED: ${url}`);
  }

  const blockedPageUrl = chrome.runtime.getURL("blocked.html");
  const redirectUrl = `${blockedPageUrl}?url=${encodeURIComponent(url)}`;

  try {
    await chrome.tabs.update(tabId, { url: redirectUrl });
  } catch (error) {
    console.error("[background.js] Redirect error:", error);
  }
}

async function startFocusSession(options = {}) {
  try {
    focusSites = normalizeSiteList(options?.focusSites || options?.allowedSites, DEFAULT_FOCUS_SITES);
    blockedSites = normalizeSiteList(options?.blockedSites, DEFAULT_BLOCKED_SITES);
    isFocusActive = true;
    isBreak = false;
    console.log("FOCUS MODE ON");
    focusTabIds.clear();
    focusGroupId = null;

    const initialTargets = ["http://localhost:5173", ...focusSites.map((site) => toRuntimeUrl(site))]
      .filter(Boolean);
    const targetUrls = [...new Set(initialTargets)];
    const createdTabIds = [];

    for (const target of targetUrls) {
      try {
        const tab = await chrome.tabs.create({ url: target, active: false });
        if (tab?.id) {
          createdTabIds.push(tab.id);
          focusTabIds.add(tab.id);
        }
      } catch (error) {
        console.warn("[background.js] Failed to create tab:", target, error);
      }
    }

    if (createdTabIds.length > 0) {
      focusGroupId = await chrome.tabs.group({ tabIds: createdTabIds });
      await chrome.tabGroups.update(focusGroupId, {
        title: "Focus Mode",
        color: "blue",
        collapsed: false
      });
      console.log("FOCUS GROUP CREATED");
    }

    await persistRuntimeState();

    return {
      success: true,
      data: {
        focusGroupId,
        focusSiteCount: focusSites.length,
        blockedSiteCount: blockedSites.length
      }
    };
  } catch (error) {
    console.error('[background.js] Error:', error);
    return { success: false, error: error.message };
  }
}

async function endFocusSession() {
  try {
    isFocusActive = false;
    isBreak = false;
    focusGroupId = null;
    focusTabIds.clear();
    console.log("FOCUS MODE OFF");

    await persistRuntimeState();

    return {
      success: true,
      data: {
        isFocusActive,
        isBreak
      }
    };
  } catch (error) {
    console.error('[background.js] Error:', error);
    return { success: false, error: error.message };
  }
}

async function getFocusSessionStatus() {
  try {
    return {
      active: isFocusActive,
      isBreak,
      focusGroupId,
      focusSites: [...focusSites],
      blockedSites: [...blockedSites]
    };
  } catch (error) {
    return { active: false, error: error.message };
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await stateHydrationPromise;

  if (!isFocusActive) {
    return;
  }

  if (isBreak) {
    return;
  }

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const url = tab?.url || "";

    if (isIgnoredUrl(url)) {
      return;
    }

    if (isAllowed(url, tab)) {
      return;
    }

    await handleDistraction(tab);
  } catch (error) {
    console.error("[background.js] onActivated error:", error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await stateHydrationPromise;

  if (!isFocusActive) {
    return;
  }

  if (isBreak) {
    return;
  }

  if (changeInfo.status !== "loading" && !changeInfo.url) {
    return;
  }

  const candidateUrl = changeInfo.url || tab?.url || "";

  try {
    if (isIgnoredUrl(candidateUrl)) {
      return;
    }

    if (isAllowed(candidateUrl, { id: tabId, groupId: tab?.groupId })) {
      return;
    }

    await handleDistraction({ id: tabId, url: candidateUrl });
  } catch (error) {
    console.error("[background.js] onUpdated error:", error);
  }
});

// Message router
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  void sender;

  stateHydrationPromise
    .then(() => {
      if (!msg || !msg.type) {
        sendResponse({ status: 'ignored' });
        return;
      }

      if (msg.type === 'FOCUS_START') {
        startFocusSession(msg?.payload || {})
          .then(() => sendResponse({ status: 'started' }))
          .catch((error) => sendResponse({ status: 'error', error: error.message }));
        return;
      }

      if (msg.type === 'FOCUS_STOP') {
        endFocusSession()
          .then(() => sendResponse({ status: 'stopped' }))
          .catch((error) => sendResponse({ status: 'error', error: error.message }));
        return;
      }

      if (msg.type === 'BREAK_START') {
        isBreak = true;
        console.log("BREAK MODE ON");
        persistRuntimeState()
          .then(() => sendResponse({ status: 'break_started' }))
          .catch((error) => sendResponse({ status: 'error', error: error.message }));
        return;
      }

      if (msg.type === 'BREAK_END') {
        isBreak = false;
        console.log("BREAK MODE OFF");
        persistRuntimeState()
          .then(() => sendResponse({ status: 'break_ended' }))
          .catch((error) => sendResponse({ status: 'error', error: error.message }));
        return;
      }

      sendResponse({ status: 'ignored' });
    })
    .catch((error) => {
      sendResponse({ status: 'error', error: error.message });
    });

  return true;
});
