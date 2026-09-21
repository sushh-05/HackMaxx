import type { Hackathon } from "@hackmaxx/shared";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const TABLE = process.env.HACKATHONS_TABLE ?? "";
const ddb = TABLE
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-south-1" }))
  : null;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadSeed(): Hackathon[] {
  const seedPath = resolve(__dirname, "../../../data/seed.csv");
  if (!existsSync(seedPath)) return [];
  const lines = readFileSync(seedPath, "utf-8").trim().split("\n");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: Hackathon[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h.trim()] = values[idx]?.trim() ?? ""));
    try {
      const embRaw = obj.embedding || "";
      let embArray: number[] = [];
      if (embRaw && embRaw.length > 0) {
        // CSV quotes arrays like [0.1,0.2,...]; strip quotes and parse
        const clean = embRaw.replace(/^["\[]+|["\]]+$/g, "");
        if (clean.length > 0) {
          embArray = clean.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
        } else {
          try {
            embArray = JSON.parse(embRaw);
          } catch {
            embArray = [];
          }
        }
      }
      rows.push({
        id: obj.id || `seed-${i}`,
        title: obj.title || "",
        url: obj.url || "",
        platform: obj.platform || "",
        deadline: obj.deadline || new Date().toISOString(),
        prize_inr: Number(obj.prize_inr) || 0,
        tech_tags: obj.tech_tags ? obj.tech_tags.split(",") : [],
        mode: (obj.mode as "online" | "offline" | "hybrid") || "online",
        description: obj.description || "",
        embedding: embArray,
        reputation_score: Number(obj.reputation_score) || 0.5,
        difficulty_score: Number(obj.difficulty_score) || 0.5,
      } as Hackathon);
    } catch {
      // skip malformed rows
    }
  }
  return rows;
}

export async function listHackathons(): Promise<Hackathon[]> {
  if (ddb) {
    try {
      const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
      const items = (result.Items ?? []) as Hackathon[];
      if (items.length > 0) return items;
    } catch {
      // fall through to seed
    }
  }
  return loadSeed();
}

export async function upsertHackathon(h: Hackathon): Promise<void> {
  if (!ddb) return;
  try {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: h }));
  } catch {
    // ignore
  }
}
