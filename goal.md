# HackMaxx — goal.md (AWS First Commit Kickstart)

## 1. Locked product (one-liner)
**HackMaxx** — paste your project idea/repo → AI agent finds the best upcoming hackathons to reuse it in, ranks them by Worth Score, and gives you a maxxing strategy.

* User: CS student / early dev doing hackathons + CP.
* Job: "Where can I submit *this same project* next, and which ones are actually worth it?"

## 2. Win conditions (First Commit rules)
* Open theme, real problem you face. Demo <3 min YouTube (public/unlisted). Meaningful commits in window, no pre-built.
* Judged on: **Idea & Impact / Built on AWS / Learning / Execution**.
* Demo MUST visibly show AWS: Bedrock agent call + Lambda + DynamoDB write/query in console/logs. Mention alone = fail.
* Track: **Ship It (deployed on AWS)**. Free Tier + $200 credits. Disclose AI tools in writeup.

## 3. Final stack (locked — no more debating)
* Monorepo: **Bun workspaces + TypeScript everywhere** (no npm, no Python backend).
* Frontend: Next.js (TS) on **Amplify Hosting** (fallback: S3+CloudFront). **OpenUI** renderer for results only.
* Backend: **API Gateway + Lambda (TS, Node 20 runtime, developed/tested with Bun)** — 3 routes only.
* AI provider: **AWS only — Bedrock** (Titan Embeddings + Claude for reasoning/why-match). No OpenAI/other LLM in prod path.
* Data: **DynamoDB `Hackathons`** + vector index (brute-force cosine fallback in Lambda for <500 items). **CloudWatch Logs**.
* Live data: **TinyFish Search (`api.search.tinyfish.ai`) + Fetch (`api.fetch.tinyfish.ai`)**.
* Auth: **Clerk — gated, OFF for MVP judging flow.** Stateless by default; Clerk only enables save/bookmark + personal picks (Phase 4+). Never block demo on auth.
* Explicitly OUT for MVP: bookmarks/saves, SNS/SES reminders, calendar, teammate finder.

## 4. MVP — must ship (demo-able end-to-end)
1. **Explore page:** list of hackathons from DynamoDB + text filter.
2. **Maxx My Project page:** form (title, 2-4 line desc, tech stack, domain tags, optional repo URL) → top 5-8 cards.
3. **HackathonCard:** title, platform, deadline countdown, prize, Worth Score 0-100 + bar, tags, "why it matches" 1-2 lines, reuse badge (High/Med/Low).
4. **MaxxingStrategyPanel:** "Submit X to these 3 in next 10 days" + ROI/effort/reuse note.
5. **Refresh button:** `POST /hackathons/refresh` triggers TinyFish search (3-5 preset queries: `site:devpost.com`, `site:unstop.com`, `site:devfolio.co` + `hackathon 2026`) → Fetch top URLs → upsert DynamoDB.

Nice-to-have only if core works: saves, reminders, past-winners section.

## 5. Core logic
**DynamoDB item:**
`id, title, url, platform, deadline(ISO), prize_inr, tech_tags[], mode(online/offline), description, embedding[], reputation_score, difficulty_score`

**Worth (0-100):** `0.30*skill + 0.20*learning + 0.15*prize + 0.20*rep + 0.15*difficulty_fit`
* skill = cosine(project_emb, hack_emb). prize = min(prize/max_prize,1). rep = platform trust (Devpost/MLH high). difficulty_fit = 1-|proj_complexity-hack_difficulty|. learning = tech/tag overlap.

**APIs:**
* `GET /hackathons?q=&mode=&tag=` → list
* `POST /recommend {title, description, tech_stack[], tags[]}` → `{recommendations[{hackathon, worth, breakdown, why, reuse}], strategy}`
* `POST /hackathons/refresh` → `{upserted: n}`

## 6. Architecture (data flow)
```
Next.js + OpenUI renderer
  → API GW → Lambda recommend → Bedrock embeddings + DynamoDB vector query → Worth Score → Bedrock Agent (why+strategy+OpenUI Lang) → stream UI
  → API GW → Lambda refresh → TinyFish Search/Fetch → Bedrock embed → DynamoDB upsert
```

## 7. Sharp build order (de-risked, wisely sequenced)
Do in this order. Each phase is demo-able alone.

**Phase 0 — Kickstart (0-4h, local-first, Bun):**
* [ ] Repo (Bun workspaces): `web/` (Next.js+TS), `backend/` (SAM TS: 3 Lambdas + DynamoDB + API GW), `shared/` (types + Worth Score), `data/seed.csv` (30-50 hand hackathons), `docs/`, `scripts/`
* [ ] Seed CSV with required fields + fake embeddings. `POST /recommend` mocked: keyword overlap + Worth formula, no Bedrock yet. `bun install && bun run dev` works.
* [ ] Bare UI: Explore list + form → static cards. First commit.

**Phase 1 — Vertical slice on AWS (Day 1):**
* [ ] `sam deploy`: DynamoDB table, 3 Lambdas, API GW. Amplify hosting for `web/`.
* [ ] Real `GET /hackathons` from DynamoDB. Record 10s AWS console clip early (de-risks demo).

**Phase 2 — Intelligence (Day 2):**
* [ ] Bedrock embeddings in Lambda (with local TF-IDF fallback if no Bedrock access).
* [ ] Vector query + Worth Score. If DynamoDB vector index fights you, fallback: brute-force cosine in Lambda for <500 items (fine for MVP, note in writeup).
* [ ] TinyFish Search/Fetch wrapper → `/refresh` upserts.

**Phase 3 — Agent + Generative UI (Day 3):**
* [ ] Bedrock Agent + 3 action groups: `search_hackathons`, `fetch_details`, `query_similar`. Prompt: output why-match + strategy.
* [ ] OpenUI: define `HackathonCard, WorthScoreGauge, MaxxingStrategyPanel, FiltersBar`. Start as plain React, then switch to OpenUI Lang streaming. Plain React is acceptable fallback — don't block submission on OpenUI.

**Phase 4 — Video + Submit (Day 4):**
* [ ] Script (165s): 15s hook ("5hrs/week hunting hackathons") → 30s AWS console (DynamoDB, Lambda logs, Bedrock) → 90s live flow (input CP-tutor agent → cards + strategy) → 30s impact+learning.
* [ ] Writeup: problem, solution, arch diagram, AWS services used, TinyFish/OpenUI as external tools, what you learned, future scope.

## 8. Biggest risks → mitigations
* Bedrock no access/region block → request model access Day 1 (Titan + Claude in same region); keep keyword+TF-IDF fallback so demo never dies.
* DynamoDB vector index complexity → cap at 200 items, in-Lambda cosine is fine.
* OpenUI learning curve → progressive enhancement; static cards first.
* TinyFish key/rate limits → cache in DynamoDB, seed CSV always works offline.
* Auth scope creep (Clerk) → hard gate: `CLERK_ENABLED=false` default; MVP judging flow never requires login.
* Scope creep (reminders/calendar) → banned until Phase 4 done.

## 9. Definition of Done
* [ ] Live URL + `sam deploy` reproducible.
* [ ] Enter project → 5+ ranked hackathons with scores + reasons + strategy in <10s.
* [ ] Refresh pulls ≥1 fresh hackathon via TinyFish.
* [ ] Video shows real AWS usage, <3min.
* [ ] Writeup maps to 4 judging pillars.

Start now: Phase 0. First task = `data/seed.csv` (30 rows) + mocked `/recommend` + Explore UI.
