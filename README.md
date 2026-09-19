# HackMaxx — Maxx Your Hackathon ROI

> Paste your project idea → AI agent finds the best upcoming hackathons to reuse it in, ranks by **Worth Score**, and gives a maxxing strategy.

Built for **AWS First Commit** (Bharat Builds Tour, WeMakeDevs × AWS) — *Ship It* track.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | **Bun workspaces + TypeScript everywhere** (no npm) |
| Web | Next.js (TS) on Amplify Hosting · OpenUI for generative cards |
| Backend | API Gateway + Lambda (TS, Node 20) via SAM |
| AI | **AWS Bedrock only** — Titan Embeddings + Claude for why-match |
| Data | DynamoDB `Hackathons` + in-Lambda cosine fallback (MVP) |
| Discovery | TinyFish Search / Fetch |
| Auth | **Clerk, gated OFF by default** (`CLERK_ENABLED=false`) |

---

## Quickstart

```bash
cp .env.example .env
bun install
bun seed                  # sanity: loads data/seed.csv + scores sample
bun run dev:backend       # http://localhost:3001
bun run dev               # http://localhost:3000 (NEXT_PUBLIC_API_BASE_URL=http://localhost:3001)
```

Pages: `/` Explore · `/maxx` Maxx My Project.

---

## Repo Layout

```
web/          Next.js app (app/, components/, lib/api.ts)
backend/      SAM (template.yaml) + TS Lambdas (handlers/, lib/) + local Bun server
shared/       Types + Worth Score + cosine/keyword similarity (single source of truth)
data/seed.csv Offline hackathon seed (source of truth until TinyFish refresh)
scripts/seed.ts Sanity check script
docs/         Architecture, API, demo script, submission checklist
goal.md       Locked product + Definition of Done
roadmap.md    Phased build plan with checkboxes
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hackathons?q=&mode=&tag=` | List hackathons |
| `POST` | `/recommend` | Get ranked recommendations + strategy |
| `POST` | `/hackathons/refresh` | Refresh from TinyFish (stub until Phase 2) |

---

## Deploy

```bash
sam build && sam deploy --guided   # from backend/
# Amplify: connect web/ with NEXT_PUBLIC_API_BASE_URL=<ApiUrl>
```

---

## Docs

- `goal.md` — product vision + Definition of Done
- `roadmap.md` — phased build plan with checkboxes
- `docs/architecture.md` — data flow & key decisions
- `docs/api.md` — full API reference
- `docs/demo-script.md` — 165s demo walkthrough
- `docs/auth.md` — Clerk gating (default off)
- `docs/submission.md` — First Commit checklist
- `CONTRIBUTING.md` — Bun workflow & commit conventions

---

## Judging Pillars

| Pillar | How |
|---|---|
| **Real Problem** | Hackathon discovery pain point |
| **Built on AWS** | Bedrock + DynamoDB + Lambda visible in demo |
| **Learning** | Bedrock agents, vector search, OpenUI |
| **Execution** | <3 min video + live URL |
