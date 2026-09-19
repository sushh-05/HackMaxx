# API

Base: `NEXT_PUBLIC_API_BASE_URL` (local `http://localhost:3001`, prod = SAM `ApiUrl`).

## GET /hackathons
Query: `q` (substring over title/desc/tags), `mode` (online|offline|hybrid), `tag`.
→ `Hackathon[]`.

## POST /recommend
Body: `{title, description, tech_stack[], tags[], repo_url?}`.
→ `{recommendations: [{hackathon, worth 0-100, breakdown {skill,learning,prize,rep,difficulty_fit}, why, reuse}], strategy}`.
Scoring: `shared/worthScore` — `0.30*skill + 0.20*learning + 0.15*prize + 0.20*rep + 0.15*difficulty_fit`. `skill` = Bedrock cosine or keyword fallback.

## POST /hackathons/refresh
Triggers TinyFish preset queries → Fetch → upsert. Without `TINYFISH_API_KEY` returns `{upserted: 0}` (seed.csv stays truth).
