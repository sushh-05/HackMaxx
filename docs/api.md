# API Reference

Base URL: `NEXT_PUBLIC_API_BASE_URL` (local: `http://localhost:3001`, prod: SAM `ApiUrl`).

---

## GET /hackathons

Query parameters:

| Param | Description |
|---|---|
| `q` | Substring search over title, description, tags |
| `mode` | Filter by `online`, `offline`, or `hybrid` |
| `tag` | Filter by domain tag |

**Returns:** `Hackathon[]`

---

## POST /recommend

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "tech_stack": ["string"],
  "tags": ["string"],
  "repo_url": "string (optional)"
}
```

**Returns:**
```json
{
  "recommendations": [
    {
      "hackathon": "Hackathon",
      "worth": 0,
      "breakdown": { "skill": 0, "learning": 0, "prize": 0, "rep": 0, "difficulty_fit": 0 },
      "why": "string",
      "reuse": "High | Med | Low"
    }
  ],
  "strategy": "string"
}
```

**Scoring:** `0.30*skill + 0.20*learning + 0.15*prize + 0.20*rep + 0.15*difficulty_fit` (via `shared/worthScore`). `skill` = Bedrock cosine or keyword fallback.

---

## POST /hackathons/refresh

Triggers TinyFish preset queries → Fetch → upsert into DynamoDB.

Without `TINYFISH_API_KEY`, returns `{ "upserted": 0 }` and `seed.csv` stays as the source of truth.
