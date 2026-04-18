/**
 * Extension Bridge
 * Posts focus control messages to the page so content scripts can relay them.
 */

function canPostMessage() {
  return typeof window !== 'undefined' && typeof window.postMessage === 'function';
}

function readArrayFromLocalStorage(key) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

function getFocusPayload(fallbackSites = []) {
  const storedFocusSites = readArrayFromLocalStorage('focusSites');
  const storedBlockedSites = readArrayFromLocalStorage('blockedSites');

  return {
    focusSites: storedFocusSites.length > 0 ? storedFocusSites : fallbackSites,
    blockedSites: storedBlockedSites
  };
}

export function startFocusMode(payload = {}) {
  if (!canPostMessage()) {
    return false;
  }

  window.postMessage(
    {
      type: 'FOCUS_START',
      payload
    },
    '*'
  );
  return true;
}

export function stopFocusMode() {
  if (!canPostMessage()) {
    return false;
  }

  window.postMessage({ type: 'FOCUS_STOP' }, '*');
  return true;
}

export function startBreakMode() {
  if (!canPostMessage()) {
    return false;
  }

  window.postMessage({ type: 'BREAK_START' }, '*');
  return true;
}

export function endBreakMode() {
  if (!canPostMessage()) {
    return false;
  }

  window.postMessage({ type: 'BREAK_END' }, '*');
  return true;
}

class ExtensionBridge {
  constructor() {
    this.available = false;
    this.initialized = false;
  }

  async init() {
    this.available = canPostMessage();
    this.initialized = true;
    return this.available;
  }

  isAvailable() {
    return this.available;
  }

  async startFocusSession(options = {}) {
    const fallbackSites = Array.isArray(options?.whitelist) ? options.whitelist : [];
    const payload = getFocusPayload(fallbackSites);
    const sent = startFocusMode(payload);
    return sent
      ? { success: true, data: { sent: true } }
      : { success: false, error: 'Bridge unavailable', reason: 'bridge_unavailable' };
  }

  async endFocusSession() {
    const sent = stopFocusMode();
    return sent
      ? { success: true, data: { sent: true } }
      : { success: false, error: 'Bridge unavailable', reason: 'bridge_unavailable' };
  }

  async startBreakSession() {
    const sent = startBreakMode();
    return sent
      ? { success: true, data: { sent: true } }
      : { success: false, error: 'Bridge unavailable', reason: 'bridge_unavailable' };
  }

  async endBreakSession() {
    const sent = endBreakMode();
    return sent
      ? { success: true, data: { sent: true } }
      : { success: false, error: 'Bridge unavailable', reason: 'bridge_unavailable' };
  }

  async getSessionStatus() {
    return { success: false, error: 'Not implemented in postMessage bridge' };
  }

  async getWhitelist() {
    return { success: false, error: 'Not implemented in postMessage bridge' };
  }

  async updateWhitelist() {
    return { success: false, error: 'Not implemented in postMessage bridge' };
  }

  async addToWhitelist() {
    return { success: false, error: 'Not implemented in postMessage bridge' };
  }

  async removeFromWhitelist() {
    return { success: false, error: 'Not implemented in postMessage bridge' };
  }
}

const extensionBridge = new ExtensionBridge();

export default extensionBridge;
