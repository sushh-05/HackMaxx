# HackMaxx Roadmap — AWS First Commit

De-risked order: each phase is demo-able alone. Don't skip ahead.

## Phase 0 — Kickstart, local-first (0–4h) ✅ scaffolded
- [x] Bun workspaces (`web/backend/shared`), TS everywhere
- [x] `shared/`: types + Worth Score + cosine/keyword fallback
- [x] `backend/`: 3 handlers + `bun run dev:backend` local server (seed.csv, no AWS needed)
- [x] `web/`: Explore + Maxx pages, plain React cards (OpenUI later)
- [x] `data/seed.csv` (8 rows → grow to 30–50)
- [ ] `bun install && bun seed && bun run dev:backend && bun run dev` green
- [ ] Grow seed to 30+ real hackathons (Devpost/Unstop/Devfolio/MLH)
- [ ] First meaningful commit

## Phase 1 — Vertical slice on AWS (Day 1)
- [ ] `sam deploy`: DynamoDB table + 3 Lambdas + API GW (see `backend/template.yaml`)
- [ ] Replace `lib/dynamo.ts` stub with DynamoDB Scan/Query (SDK v3)
- [ ] Amplify Hosting for `web/` with `NEXT_PUBLIC_API_BASE_URL=<ApiUrl>`
- [ ] Record 10s AWS console clip early (DynamoDB + Lambda logs) — demo insurance
- DoD: live URL lists hackathons from DynamoDB

## Phase 2 — Intelligence (Day 2)
- [ ] Bedrock Titan embeddings in `lib/bedrock.ts` (request model access Day 1; same region for Titan+Claude)
- [ ] Store embeddings on upsert; vector query (native index OR in-Lambda brute-force cosine for <500 items)
- [ ] Worth Score already in `shared/` — wire real `skillSim` from embeddings
- [ ] TinyFish Search/Fetch in `lib/tinyfish.ts` → `/refresh` upserts to DynamoDB
- DoD: `POST /recommend` returns ranked 5–8 with breakdowns in <10s

## Phase 3 — Agent + Generative UI (Day 3)
- [ ] Bedrock Agent + action groups: `search_hackathons`, `fetch_details`, `query_similar`
- [ ] Claude generates 1–2 line `why` + `strategy` (fallback `buildWhy()` already wired)
- [ ] OpenUI: stream `HackathonCard/MaxxingStrategyPanel/FiltersBar` via OpenUI Lang; fallback = current plain React (acceptable)
- [ ] Filters (deadline/prize/mode/tags) on Explore + Maxx
- DoD: agent-composed UI streams; demo shows TinyFish→Bedrock→DynamoDB→UI live

## Phase 4 — Auth (gated, ONLY if time) + Polish
- [ ] Clerk behind `CLERK_ENABLED` flag (see `docs/auth.md`): saves/bookmarks only; judging flow stays stateless
- [ ] Empty states, loading skeletons, mobile pass, deadline countdowns correct (IST)
- [ ] `OPENUI_ENABLED` flag respected; `bun run build` green on all workspaces

## Phase 5 — Video + Submit (Day 4)
- [ ] 165s script (see `docs/demo-script.md`): 15s hook → 30s AWS console → 90s live flow → 30s impact+learning
- [ ] Writeup per `docs/submission.md`: problem, arch diagram, AWS services, TinyFish/OpenUI as external tools, learning, AI-tool disclosure
- [ ] Submit form before deadline; keep commits meaningful throughout

## Out of scope (banned until Phase 5 done)
Cognito (we use Clerk), SNS/SES reminders, calendar view, teammate finder, multi-user picks.
