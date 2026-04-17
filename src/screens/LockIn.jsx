import { useState } from "react";

export default function LockIn({ onLockIn }) {
  const [task, setTask] = useState("");
  const [durationType, setDurationType] = useState("25");
  const [customDuration, setCustomDuration] = useState(30);

  const duration = durationType === "custom" ? Number(customDuration || 1) : Number(durationType);
  const isDisabled = !task.trim();

  function handleSubmit() {
    if (isDisabled) {
      return;
    }
    onLockIn({ task: task.trim(), duration });
  }

  return (
    <section className="screen-shell screen-enter relative flex h-screen w-screen items-center justify-center px-6">
      <p className="absolute left-6 top-6 text-[14px] font-medium text-focus-accent">Focus OS</p>

      <div className="w-full max-w-md">
        <h1 className="text-[28px] font-medium text-focus-text">What are you working on?</h1>
        <p className="mt-2 text-sm text-focus-muted">Lock in. Go deep. Come back.</p>

        <input
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="e.g. Build the login screen..."
          className="mt-6 h-12 w-full rounded-xl border border-[#2a2940] bg-[#13131a] px-4 text-sm text-focus-text outline-none transition focus:border-focus-accent"
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDurationType("25")}
            className={`rounded-full px-4 py-2 text-sm ${
              durationType === "25"
                ? "bg-focus-accent text-white"
                : "border border-[#2b2a3d] bg-[#13131a] text-focus-muted"
            }`}
          >
            25 min
          </button>
          <button
            type="button"
            onClick={() => setDurationType("50")}
            className={`rounded-full px-4 py-2 text-sm ${
              durationType === "50"
                ? "bg-focus-accent text-white"
                : "border border-[#2b2a3d] bg-[#13131a] text-focus-muted"
            }`}
          >
            50 min
          </button>
          <button
            type="button"
            onClick={() => setDurationType("custom")}
            className={`rounded-full px-4 py-2 text-sm ${
              durationType === "custom"
                ? "bg-focus-accent text-white"
                : "border border-[#2b2a3d] bg-[#13131a] text-focus-muted"
            }`}
          >
            Custom
          </button>
        </div>

        {durationType === "custom" ? (
          <input
            type="number"
            min={1}
            value={customDuration}
            onChange={(event) => setCustomDuration(Number(event.target.value || 1))}
            className="mt-3 h-11 w-full rounded-xl border border-[#2a2940] bg-[#13131a] px-4 text-sm text-focus-text outline-none focus:border-focus-accent"
            placeholder="Enter custom minutes"
          />
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="mt-6 h-12 w-full rounded-xl bg-focus-accent text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          Lock In -&gt;
        </button>
      </div>
    </section>
  );
}
