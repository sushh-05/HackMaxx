# AGENTS.md — HackMaxx

Rules for AI agents (and humans) working in this repo.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Quick reference (full spec in DESIGN.md):
- Display/Headings & Body/UI: **Geist** (via `--font-sans`). Wordmark: **Instrument Serif** italic. Numbers: **Geist Mono** / **Fira Code** + tabular-nums — ALWAYS. Icons: lucide via `components/Icons.tsx`, `size-*` not `w-* h-*`, stroke set globally.
- Color semantics: palette comes from the **Notebook** 21st.dev theme by @serafimcloud (`https://21st.dev/community/themes/notebook`). Graphite pencil (`#606060`/`#b0b0b0`), parchment cream (`#f3eac8`), slate lead (`#62758d`/`#94a3b8`), yellow highlighter (`#c89324`/`#f3eac8`). Use the semantic token names, not raw hues: `--color-action` · `--color-data` · `--color-money` · `--color-deadline` · `--color-win` (each with a `-foreground` ink pair).
- Dark mode is primary: `.dark` on `<html>` (dark slate paper `#2b2b2b`); `:root` is the paper white mirror (`#f9f9f9`).
- Never hardcode a Tailwind palette colour (`text-amber-400`, `bg-emerald-500`…) in components — it fights whatever theme is applied.
- `/maxx` results = TERM-FULL-BLEED terminal session (see DESIGN.md "Signature Risk"). Honor `prefers-reduced-motion` with a static fallback.

## Engineering
- Bun-only monorepo (workspaces: `web`, `backend`, `shared`). Use `bun`, never npm.
- Local dev: backend on `:3011` (`bun run dev:backend`), web on `:3000` (`bun run --cwd web start` after `bun run build`). `PORT=3001` belongs to another project — do not use.
- **`/recommend` hangs without AWS credentials** — the SDK blocks on the EC2 metadata endpoint (169.254.169.254) for ~60s+ before its `catch` fires. Run local dev with it disabled so it fails fast into the seeded fallback: `AWS_EC2_METADATA_DISABLED=true bun run dev`. `/hackathons` is unaffected (it falls back to `data/seed.csv` when `HACKATHONS_TABLE` is unset).
- Local backend must mirror API Gateway CORS (`*`) incl. `OPTIONS` preflight — see `backend/src/local.ts`.
- Verify with `bun run typecheck && bun run build` before committing. If `next build` fails on a pages-router `_document` lookup, `rm -rf web/.next` and rebuild.
- **Never `rm -rf web/.next` or run `bun run build` while a `next dev` server is live.** A dev server cannot survive `.next` being replaced by production output — it 500s every request with `Cannot find module './<chunk>.js'` on every refresh until restarted. Stop `bun run dev` first, or verify on a spare port (`PORT=3100 bun run start`) instead of touching the dev server's build dir.
- `next dev` requires `NODE_ENV` unset or `development`. A `NODE_ENV=production` in the shell makes the dev server fail its CSS pipeline (`Module parse failed: Unexpected character '@'` on `app/globals.css`) and 500 everything. Run it clean if needed: `env -u NODE_ENV bun run dev`.
- Commits: conventional-commit style, meaningful history, push to `origin/main` (repo: sushh-05/HackMaxx).
