// TinyFish Search/Fetch wrapper — live hackathon discovery for Ship It track.
const SEARCH_URL = process.env.TINYFISH_SEARCH_URL ?? "https://api.search.tinyfish.ai";
const FETCH_URL = process.env.TINYFISH_FETCH_URL ?? "https://api.fetch.tinyfish.ai";
const API_KEY = process.env.TINYFISH_API_KEY ?? "";

export interface TinyFishHit {
  title: string;
  url: string;
  snippet: string;
  site_name?: string;
}

interface SearchResponse {
  query?: string;
  results?: TinyFishHit[];
}

interface FetchResponse {
  url?: string;
  content?: string;
}

async function tinyfishFetch<T>(url: string, init: RequestInit): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const r = await fetch(url, {
      ...init,
      headers: {
        "X-API-Key": API_KEY,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function searchHackathons(query: string, limit = 10): Promise<TinyFishHit[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  const data = await tinyfishFetch<SearchResponse>(`${SEARCH_URL}?${params.toString()}`, { method: "GET" });
  return data?.results ?? [];
}

export async function fetchPage(url: string): Promise<string> {
  const data = await tinyfishFetch<FetchResponse>(FETCH_URL, {
    method: "POST",
    body: JSON.stringify({ url, format: "markdown" }),
  });
  return data?.content ?? "";
}

/** Queries tuned to find real upcoming hackathons across major platforms. */
export const PRESET_QUERIES = [
  "Devpost hackathon 2026",
  "MLH hackathon 2026",
  "Devfolio hackathon 2026",
  "Unstop hackathon India 2026",
  "HackerEarth hackathon 2026",
];

/** Heuristic: turn a TinyFish search hit into a minimal Hackathon row. */
export function hitToHackathon(hit: TinyFishHit): {
  title: string;
  url: string;
  platform: string;
  description: string;
} {
  const domain = new URL(hit.url).hostname.replace(/^www\./, "").toLowerCase();
  const platform =
    domain.includes("devpost") ? "devpost"
    : domain.includes("mlh.io") ? "mlh"
    : domain.includes("devfolio") ? "devfolio"
    : domain.includes("unstop") ? "unstop"
    : domain.includes("hackerearth") ? "hackerearth"
    : "other";
  return {
    title: hit.title,
    url: hit.url,
    platform,
    description: hit.snippet,
  };
}
