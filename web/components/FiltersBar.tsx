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
    <div className="filters">
      <input
        className="input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter hackathons… (try: AI, serverless, fintech)"
        aria-label="Search hackathons"
      />
      {MODES.map((m) => (
        <button
          key={m}
          className={`chip ${mode === m ? "active" : ""}`}
          onClick={() => setMode(m)}
        >
          {m === "all" ? "All modes" : m}
        </button>
      ))}
    </div>
  );
}
