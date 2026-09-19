# Architecture

## Data Flow

```
Next.js (web/, Amplify) + OpenUI renderer (Phase 3, flagged)
  │  NEXT_PUBLIC_API_BASE_URL
  ▼
API Gateway → Lambda TS (backend/, SAM)
  ├─ GET  /hackathons       → DynamoDB Scan (+ seed.csv fallback locally)
  ├─ POST /recommend        → Bedrock Titan embed → vector/cosine query → Worth Score (shared/) → Claude why + strategy
  └─ POST /hackathons/refresh → TinyFish Search/Fetch → Bedrock embed → DynamoDB upsert

Data:  DynamoDB Hackathons { id, title, url, platform, deadline, prize_inr, tech_tags[], mode, description, embedding[], reputation_score, difficulty_score }
Obs:   CloudWatch Logs
Auth:  Clerk (gated) → saves only, never on judging path
```

---

## Key Decisions

| Decision | Rationale |
|---|---|
| **Bun workspaces + TS everywhere** | One toolchain, shared scoring logic, fast local loop (`src/local.ts` mirrors API GW) |
| **AWS Bedrock = only AI provider** | Titan for embeddings, Claude for reasoning. Keyword/TF-IDF fallback keeps demo alive if model access is pending |
| **DynamoDB + in-Lambda cosine fallback** | Native vector index is nice, but brute force handles <500 rows and removes a Day-2 blocker |
| **TinyFish for freshness** | `seed.csv` is truth until `/refresh` lands; DynamoDB caches everything |
| **Clerk gated** | `CLERK_ENABLED=false` default. MVP is stateless; auth only unlocks bookmarks later |
| **OpenUI progressive** | Plain React cards first (already scaffolded), OpenUI Lang streaming last — never blocks submission |
