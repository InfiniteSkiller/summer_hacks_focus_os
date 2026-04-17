import { useState } from "react";
import { getSession, saveSession } from "../utils/storage";

const OPTIONS = [
  "Phone / Social media",
  "Random thoughts",
  "Felt bored",
  "Something urgent",
  "Just needed a break",
];

export default function ExitJournal({ onReturn, onEndSession }) {
  const [selected, setSelected] = useState("");

  function handleReturn() {
    if (!selected) {
      return;
    }
    const current = getSession();
    if (current) {
      saveSession({
        ...current,
        exitTime: Date.now(),
        exitCount: Number(current.exitCount || 0) + 1,
        distractionType: selected,
      });
    }
    onReturn(selected);
  }

  return (
    <section className="screen-shell screen-enter flex h-screen w-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#272737] bg-[#13131a] p-6">
        <h2 className="text-xl font-medium text-focus-text">You left the session</h2>
        <p className="mt-2 text-sm text-focus-muted">What pulled you away?</p>

        <div className="mt-5 flex flex-col gap-2">
          {OPTIONS.map((option) => {
            const active = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={`rounded-xl px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-focus-accent text-white"
                    : "border border-[#2d2d40] bg-[#0f0f15] text-focus-text"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={handleReturn}
          className="mt-5 w-full rounded-xl bg-focus-accent py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Return to focus -&gt;
        </button>

        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-focus-muted hover:text-focus-text"
          onClick={onEndSession}
        >
          End session
        </button>
      </div>
    </section>
  );
}
