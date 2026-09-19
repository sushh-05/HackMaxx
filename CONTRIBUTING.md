# Contributing to HackMaxx

Hackathon repo — speed matters, but judges check **meaningful commits**. Keep history clean.

## Tooling (Bun only, no npm)
```bash
bun install          # install all workspaces
bun seed             # sanity check
bun run dev:backend  # :3001
bun run dev          # :3000 (web)
bun run typecheck    # all workspaces
```
- Node 20+ for Lambda parity; Bun 1.4+ locally.
- Never commit `.env` — copy `.env.example`.

## Workflow
1. Pick a checkbox in `roadmap.md` (Phase order matters: 0→1→2→3→4→5).
2. Small PRs/commits: `feat(web): maxx form`, `feat(backend): worth scoring`, `chore(data): +20 seeds`.
3. `bun run typecheck` before push. No `console.log` dumps in prod handlers (CloudWatch costs).
4. Flags stay default-OFF: `CLERK_ENABLED=false`, `OPENUI_ENABLED=false` until their phase lands.

## Conventions
- Types + scoring live in `shared/` only — never duplicate Worth logic in web/backend.
- Backend handlers return `{statusCode, body}` (SAM) and work under `src/local.ts` (Bun).
- Frontend talks to backend only via `web/lib/api.ts` + `NEXT_PUBLIC_API_BASE_URL`.
- Fallbacks first: every Bedrock/TinyFish call must degrade to keyword/seed path (demo must never die).

## Commit rules (judging-relevant)
Meaningful, present-tense, scoped: `feat`, `fix`, `chore`, `docs`. No "wip" dumps, no pre-built code drops — build in the open during the window.
