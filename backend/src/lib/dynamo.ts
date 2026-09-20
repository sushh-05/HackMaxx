import type { Hackathon } from "@hackmaxx/shared";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const TABLE = process.env.HACKATHONS_TABLE ?? "";
const ddb = TABLE
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-south-1" }))
  : null;

let seedCache: Hackathon[] | null = null;

function parseSeed(): Hackathon[] {
  if (seedCache) return seedCache;
  const path = join(import.meta.dir, "../../../data/seed.csv");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf8").trim().split("\n");
  const [header, ...rows] = raw;
  const cols = header.split(",");
  seedCache = rows.map((line, i) => {
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
  return seedCache;
}

export async function listHackathons(): Promise<Hackathon[]> {
  if (!ddb) return parseSeed();
  try {
    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    const items = (result.Items ?? []) as Hackathon[];
    return items.length > 0 ? items : parseSeed();
  } catch {
    return parseSeed();
  }
}

export async function upsertHackathon(h: Hackathon): Promise<void> {
  if (!ddb) return;
  await ddb.send(new PutCommand({ TableName: TABLE, Item: h }));
}
