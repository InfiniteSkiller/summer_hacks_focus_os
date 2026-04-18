/**
 * Injected Bridge Script
 * Runs in page context and emits bridge-level events.
 */

(function() {
  try {
    console.log("INJECTED BRIDGE ACTIVE");
  } catch (error) {
    console.warn('[injected-bridge.js] Bridge init failed:', error);
  }
})();
