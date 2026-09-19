// DynamoDB access. Phase 0: in-memory seed fallback so `bun run dev` works with zero AWS.
import type { Hackathon } from "@hackmaxx/shared";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

let cache: Hackathon[] | null = null;

function parseSeed(): Hackathon[] {
  const path = join(import.meta.dir, "../../../data/seed.csv");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf8").trim().split("\n");
  const [header, ...rows] = raw;
  const cols = header.split(",");
  return rows.map((line, i) => {
    const vals = line.split(",");
    const o: Record<string, string> = {};
    cols.forEach((c, j) => (o[c.trim()] = (vals[j] ?? "").trim()));
    return {
      id: o.id || `seed_${i}`,
      title: o.title,
      url: o.url,
      platform: o.platform || "Devpost",
      deadline: o.deadline,
      prize_inr: Number(o.prize_inr || 0),
      tech_tags: (o.tech_tags || "").split("|").filter(Boolean),
      mode: (o.mode as Hackathon["mode"]) || "online",
      description: o.description,
      reputation_score: Number(o.reputation_score || 0.7),
      difficulty_score: Number(o.difficulty_score || 0.5),
    } as Hackathon;
  });
}

export async function listHackathons(): Promise<Hackathon[]> {
  // TODO Phase 1: replace with DynamoDB Scan (AWS SDK v3) when HACKATHONS_TABLE is set.
  if (!cache) cache = parseSeed();
  return cache;
}
