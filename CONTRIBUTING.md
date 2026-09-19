# Contributing to HackMaxx

Hackathon repo — speed matters, but judges check **meaningful commits**. Keep history clean.

---

## Tooling (Bun only, no npm)

```bash
bun install          # install all workspaces
bun seed             # sanity check
bun run dev:backend  # :3011
bun run dev          # :3000 (web)
bun run typecheck    # all workspaces
```

- Node 20+ for Lambda parity; Bun 1.4+ locally.
- Never commit `.env` — copy `.env.example`.

---

## Workflow

1. Pick a checkbox in `roadmap.md` (phase order matters: 0 → 1 → 2 → 3 → 4 → 5).
2. Small, scoped commits: `feat(web): maxx form`, `feat(backend): worth scoring`, `chore(data): +20 seeds`.
3. Run `bun run typecheck` before push. No `console.log` dumps in prod handlers (CloudWatch costs).
4. Flags stay default-OFF until their phase lands: `CLERK_ENABLED=false`, `OPENUI_ENABLED=false`.

---

## Conventions

| Rule | Why |
|---|---|
| Types + scoring live in `shared/` only | Single source of truth — never duplicate Worth logic |
| Handlers return `{statusCode, body}` | SAM-compatible; works under `src/local.ts` for Bun |
| Frontend talks to backend only via `web/lib/api.ts` + `NEXT_PUBLIC_API_BASE_URL` | Clean separation |
| Fallbacks first | Every Bedrock / TinyFish call degrades to keyword / seed path — demo must never die |

---

## Commit Rules (Judging-Relevant)

Meaningful, present-tense, scoped commits:

| Prefix | Use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Maintenance, config, tooling |
| `docs` | Documentation changes |

**No "wip" dumps, no pre-built code drops** — build in the open during the window.
