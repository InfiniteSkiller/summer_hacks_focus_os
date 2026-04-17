/**
 * Content Script
 * Runs on localhost pages and bridges communication with the extension
 */

console.log('[content-script.js] Loaded on localhost page');

// Listen for messages from the web page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  // Only relay requests, NOT responses
  if (event.data.type && event.data.type.startsWith('FOCUS_OS_') && event.data.type !== 'FOCUS_OS_RESPONSE') {
    const { type, data, id } = event.data;
    console.log('[content-script] Relaying to extension:', type);

    // Send to extension
    chrome.runtime.sendMessage(
      { type, ...data },
      (response) => {
        console.log('[content-script] Response:', response);
        window.postMessage({
          type: 'FOCUS_OS_RESPONSE',
          id,
          data: response
        }, '*');
      }
    );
  }
});

// Inject bridge script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected-bridge.js');
script.onload = () => {
  console.log('[content-script.js] Bridge injected');
  this.remove();
};
(document.head || document.documentElement).appendChild(script);
