# Design System — HackMaxx

> Source of truth for every visual decision. Read this before touching any UI code.

## Product Context
- **What this is:** Hackathon-ROI planner — paste a project idea/repo, get ranked upcoming hackathons (Worth Score) and an EV-maximizing submission plan ("maxxing").
- **Who it's for:** Hackathon developers (WeMakeDevs / AWS community and peers) who treat one project as portfolio stock.
- **Space/industry:** Developer tools / hackathon platforms (peers: Devpost, Devfolio, Unstop).
- **Project type:** Web app (2 pages: Explore `/`, Maxx `/maxx`), judged by developers at a hackathon.
- **Memorable thing (posture):** *"For builders who farm hackathons."* Every design decision serves this one sentence.

## Aesthetic Direction
- **Direction:** Industrial / Utilitarian — a **trading terminal for hackathons**. Dark-first, data-dense, mono numerics. The posture IS the design: portfolio math, played at night.
- **Decoration level:** Intentional — existing radial gradient wash + glass cards. Nothing more.
- **Mood:** Cold-precise but alive: glow accents, gold money numbers, a live pulse. Serious quant energy, not corporate SaaS.
- **Reference sites:** linear.app (dark-first + glow accent), vercel.com (info density, mono data, functional empty states). Deliberate departure from the marketplace feel of Devpost/Unstop.

## Typography
- **Display/Hero:** **Clash Grotesk** (500–700) — h1–h3, hero, logo wordmark. Geometric and punchy; breaks the Inter convergence trap. Load via Fontshare: `https://api.fontshare.com/v2/css?f[]=clash-grotesk@500,600,700&display=swap`
- **Body/UI:** **Inter Tight** — everything else (paragraphs, buttons, labels, nav). Already wired via `next/font`.
- **Data/Tables:** **JetBrains Mono** — ALL numbers: EV, prize, worth score, days-left, odds. Always with `tabular-nums`.
- **Code:** JetBrains Mono (same).
- **Scale:** display-hero 40–64px/700 · h2 24–28px/600 · h3 18–20px/600 · body 15px/400 · labels 11–13px/500 mono uppercase w/ 0.08–0.12em tracking.

## Color
- **Approach:** Balanced — semantic color carries meaning, never decoration.
- **Semantics (the rule that makes HackMaxx memorable):**
  - **Cyan `#06b6d4` = action** — primary buttons, prompts, focus, live state.
  - **Indigo `#6366f1` = data/analysis** — secondary fills, chart/plan accents, gradient partner.
  - **Gold `#f59e0b` = money** — EVERY money number renders gold: prize, EV, and worth scores ≥ 75 (with faint glow). Amber is never used as generic accent.
  - **Rose `#f43f5e` = deadline pressure** — "days left" when close, errors.
  - **Emerald `#10b981` = win** — high-reuse badges, success, pulse-dot.
- **Neutrals:** cool slate — base `#07090e`, surface `#0d121e`, raised `#131b2e`, content `#f1f5f9`, muted `#8b95a9`.
- **Dark mode:** the default and primary experience (DaisyUI theme `hackmaxx`). `hackmaxx-light` exists as the fallback mirror: same semantics, deeper primaries (`#0891b2`, `#4f46e5`, `#d97706`).

## Spacing
- **Base unit:** 4px. Density: compact (terminal feel).
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Grid-disciplined. Hackathon cards render as **watchlist rows**: `score glyph | title+tags | prize | EV | days-left` inline in mono — a ticker, not a marketing card.
- **Score-as-glyph:** worth score renders as `W86` in mono 800; gold when ≥75, cyan otherwise; the bar is demoted to secondary. This glyph is the brand mark (logo, favicon, OG image).
- **Max content width:** 1100px. Grid: 1 col mobile / 2 col md / 3 col lg.
- **Border radius:** field 0.625rem · box 0.875rem · selector 0.75rem · full 9999px (keep existing DaisyUI values).

## Motion
- **Approach:** Intentional — only existing patterns, nothing heavier.
- **Keep:** `card-in` (300ms rise-in), `bar-grow` (600ms scaleX), `pulse-dot` (2s glow), logo hover tilt.
- **Easing:** `cubic-bezier(0.23, 1, 0.32, 1)` for entrances; ease-out enter / ease-in exit.
- **Rule:** honor `prefers-reduced-motion` (already wired globally).

## Signature Risk — TERM-FULL-BLEED
`/maxx` results render as a **streaming terminal session**: near-black panel (`#04060a`), cyan border glow, traffic-light title bar, JetBrains Mono, `❯` prompt echo of the user's idea, plan lines streamed with typewriter timing, gold EV values, muted dim log lines (`[engine] scoring…`), blinking cyan cursor at the end. This is the demo moment — the product's hero output looks like a shell because its users live in one. Fallback: static render when `prefers-reduced-motion` is set.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-20 | Industrial dark-terminal aesthetic formalized from existing DaisyUI `hackmaxx` theme | Refine, not rebuild; matches the "farm hackathons" posture |
| 2026-09-20 | Clash Grotesk for display only | Breaks Inter convergence; one extra ~20kb font load accepted |
| 2026-09-20 | Gold = money semantic (prize/EV/score≥75) | Instant "this is about odds and money" memory; amber no longer generic accent |
| 2026-09-20 | TERM-FULL-BLEED for /maxx results (user-chosen wild risk) | Highest demo wow per build-minute; posture statement |
| 2026-09-20 | Watchlist rows + W-glyph scores | Makes portfolio math visible; breaks marketplace-card convention |
