import type { Hackathon, ProjectInput, RecommendResponse } from "@hackmaxx/shared";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3011";

export interface HackathonListResult {
  items: Hackathon[];
  source: string;
  fetchedAt: string | null;
}

export async function fetchHackathons(q = "", mode = "", retries = 2): Promise<HackathonListResult> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (mode && mode !== "all") params.set("mode", mode);
  const qs = params.toString();

  try {
    const r = await fetch(`${BASE}/hackathons${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Failed to load hackathons (status ${r.status})`);
    return {
      items: await r.json(),
      source: r.headers.get("x-hackmaxx-source") ?? "AWS API Gateway",
      fetchedAt: r.headers.get("x-hackmaxx-fetched-at"),
    };
  } catch (err) {
    if (retries > 0) {
      // Auto-retry with backoff to tolerate concurrent server spin-up during `bun run dev`
      await new Promise((resolve) => setTimeout(resolve, 600));
      return fetchHackathons(q, mode, retries - 1);
    }
    throw err;
  }
}

export async function recommend(p: ProjectInput, retries = 1): Promise<RecommendResponse> {
  try {
    const r = await fetch(`${BASE}/recommend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!r.ok) throw new Error(`Recommend failed (status ${r.status})`);
    return await r.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return recommend(p, retries - 1);
    }
    throw err;
  }
}
