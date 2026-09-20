# AGENTS.md — HackMaxx

Rules for AI agents (and humans) working in this repo.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Quick reference (full spec in DESIGN.md):
- Display: Clash Grotesk (headings/hero/logo only). Body/UI: Inter Tight. Numbers: JetBrains Mono + tabular-nums — ALWAYS.
- Color semantics: cyan `#06b6d4` action · indigo `#6366f1` data · gold `#f59e0b` every money number (prize, EV, score ≥75) · rose `#f43f5e` deadline/error · emerald `#10b981` win/high-reuse. Amber is never a generic accent.
- Dark theme `hackmaxx` is primary; `hackmaxx-light` mirrors it.
- `/maxx` results = TERM-FULL-BLEED terminal session (see DESIGN.md "Signature Risk"). Honor `prefers-reduced-motion` with a static fallback.

## Engineering
- Bun-only monorepo (workspaces: `web`, `backend`, `shared`). Use `bun`, never npm.
- Local dev: backend on `:3011` (`bun run dev:backend`), web on `:3000` (`bun run --cwd web start` after `bun run build`). `PORT=3001` belongs to another project — do not use.
- Local backend must mirror API Gateway CORS (`*`) incl. `OPTIONS` preflight — see `backend/src/local.ts`.
- Verify with `bun run typecheck && bun run build` before committing. If `next build` fails on a pages-router `_document` lookup, `rm -rf web/.next` and rebuild.
- Commits: conventional-commit style, meaningful history, push to `origin/main` (repo: sushh-05/HackMaxx).
