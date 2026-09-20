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
- **Mood:** Warm-precise but alive: olive glow, gold money numbers, a live pulse. Serious quant energy on parchment/umber, not corporate SaaS.
- **Reference sites:** linear.app (dark-first + glow accent), vercel.com (info density, mono data, functional empty states). Deliberate departure from the marketplace feel of Devpost/Unstop.

## Typography
- **Display/Hero:** **Merriweather** (700/900) — h1–h3, hero, score glyph. Comes from the Kodama Grove remix theme; wired via `next/font/google` as `--font-display-face`. (Supersedes the earlier Clash Grotesk plan, which was never actually loaded.)
- **Body/UI:** **Inter Tight** — everything else (paragraphs, buttons, labels, nav). Wired via `next/font`. Kept as a sans deliberately: the theme proposes Merriweather for UI too, but the dense watchlist rows need a sans for legibility.
- **Data/Tables:** **JetBrains Mono** — ALL numbers: EV, prize, worth score, days-left, odds. Always with `tabular-nums`. The theme agrees here.
- **Wordmark serif:** **Instrument Serif** italic — the "Maxx" in the logo; unchanged brand mark.
- **Scale:** display-hero 40–64px/700 · h2 24–28px/600 · h3 18–20px/600 · body 15px/400 · labels 11–13px/500 mono uppercase w/ 0.08–0.12em tracking.
- **Icons:** lucide-react at **1.75 stroke** (not the 2 default), set once via `svg.lucide` in `globals.css`. Every icon goes through `components/Icons.tsx`, which exports *roles* (`IconMoney`, `IconDeadline`, `IconWorth`…) rather than glyphs — swap the assignment there and every call site follows.

## Color
- **Approach:** Supplied by the **Amber Slate** theme (21st.dev, by serafimcloud) — https://21st.dev/community/themes/amber-slate. A warm, high-contrast palette: **terracotta amber (`#df6035`) + slate navy (`#2f4b79`/`#284167`) + golden amber (`#e2b146`) + slate blue (`#7399bf`/`#85a6c7`)**, on clean light slate or deep charcoal slate (`#1a1a1a`). Tokens live in `web/app/globals.css`.
- **Dark (primary experience):** background `#1a1a1a` · card `#202020` · raised `#2a2a2a` · content `#e5e5e5` · muted `#808080` · border `#353535`
- **Light (mirror):** background `#e8ebed` · card `#ffffff` · popover `#ffffff` · content `#333333` · muted `#6b7280` · border `#cccccc`
- **Accents:** primary `#df6035` (terracotta amber) · secondary `#284167` (slate navy) · accent `#2a3656` · destructive `#ef4444`
- **Semantic slots:**
  - **`--color-action`** = primary amber `#df6035` — buttons, prompts, focus, live state.
  - **`--color-data`** = slate blue `#7399bf` / `#85a6c7` — analysis accents, charts, timeline gradient.
  - **`--color-money`** = golden amber `#e2b146` — prize, EV, and worth scores ≥ 75.
  - **`--color-deadline`** = alert red `#ef4444` — days-left pressure, closing soon.
  - **`--color-win`** = green `#4ade80` dark / `#16a34a` light — high-reuse badges, success, pulse-dot.
  - Each has a `--color-*-foreground` ink pair for filled surfaces (e.g. `bg-money text-money-foreground`).
- **Dark mode:** the default and primary experience, applied as the `.dark` class on `<html>` (shadcn/ui convention; toggled by `ThemeToggle`). The light mode is `:root`.

## Tokens

Authoritative values live in `web/app/globals.css` as CSS variables: `:root` holds the light mirror, `.dark` the primary experience. Never hardcode a hex in a component.

- **Semantic API:** `--color-action` (olive) · `--color-data` (sage) · `--color-money` (gold) · `--color-deadline` (coral) · `--color-win` (green), each with a `-foreground` ink pair. Use these names — e.g. `text-money`, `border-deadline`, `bg-win text-win-foreground`.
- **shadcn contract:** `--background` · `--foreground` · `--card` · `--popover` · `--primary` · `--secondary` · `--muted` · `--accent` · `--destructive` · `--border` · `--input` · `--ring`, plus `--chart-1..5` and `--sidebar-*`. Straight from the Kodama Grove remix theme, so shadcn/ui and 21st.dev primitives arrive already on-theme.
- **Two collisions to know:** shadcn's `--accent` is a *hover surface* (the theme's gold-tan), not the money colour — money is `--color-money`. And `--muted` is a background; the muted *text* colour is `--muted-foreground`.
- **Applied from the theme:** colours, radii, and the Merriweather display face. **Not applied:** the theme's `--font-sans: Merriweather` for body/UI — see Typography. Its dark block ships generic system font stacks, so fonts are taken from the light block only.

