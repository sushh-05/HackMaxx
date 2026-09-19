# Goal — HackMaxx (AWS First Commit)

## Product

**HackMaxx** — paste your project idea or repo → AI agent finds the best upcoming hackathons to reuse it in, ranks them by Worth Score, and gives a maxxing strategy.

- **User:** CS student / early dev doing hackathons.
- **Job:** *"Where can I submit this same project next, and which ones are actually worth it?"*

---

## Win Conditions (First Commit Rules)

- Open theme, real problem you face.
- Demo < 3 min (public/unlisted YouTube).
- Meaningful commits in window — no pre-built code.
- Judged on: **Idea & Impact · Built on AWS · Learning · Execution**.
- **AWS must be visible** in demo: Bedrock agent call + Lambda + DynamoDB write/query in console/logs. Mention alone = fail.
- Track: **Ship It** (deployed on AWS). Free Tier + $200 credits. Disclose AI tools in writeup.

---

## Locked Stack

| Concern | Choice |
|---|---|
| Monorepo | Bun workspaces + TypeScript everywhere (no npm, no Python) |
| Frontend | Next.js (TS) on Amplify Hosting · OpenUI renderer for results |
| Backend | API Gateway + Lambda (TS, Node 20, developed with Bun) — 3 routes only |
| AI | **AWS Bedrock only** — Titan Embeddings + Claude for reasoning |
| Data | DynamoDB `Hackathons` + vector index (brute-force cosine fallback, <500 items) |
| Live data | TinyFish Search + Fetch (`api.search.tinyfish.ai`, `api.fetch.tinyfish.ai`) |
| Auth | **Clerk** — gated OFF for MVP judging flow (`CLERK_ENABLED=false`) |

**Explicitly OUT for MVP:** bookmarks/saves, SNS/SES reminders, calendar, teammate finder.

---

## MVP — Must Ship (Demo-End-to-End)

1. **Explore page** — hackathon list from DynamoDB + text filter.
2. **Maxx My Project page** — form (title, desc, tech stack, domain tags, optional repo URL) → top 5-8 cards.
3. **HackathonCard** — title, platform, deadline countdown, prize, Worth Score (0-100 bar), tags, *why it matches* (1-2 lines), reuse badge (High/Med/Low).
4. **MaxxingStrategyPanel** — *"Submit X to these 3 in next 10 days"* + ROI / effort / reuse note.
5. **Refresh button** — `POST /hackathons/refresh` triggers TinyFish search → upserts DynamoDB.

*Nice-to-have only if core works:* saves, reminders, past-winners section.

---

## Core Logic

### DynamoDB Item

```
id, title, url, platform, deadline(ISO), prize_inr, tech_tags[], mode(online/offline),
description, embedding[], reputation_score, difficulty_score
```

### Worth Score (0-100)

```
0.30 * skill     + 0.20 * learning + 0.15 * prize
+ 0.20 * rep     + 0.15 * difficulty_fit
```

| Component | Calculation |
|---|---|
| `skill` | Cosine similarity(project_emb, hack_emb) |
| `prize` | `min(prize / max_prize, 1)` |
| `rep` | Platform trust (Devpost / MLH = high) |
| `difficulty_fit` | `1 - \|project_complexity - hack_difficulty\|` |
| `learning` | Tech / tag overlap |

---

## APIs

| Endpoint | Body | Returns |
|---|---|---|
| `GET /hackathons?q=&mode=&tag=` | — | `Hackathon[]` |
| `POST /recommend` | `{title, description, tech_stack[], tags[]}` | `{recommendations[], strategy}` |
| `POST /hackathons/refresh` | — | `{upserted: n}` |

---

## Architecture (Data Flow)

```
Next.js + OpenUI renderer
  → API GW → Lambda recommend → Bedrock embeddings + DynamoDB vector query → Worth Score
    → Bedrock Agent (why + strategy + OpenUI lang) → stream UI
  → API GW → Lambda refresh → TinyFish Search/Fetch → Bedrock embed → DynamoDB upsert
```

---

## Build Order (De-risked)

Each phase is demo-able on its own. **Do in this order.**

### Phase 0 — Kickstart (0-4h, local-first, Bun)
- [ ] Repo (Bun workspaces): `web/`, `backend/`, `shared/`, `data/seed.csv`, `docs/`, `scripts/`
- [ ] Seed CSV with required fields + fake embeddings. Mock `POST /recommend` (keyword overlap + Worth formula, no Bedrock yet).
- [ ] Bare UI: Explore list + form → static cards. **First commit.**

### Phase 1 — Vertical Slice on AWS (Day 1)
- [ ] `sam deploy`: DynamoDB table, 3 Lambdas, API GW. Amplify hosting for `web/`.
- [ ] Real `GET /hackathons` from DynamoDB. Record 10s AWS console clip early (de-risks demo).

### Phase 2 — Intelligence (Day 2)
- [ ] Bedrock embeddings in Lambda (with local TF-IDF fallback if no Bedrock access).
- [ ] Vector query + Worth Score. Fallback: brute-force cosine in Lambda for <500 items.
- [ ] TinyFish Search/Fetch wrapper → `/refresh` upserts.

### Phase 3 — Agent + Generative UI (Day 3)
- [ ] Bedrock Agent + 3 action groups: `search_hackathons`, `fetch_details`, `query_similar`.
- [ ] OpenUI: define `HackathonCard`, `WorthScoreGauge`, `MaxxingStrategyPanel`, `FiltersBar`. Fallback = plain React (acceptable).

### Phase 4 — Video + Submit (Day 4)
- [ ] 165s script: 15s hook → 30s AWS console → 90s live flow → 30s impact + learning.
- [ ] Writeup covering all judging pillars.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Bedrock no access / region block | Request model access Day 1 (Titan + Claude same region); keep keyword + TF-IDF fallback |
| DynamoDB vector index complexity | Cap at 200 items; in-Lambda cosine is fine |
| OpenUI learning curve | Progressive enhancement; static cards first |
| TinyFish key / rate limits | Cache in DynamoDB; seed CSV always works offline |
| Auth scope creep (Clerk) | Hard gate: `CLERK_ENABLED=false` default |
| Scope creep | No reminders/calendar until Phase 4 done |

---

## Definition of Done

- [ ] Live URL + `sam deploy` reproducible.
- [ ] Enter project → 5+ ranked hackathons with scores, reasons, and strategy in <10s.
- [ ] Refresh pulls ≥1 fresh hackathon via TinyFish.
- [ ] Video shows real AWS usage, <3 min.
- [ ] Writeup maps to all 4 judging pillars.

**Start now: Phase 0. First task = `data/seed.csv` (30 rows) + mocked `/recommend` + Explore UI.**
