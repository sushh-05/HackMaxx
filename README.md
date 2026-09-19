# HackMaxx — maxx your hackathon ROI

Paste your project idea → AI agent finds the best upcoming hackathons to reuse it in, ranks by Worth Score, gives a maxxing strategy.

Built for **AWS First Commit (Bharat Builds Tour, WeMakeDevs × AWS)** — Ship It track.

## Stack (locked)
- **Bun workspaces + TypeScript everywhere** (no npm)
- Web: Next.js (TS) on Amplify Hosting · OpenUI for generative result cards
- Backend: API Gateway + Lambda (TS, Node 20) via SAM
- AI provider: **AWS Bedrock only** (Titan Embeddings + Claude for why-match)
- Data: DynamoDB `Hackathons` (+ in-Lambda cosine fallback for MVP)
- Live discovery: TinyFish Search/Fetch
- Auth: **Clerk, gated OFF by default** (`CLERK_ENABLED=false`) — judging flow never requires login

## Quickstart (Bun)
```bash
cp .env.example .env
bun install
bun seed                 # sanity: loads data/seed.csv + scores sample
bun run dev:backend      # http://localhost:3001
bun run dev              # http://localhost:3000 (NEXT_PUBLIC_API_BASE_URL=http://localhost:3001)
```
Pages: `/` Explore · `/maxx` Maxx My Project.

## Repo layout
```
web/          Next.js app (app/, components/, lib/api.ts)
backend/      SAM (template.yaml) + TS Lambdas (handlers/, lib/) + local Bun server
shared/       Types + Worth Score + cosine/keyword similarity (single source of truth)
data/seed.csv Offline hackathon seed (source of truth until TinyFish refresh)
scripts/seed.ts Sanity script
docs/         Architecture, API, demo script, submission checklist
goal.md       Locked product + DoD
roadmap.md    Phased build plan
```

## API (local mirrors prod)
- `GET /hackathons?q=&mode=&tag=` → Hackathon[]
- `POST /recommend {title, description, tech_stack[], tags[]}` → top 8 + strategy
- `POST /hackathons/refresh` → TinyFish refresh (stub until Phase 2)

## Deploy (Phase 1+)
```bash
sam build && sam deploy --guided   # from backend/
# Amplify: connect web/, env NEXT_PUBLIC_API_BASE_URL=<ApiUrl>
```

## Docs
- `goal.md` — what + why + DoD
- `roadmap.md` — phased plan with checkboxes
- `docs/architecture.md`, `docs/api.md`, `docs/demo-script.md`, `docs/submission.md`, `docs/auth.md` (Clerk gate)
- `CONTRIBUTING.md` — Bun workflow, commit rules (meaningful commits matter for judging)
- `lore.md` — raw research convo

## Judging mapping
Real problem (hackathon discovery) · AWS visible in demo (Bedrock+DynamoDB+Lambda) · Learning (Bedrock agents, vector search, OpenUI) · Execution (<3min video + live URL).
