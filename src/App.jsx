import { useEffect, useState } from "react";
import LockIn from "./screens/LockIn";
import FocusMode from "./screens/FocusMode";
import ExitJournal from "./screens/ExitJournal";
import ReEntry from "./screens/ReEntry";
import Summary from "./screens/Summary";
import { clearSession, getSession, saveSession } from "./utils/storage";
import extensionBridge from "./api/extension-bridge";

export default function App() {
  const [appState, setAppState] = useState("lockin");
  const [session, setSession] = useState(getSession());
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  useEffect(() => {
    const initExtension = async () => {
      const available = await extensionBridge.init();
      setExtensionAvailable(available);
      if (available) {
        console.log('[App] Extension initialized');
      } else {
        console.log('[App] Extension not available');
      }
    };
    initExtension();

    const stored = getSession();
    if (stored?.task && !stored.completed) {
      setSession(stored);
    }
  }, []);

  function handleLockIn({ task, duration }) {
    const nextSession = {
      task: task.trim(),
      duration,
      startTime: new Date().toISOString(),
      endTime: "",
      exitTime: null,
      completed: false,
      exitCount: 0,
      distractionType: "",
      breakIntent: "",
      actualFocusSeconds: 0,
    };
    saveSession(nextSession);
    setSession(nextSession);
    setAppState("focus");

    // Start focus session in extension
    if (extensionAvailable) {
      extensionBridge
        .startFocusSession({
          whitelist: [
            'github.com', 'docs.google.com', 'stackoverflow.com', 'npmjs.com',
            'mail.google.com', 'slack.com', 'figma.com', 'linear.app',
            'notion.so', 'developer.chrome.com', 'mdn.mozilla.org',
            'caniuse.com', 'google.com', 'wikipedia.org', 'openai.com'
          ]
        })
        .then((result) => {
          if (result.success) {
            console.log('[App] Focus session started:', result.data);
          }
        });
    }
  }

  function handleReturnToReentry(distraction) {
    const current = getSession();
    if (!current) return;
    const nextSession = { ...current, distractionType: distraction };
    saveSession(nextSession);
    setSession(nextSession);
    setAppState("reentry");
  }

  function handleResumeFocus() {
    const current = getSession();
    if (!current) return;
    const nextSession = { ...current, startTime: new Date().toISOString(), exitTime: null };
    saveSession(nextSession);
    setSession(nextSession);
    setAppState("focus");
  }

  function handleEndSession() {
    clearSession();
    setSession(null);
    setAppState("lockin");

    // End focus session in extension
    if (extensionAvailable) {
      extensionBridge
        .endFocusSession({ cleanup: true })
        .then((result) => {
          if (result.success) {
            console.log('[App] Focus session ended');
          }
        });
    }
  }

  function renderScreen() {
    if (appState === "lockin") {
      return <LockIn onLockIn={handleLockIn} setAppState={setAppState} />;
    }

    if (appState === "focus" && session) {
      return <FocusMode session={session} setAppState={setAppState} />;
    }

    if (appState === "exit" && session) {
      return (
        <ExitJournal
          onReturn={handleReturnToReentry}
          onEndSession={handleEndSession}
          setAppState={setAppState}
        />
      );
    }

    if (appState === "reentry" && session) {
      return <ReEntry session={session} onBackToFocus={handleResumeFocus} setAppState={setAppState} />;
    }

    if (appState === "summary") {
      return <Summary setAppState={setAppState} />;
    }

    if (appState === "dashboard") {
      return (
        <section className="screen-shell flex h-screen w-screen items-center justify-center px-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-focus-muted">dashboard</p>
            <h2 className="mt-3 text-2xl font-medium text-white">Coming soon</h2>
          </div>
        </section>
      );
    }

    return <LockIn onLockIn={handleLockIn} setAppState={setAppState} />;
  }

  return (
    <main className="min-h-screen w-screen bg-focus-bg text-focus-text">
      <div
        key={appState}
        style={{
          animation: "fadeIn 0.4s ease",
          width: "100vw",
          height: "100vh",
        }}
      >
        {renderScreen()}
      </div>
    </main>
  );
}
