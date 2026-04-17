/**
 * Extension Bridge
 * Handles communication between React app and Chrome extension
 */

class ExtensionBridge {
  constructor() {
    this.available = false;
    this.initialized = false;
    this.bridge = null;
  }

  async init() {
    if (this.initialized) return this.available;

    return new Promise((resolve) => {
      const checkBridge = () => {
        if (window.__focusOSBridge) {
          console.log('[ExtensionBridge] Bridge found');
          this.bridge = window.__focusOSBridge;

          this.bridge.sendMessage({ type: 'PING' }).then((response) => {
            if (response?.pong) {
              console.log('[ExtensionBridge] Extension ready');
              this.available = true;
            } else {
              this.available = false;
            }
            this.initialized = true;
            resolve(this.available);
          }).catch(() => {
            this.available = false;
            this.initialized = true;
            resolve(false);
          });
        } else {
          setTimeout(checkBridge, 100);
        }
      };

      checkBridge();

      setTimeout(() => {
        if (!this.initialized) {
          this.available = false;
          this.initialized = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  isAvailable() {
    return this.available;
  }

  sendMessage(message) {
    if (!this.available || !this.bridge) {
      return Promise.resolve({
        success: false,
        error: 'Extension not available',
        reason: 'extension_not_installed'
      });
    }

    return this.bridge
      .sendMessage({ type: message.type, ...message })
      .catch((error) => {
        console.error('[ExtensionBridge] Error:', error);
        return {
          success: false,
          error: error.message,
          reason: 'message_error'
        };
      });
  }

  async startFocusSession(options = {}) {
    console.log('[ExtensionBridge] Starting session', options);
    return this.sendMessage({
      type: 'START_FOCUS_SESSION',
      options
    });
  }

  async endFocusSession(options = {}) {
    console.log('[ExtensionBridge] Ending session', options);
    return this.sendMessage({
      type: 'END_FOCUS_SESSION',
      options
    });
  }

  async getSessionStatus() {
    return this.sendMessage({
      type: 'GET_SESSION_STATUS'
    });
  }

  async getWhitelist() {
    return this.sendMessage({
      type: 'GET_WHITELIST'
    });
  }

  async updateWhitelist(whitelist) {
    return this.sendMessage({
      type: 'UPDATE_WHITELIST',
      whitelist
    });
  }

  async addToWhitelist(domain) {
    return this.sendMessage({
      type: 'ADD_TO_WHITELIST',
      whitelist: domain
    });
  }

  async removeFromWhitelist(domain) {
    return this.sendMessage({
      type: 'REMOVE_FROM_WHITELIST',
      whitelist: domain
    });
  }
}

export default new ExtensionBridge();
