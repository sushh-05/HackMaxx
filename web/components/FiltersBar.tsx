export function FiltersBar({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Filter hackathons… (try: AI, serverless)"
      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
    />
  );
}
