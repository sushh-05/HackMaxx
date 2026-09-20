import { listHackathons } from "../lib/dynamo.js";
import { jsonResponse } from "../lib/http.js";

export async function handler(event: { queryStringParameters?: Record<string, string> }) {
  const q = event.queryStringParameters ?? {};
  let items = await listHackathons();
  if (q.q) {
    const needle = q.q.toLowerCase();
    items = items.filter((h) =>
      `${h.title} ${h.description} ${h.tech_tags.join(" ")}`.toLowerCase().includes(needle)
    );
  }
  if (q.mode) items = items.filter((h) => h.mode === q.mode);
  if (q.tag) items = items.filter((h) => h.tech_tags.map((t) => t.toLowerCase()).includes(q.tag.toLowerCase()));
  return jsonResponse(200, items, {
    "x-hackmaxx-source": "DynamoDB hackathon index",
    "x-hackmaxx-fetched-at": new Date().toISOString(),
  });
}
