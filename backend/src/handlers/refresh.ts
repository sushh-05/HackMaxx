import { PRESET_QUERIES, searchHackathons } from "../lib/tinyfish.js";

export async function handler() {
  // Phase 0: proves the route works. Phase 2: Search → Fetch → embed → DynamoDB upsert.
  const key = process.env.TINYFISH_API_KEY ?? "";
  if (!key) {
    return { statusCode: 200, body: JSON.stringify({ upserted: 0, note: "TINYFISH_API_KEY unset; seed.csv is source of truth" }) };
  }
  let found = 0;
  for (const q of PRESET_QUERIES) found += (await searchHackathons(q)).length;
  return { statusCode: 200, body: JSON.stringify({ upserted: 0, found, note: "TODO Phase 2: fetch+upsert" }) };
}
