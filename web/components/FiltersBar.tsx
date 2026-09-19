const MODES = ["all", "online", "offline", "hybrid"] as const;
export type ModeFilter = (typeof MODES)[number];

export function FiltersBar({
  q, setQ, mode, setMode,
}: {
  q: string;
  setQ: (v: string) => void;
  mode: ModeFilter;
  setMode: (m: ModeFilter) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <label className="input min-w-56 flex-1">
        <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter hackathons… (try: AI, serverless, fintech)"
          aria-label="Search hackathons"
        />
      </label>
      {MODES.map((m) => (
        <button
          key={m}
          className={`btn btn-sm rounded-full ${mode === m ? "btn-primary" : "btn-ghost border-base-content/15"}`}
          onClick={() => setMode(m)}
        >
          {m === "all" ? "All modes" : m}
        </button>
      ))}
    </div>
  );
}
