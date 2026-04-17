// Focus OS Tab Manager - Service Worker
console.log('[background.js] Loaded');

const DEFAULT_WHITELIST = [
  'github.com', 'docs.google.com', 'stackoverflow.com', 'npmjs.com',
  'mail.google.com', 'slack.com', 'figma.com', 'linear.app',
  'notion.so', 'developer.chrome.com', 'mdn.mozilla.org',
  'caniuse.com', 'google.com', 'wikipedia.org', 'openai.com'
];

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[background.js] Extension installed');
  chrome.storage.local.get(null, (items) => {
    if (!items.whitelist) {
      chrome.storage.local.set({ whitelist: DEFAULT_WHITELIST });
    }
  });
});

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isWhitelisted(domain, whitelist) {
  return whitelist.some(item => domain === item || domain.endsWith('.' + item));
}

async function startFocusSession(options = {}) {
  try {
    const { whitelist = DEFAULT_WHITELIST } = options;
    const sessionId = `session_${Date.now()}`;
    
    console.log('[background.js] Starting focus session');
    
    const allTabs = await chrome.tabs.query({});
    console.log('[background.js] Found', allTabs.length, 'tabs');
    
    const focusTabs = [];
    const distractionTabs = [];
    
    allTabs.forEach(tab => {
      if (!tab.url || tab.url.startsWith('chrome://')) return;
      const domain = getDomain(tab.url);
      if (isWhitelisted(domain, whitelist)) {
        focusTabs.push(tab);
        console.log('[background.js] Focus:', domain);
      } else {
        distractionTabs.push(tab);
        console.log('[background.js] Distraction:', domain);
      }
    });
    
    console.log('[background.js] Focus:', focusTabs.length, 'Distraction:', distractionTabs.length);
    
    let focusGroupId, distractionGroupId;
    
    if (focusTabs.length > 0) {
      focusGroupId = await chrome.tabs.group({ tabIds: focusTabs.map(t => t.id) });
      await chrome.tabGroups.update(focusGroupId, {
        title: 'Focus',
        color: 'blue',
        collapsed: false
      });
      console.log('[background.js] Created focus group');
    }
    
    if (distractionTabs.length > 0) {
      distractionGroupId = await chrome.tabs.group({ tabIds: distractionTabs.map(t => t.id) });
      await chrome.tabGroups.update(distractionGroupId, {
        title: 'Distractions',
        color: 'red',
        collapsed: true
      });
      console.log('[background.js] Created distraction group');
    }
    
    const sessionState = {
      focusTabs: focusTabs.map(t => ({ id: t.id, groupId: focusGroupId })),
      distractionTabs: distractionTabs.map(t => ({ id: t.id, groupId: distractionGroupId })),
      timestamp: Date.now(),
      focusGroupId,
      distractionGroupId
    };
    
    chrome.storage.local.set({
      currentFocusSession: sessionId,
      [sessionId]: sessionState
    });
    
    return {
      success: true,
      data: {
        sessionId,
        focusTabCount: focusTabs.length,
        distractionTabCount: distractionTabs.length,
        focusGroupId,
        distractionGroupId
      }
    };
  } catch (error) {
    console.error('[background.js] Error:', error);
    return { success: false, error: error.message };
  }
}

async function endFocusSession(options = {}) {
  try {
    const { cleanup = true } = options;
    const { currentFocusSession } = await chrome.storage.local.get('currentFocusSession');
    
    if (!currentFocusSession) {
      return { success: false, error: 'No active session' };
    }
    
    const sessionState = await chrome.storage.local.get(currentFocusSession);
    const state = sessionState[currentFocusSession];
    
    if (!state) {
      return { success: false, error: 'Session state not found' };
    }
    
    console.log('[background.js] Ending focus session');
    
    const allTabsToRestore = [...state.focusTabs, ...state.distractionTabs];
    
    for (const tab of allTabsToRestore) {
      if (tab.id) {
        await chrome.tabs.ungroup(tab.id).catch(() => {});
      }
    }
    
    if (cleanup) {
      chrome.storage.local.remove([currentFocusSession, 'currentFocusSession']);
    }
    
    console.log('[background.js] Restored', allTabsToRestore.length, 'tabs');
    
    return {
      success: true,
      data: {
        sessionId: currentFocusSession,
        tabsRestored: allTabsToRestore.length
      }
    };
  } catch (error) {
    console.error('[background.js] Error:', error);
    return { success: false, error: error.message };
  }
}

async function getFocusSessionStatus() {
  try {
    const { currentFocusSession } = await chrome.storage.local.get('currentFocusSession');
    
    if (!currentFocusSession) {
      return { active: false, sessionId: null };
    }
    
    const sessionState = await chrome.storage.local.get(currentFocusSession);
    const state = sessionState[currentFocusSession];
    
    return {
      active: true,
      sessionId: currentFocusSession,
      focusTabs: state?.focusTabs?.length || 0,
      distractionTabs: state?.distractionTabs?.length || 0
    };
  } catch (error) {
    return { active: false, error: error.message };
  }
}

// Message router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[background.js] Message:', request.type);
  const { type, whitelist, options } = request;
  
  const messageType = type.replace(/^FOCUS_OS_/, '');
  
  switch (messageType) {
    case 'PING':
      sendResponse({ pong: true });
      break;
    case 'START_FOCUS_SESSION':
      startFocusSession(options).then(sendResponse);
      return true;
    case 'END_FOCUS_SESSION':
      endFocusSession(options).then(sendResponse);
      return true;
    case 'GET_SESSION_STATUS':
      getFocusSessionStatus().then(sendResponse);
      return true;
    default:
      console.log('[background.js] Unknown:', messageType);
      sendResponse({ error: 'Unknown message type' });
  }
});
