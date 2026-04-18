/**
 * Content Script
 * Bridges page messages to extension runtime safely.
 */

console.log("CONTENT SCRIPT LOADED");

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  const msg = event.data;

  if (!msg || !msg.type) return;

  if (
    msg.type === 'FOCUS_START' ||
    msg.type === 'FOCUS_STOP' ||
    msg.type === 'BREAK_START' ||
    msg.type === 'BREAK_END'
  ) {
    console.log("BRIDGE MESSAGE:", msg);

    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      return;
    }

    chrome.runtime.sendMessage(msg);
  }
});

if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected-bridge.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}
