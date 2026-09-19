# API Reference

Base URL: `NEXT_PUBLIC_API_BASE_URL` (local: `http://localhost:3011`, prod: SAM `ApiUrl`).

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
  "strategy": "string",
  "plan": {
    "steps": [
      {
        "hackathon_id": "string",
        "title": "string",
        "url": "string",
        "deadline": "ISO string",
        "days_left": 0,
        "prize_inr": 0,
        "worth": 0,
        "reuse": "High | Med | Low",
        "effort": "Low | Medium | High",
        "expected_value_inr": 0
      }
    ],
    "total_expected_value_inr": 0,
    "headline": "string"
  }
}
```

**Scoring:** `0.30*skill + 0.20*learning + 0.15*prize + 0.20*rep + 0.15*difficulty_fit` (via `shared/worthScore`). `skill` = Bedrock cosine or keyword fallback.

**Maxxing plan:** ranks open, well-matching hackathons by expected value per unit effort (`prize × P(win)`, where P(win) derives from worth + difficulty fit), drops Low-reuse events (rework eats the EV), and orders the surviving steps by deadline. `total_expected_value_inr` and the cumulative "place in at least one" chance appear in `headline`.

---

## POST /hackathons/refresh

Triggers TinyFish preset queries → Fetch → upsert into DynamoDB.

Without `TINYFISH_API_KEY`, returns `{ "upserted": 0 }` and `seed.csv` stays as the source of truth.
