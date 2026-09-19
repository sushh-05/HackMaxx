# HackMaxx — Maxx Your Hackathon ROI

> **The problem:** Hackathons are everywhere — Devpost, Unstop, Devfolio, MLH — and most projects die in a drawer after submission.
>
> **The fix:** Paste your project idea → HackMaxx finds the best upcoming hackathons to reuse it in, ranks them by **Worth Score**, and gives you a maxxing strategy.

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.4+-brightgreen?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/TypeScript-5.6+-3178c6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/AWS-Bedrock%20%7C%20DynamoDB%20%7C%20Lambda-orange?logo=amazon-aws" alt="AWS">
  <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs" alt="Next.js">
</p>

**Built for AWS First Commit** (Bharat Builds Tour, WeMakeDevs × AWS) — *Ship It* track.

---

## 🎯 What It Does

1. **Paste** your project idea, repo URL, or tech stack.
2. **Discover** the best upcoming hackathons where it fits.
3. **Rank** them by Worth Score — skill match, learning, prize, reputation, difficulty fit.
4. **Strategy** — get a clear plan: *"Submit X to these 3 in the next 10 days."*

### How the maxxing math works

One project can be re-submitted to many hackathons — each submission is an independent shot at placing. HackMaxx turns that into portfolio math:

- **EV per submission** = `prize × P(win)`, where P(win) comes from Worth Score + difficulty fit.
- **Rank by EV per unit effort** — High reuse = Low effort (minor pitch/UI tweaks), Low reuse gets dropped (rework eats the value).
- **Order by deadline** and report the run's **total expected value** + cumulative chance of placing in *at least one*.

That's the pitch: stop hunting one hackathon at a time — max the whole portfolio.

---

## 🚀 Quickstart

```bash
cp .env.example .env
bun install
bun seed                  # sanity: loads data/seed.csv + scores sample
bun run dev:backend       # http://localhost:3011
bun run dev               # http://localhost:3000 (NEXT_PUBLIC_API_BASE_URL=http://localhost:3011)
```

Pages: `/` Explore · `/maxx` Maxx My Project.

---

## 🏗️ Stack

| Layer | Technology |
|---|---|
| Runtime | **Bun workspaces + TypeScript everywhere** (no npm) |
| Web | Next.js (TS) on Amplify Hosting · OpenUI generative cards |
| Backend | API Gateway + Lambda (TS, Node 20) via SAM |
| AI | **AWS Bedrock only** — Titan Embeddings + Claude for why-match |
| Data | DynamoDB `Hackathons` + in-Lambda cosine fallback (MVP) |
| Discovery | TinyFish Search / Fetch |
| Auth | **Clerk, gated OFF** (`CLERK_ENABLED=false`) |

---

## 📂 Repo Layout

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

## 🔌 API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hackathons?q=&mode=&tag=` | List hackathons |
| `POST` | `/recommend` | Get ranked recommendations + strategy |
| `POST` | `/hackathons/refresh` | Refresh from TinyFish (stub until Phase 2) |

---

## 📈 Worth Score Formula

```
0.30 × skill     + 0.20 × learning
+ 0.20 × rep     + 0.15 × prize
+ 0.15 × difficulty_fit
```

| Component | How |
|---|---|
| `skill` | Cosine similarity(project_emb, hack_emb) |
| `prize` | `min(prize / max_prize, 1)` |
| `rep` | Platform trust (Devpost / MLH = high) |
| `difficulty_fit` | `1 - \|project_complexity - hack_difficulty\|` |
| `learning` | Tech / tag overlap |

---

## 🚢 Deploy

```bash
sam build && sam deploy --guided   # from backend/
# Amplify: connect web/ with NEXT_PUBLIC_API_BASE_URL=<ApiUrl>
```

---

## 📖 Docs

- `goal.md` — product vision + Definition of Done
- `roadmap.md` — phased build plan with checkboxes
- `docs/architecture.md` — data flow & key decisions
- `docs/api.md` — full API reference
- `docs/demo-script.md` — 165s demo walkthrough
- `docs/auth.md` — Clerk gating (default off)
- `docs/submission.md` — First Commit checklist
- `CONTRIBUTING.md` — Bun workflow & commit conventions

---

## 🏆 Judging Pillars

| Pillar | How |
|---|---|
| **Real Problem** | Hackathon discovery pain point |
| **Built on AWS** | Bedrock + DynamoDB + Lambda visible in demo |
| **Learning** | Bedrock agents, vector search, OpenUI |
| **Execution** | <3 min video + live URL |