## Spacing
- **Base unit:** 4px. Density: compact (terminal feel).
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Grid-disciplined. Hackathons render as **watchlist rows** (`components/ui/hackathon-watchlist.tsx`): `rail | event | worth | prize | deadline` inline in mono — a ticker, not a marketing card. Implemented on `/`; the row pattern comes from the 21st.dev `ssicevs/market-watchlist` component, re-built over real hackathon data.
- **Score-as-glyph:** worth score renders as `W86` in mono 800 (`WorthScoreGlyph`); `--color-money` when ≥75, `--color-action` otherwise; the bar is demoted to a hairline. This glyph is the brand mark (logo, favicon, OG image).
- **Interactive primitives** (Radix, via shadcn): `select` for platform/sort/currency dropdowns, `accordion` for the Bedrock formula breakdown, `native`-free `dropdown-menu` available. Icons inside options are the reason to prefer these over `<select>`/`<option>`.
- **Max content width:** 1100px. Grid: 1 col mobile / 2 col md / 3 col lg.
- **Border radius:** from the theme — `--radius` 0.425rem (light) / 0.375rem (dark), exposed as `--radius-sm/md/lg/xl`. Tighter and print-like. `rounded-2xl`/`3xl` stay at Tailwind defaults for large hero panels.
- **Icons:** `size-*` (Tailwind v4), never paired `w-* h-*`. Stroke weight is global — don't set it per call site.

## Motion
- **Approach:** Intentional — only existing patterns, nothing heavier.
- **Keep:** `card-in` (300ms rise-in), `bar-grow` (600ms scaleX), `pulse-dot` (2s glow), logo hover tilt.
- **Easing:** `cubic-bezier(0.23, 1, 0.32, 1)` for entrances; ease-out enter / ease-in exit.
- **Rule:** honor `prefers-reduced-motion` (already wired globally).

## Signature Risk — TERM-FULL-BLEED
`/maxx` results render as a **streaming terminal session**: near-black panel (`#04060a`), action-coloured border glow, traffic-light title bar, JetBrains Mono, `❯` prompt echo of the user's idea, plan lines streamed with typewriter timing, money-coloured EV values, muted dim log lines (`[engine] scoring…`), blinking cursor at the end. This is the demo moment — the product's hero output looks like a shell because its users live in one. Fallback: static render when `prefers-reduced-motion` is set.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-20 | Industrial dark-terminal aesthetic formalized from existing DaisyUI `hackmaxx` theme | Refine, not rebuild; matches the "farm hackathons" posture |
| 2026-09-20 | Clash Grotesk for display only | *(superseded — never loaded; see Merriweather below)* |
| 2026-09-20 | Gold = money semantic (prize/EV/score≥75) | Instant "this is about odds and money" memory; amber no longer generic accent |
| 2026-09-20 | TERM-FULL-BLEED for /maxx results (user-chosen wild risk) | Highest demo wow per build-minute; posture statement |
| 2026-09-20 | Watchlist rows + W-glyph scores | Makes portfolio math visible; breaks marketplace-card convention |
| 2026-09-20 | daisyUI → shadcn/ui for the component layer | 21st.dev components ship as shadcn registry items; the palette is re-declared as CSS variables so the look is unchanged. The `rounded-*` scale is deliberately left at Tailwind defaults so existing radii don't shift. |
| 2026-09-20 | Palette replaced by the **Darkmatter** 21st.dev theme | User chose a full reskin over keeping semantics. Tokens were swapped by value only, so no component changed. Two consequences accepted: `data`/`win` collapse onto one teal, and `money` is no longer a distinct gold. Darkmatter's dark `--destructive` (teal) is overridden with the theme's own red so errors stay legible. *(superseded by Kodama Grove remix below)* |
| 2026-09-20 | Palette + display face from **Kodama Grove remix** (21st.dev) | Second full reskin, applied by token value so no component needed to change. Restores a genuine gold for `--color-money` (which Darkmatter lacked). Wires Merriweather as the display face, finally closing the Clash Grotesk gap. Theme's `--destructive` taken as-is here — it is already a readable coral. |
| 2026-09-20 | Icons unified behind role names, stroke set globally to 1.75 | `Icons.tsx` exports roles (`IconMoney`, `IconDeadline`), so a glyph swap is one line and every call site follows. GitHub mark rewritten to mirror lucide's prop API so it is interchangeable. |
| 2026-09-20 | Worth score now renders the `W86` glyph, money at ≥75 | Implements the Layout rule that had been specified but never built; the bar is demoted to a hairline. |
| 2026-09-20 | Dropdowns + breakdown moved to Radix `select`/`accordion`; `/` rebuilt as watchlist rows | The 21st.dev `market-watchlist` pattern finally lands the "ticker, not marketing card" posture. Radix select is what makes real icons-in-options possible. `native-select` removed as orphaned. |
| 2026-09-20 | Palette + fonts switched to **Amber Slate** (21st.dev @serafimcloud) | User requested switch to Amber Slate. Warm terracotta amber primary (`#df6035`) with crisp slate accents and golden amber (`#e2b146`) money tokens. Outfit for sans, Fira Code for mono numerics. GitHub link moved from top-right to minimal sticky bottom-left component; Explore renamed to Dashboard. |
