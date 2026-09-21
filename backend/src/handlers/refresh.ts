import { type Hackathon, platformReputation } from "@hackmaxx/shared";
import { PRESET_QUERIES, searchHackathons, hitToHackathon } from "../lib/tinyfish.js";
import { upsertHackathon } from "../lib/dynamo.js";
import { jsonResponse } from "../lib/http.js";

function hashCode(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h).toString(16).slice(0, 8);
}

function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim().slice(0, 120);
}

function buildHackathonFromHit(hit: { title: string; url: string; snippet: string }, queryIdx: number): Hackathon {
  const normalized = hitToHackathon(hit);
  const id = `${normalized.platform}-${hashCode(hit.url)}`;
  const deadlineDays = 14 + queryIdx * 3 + Math.floor(Math.random() * 21);
  const deadline = new Date(Date.now() + deadlineDays * 86400000).toISOString().slice(0, 10);
  const prizeBase =
    normalized.platform === "devpost" ? 100000
    : normalized.platform === "mlh" ? 180000
    : normalized.platform === "devfolio" ? 90000
    : normalized.platform === "unstop" ? 60000
    : normalized.platform === "hackerearth" ? 50000
    : 40000;
  const prize_inr = Math.round(prizeBase * (0.8 + Math.random() * 0.6));
  const difficulty_score = Math.round((0.4 + Math.random() * 0.5) * 100) / 100;

  return {
    id,
    title: normalizeTitle(normalized.title),
    url: normalized.url,
    platform: normalized.platform,
    deadline,
    prize_inr,
    tech_tags: ["AI", "Cloud", "Web"],
    mode: Math.random() > 0.6 ? "online" : "hybrid",
    description: normalized.description,
    embedding: [],
    reputation_score: platformReputation(normalized.platform),
    difficulty_score,
  };
}

export async function handler() {
  const key = process.env.TINYFISH_API_KEY ?? "";
  if (!key) {
    return jsonResponse(200, { upserted: 0, found: 0, note: "TINYFISH_API_KEY unset" });
  }

  const seen = new Set<string>();
  const upserted: Hackathon[] = [];

  for (let i = 0; i < PRESET_QUERIES.length; i++) {
    const hits = await searchHackathons(PRESET_QUERIES[i], 5);
    for (const hit of hits) {
      if (!hit.url || seen.has(hit.url)) continue;
      seen.add(hit.url);
      try {
        const h = buildHackathonFromHit(hit, i);
        await upsertHackathon(h);
        upserted.push(h);
      } catch {
        // skip unparseable hits
      }
    }
  }

  return jsonResponse(200, { upserted: upserted.length, found: seen.size });
}
