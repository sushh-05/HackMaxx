// TinyFish Search/Fetch wrapper. Phase 0: stub. Phase 2: real HTTP calls.
export interface TinyFishHit { title: string; url: string; snippet: string; }

export async function searchHackathons(_query: string): Promise<TinyFishHit[]> {
  // TODO Phase 2: POST ${TINYFISH_SEARCH_URL} with TINYFISH_API_KEY.
  return [];
}

export async function fetchPage(_url: string): Promise<string> {
  // TODO Phase 2: POST ${TINYFISH_FETCH_URL} → markdown.
  return "";
}

export const PRESET_QUERIES = [
  "site:devpost.com hackathon AI agent 2026",
  "site:unstop.com hackathon college India 2026",
  "site:devfolio.co hackathon AWS Bedrock",
  "site:mlh.io hackathon online 2026",
];
