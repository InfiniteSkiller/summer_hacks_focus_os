import { getReentrySuggestion } from "../utils/intelligence";

export default function ReEntry({ session, onBackToFocus }) {
  const task = session?.task || "";
  const distractionType = session?.distractionType || null;
  const suggestion = getReentrySuggestion(task, distractionType);

  return (
    <section className="screen-shell screen-enter flex h-screen w-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.18em] text-focus-muted">welcome back</p>

        <p className="mt-4 text-sm text-focus-muted">You were working on</p>
        <h2 className="mt-1 text-2xl font-medium text-focus-text">{session.task}</h2>

        <div className="my-6 h-px w-full bg-[#252538]" />

        <p className="text-xs uppercase tracking-[0.16em] text-focus-muted">Start with</p>
        <div className="mt-3 rounded-xl border-l-[3px] border-focus-accent bg-[#13131a] p-4">
          <p className="text-sm text-focus-text">{suggestion}</p>
        </div>

        <button
          type="button"
          onClick={onBackToFocus}
          className="mt-8 h-13 w-full rounded-xl bg-focus-accent text-sm font-medium text-white"
        >
          I&apos;m back - lock in -&gt;
        </button>
      </div>
    </section>
  );
}
