/**
 * Injected Bridge Script
 * Loaded via chrome.runtime.getURL() to bypass CSP
 */

(function() {
  console.log('[injected-bridge.js] Init');

  class FocusOSBridge {
    constructor() {
      this.messageId = 0;
      this.pending = new Map();
    }

    sendMessage(message) {
      return new Promise((resolve, reject) => {
        const id = ++this.messageId;
        
        const timeout = setTimeout(() => {
          window.removeEventListener('message', handler);
          this.pending.delete(id);
          reject(new Error('Timeout'));
        }, 5000);
        
        const handler = (event) => {
          if (event.data.type === 'FOCUS_OS_RESPONSE' && event.data.id === id) {
            clearTimeout(timeout);
            window.removeEventListener('message', handler);
            this.pending.delete(id);
            resolve(event.data.data);
          }
        };
        
        window.addEventListener('message', handler);
        this.pending.set(id, handler);
        
        window.postMessage({
          type: 'FOCUS_OS_' + message.type,
          id,
          data: message
        }, '*');
      });
    }
  }

  window.__focusOSBridge = new FocusOSBridge();
  console.log('[injected-bridge.js] Ready');
})();
