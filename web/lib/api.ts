import type { Hackathon, ProjectInput, RecommendResponse } from "@hackmaxx/shared";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function fetchHackathons(q = ""): Promise<Hackathon[]> {
  const r = await fetch(`${BASE}/hackathons${q ? `?q=${encodeURIComponent(q)}` : ""}`, { cache: "no-store" });
  if (!r.ok) throw new Error("failed to load hackathons");
  return r.json();
}

export async function recommend(p: ProjectInput): Promise<RecommendResponse> {
  const r = await fetch(`${BASE}/recommend`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error("recommend failed");
  return r.json();
}
