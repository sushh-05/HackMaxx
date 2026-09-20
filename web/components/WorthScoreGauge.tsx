import type { WorthBreakdown } from "@hackmaxx/shared";
import { cn } from "cn";
import { IconWorth, IconSparkles, IconTarget } from "./Icons";

type WorthTier = {
  label: string;
  /** score glyph colour — DESIGN.md: money at >=75, action otherwise */
  glyph: string;
  badge: string;
  bar: string;
  glow: string;
};

/**
 * Tier bands. Colours come from the theme's semantic slots, never a raw Tailwind
 * palette, so the gauge follows whichever 21st.dev theme is applied.
 * DESIGN.md > Layout: worth score >= 75 renders in the money colour, otherwise action.
 */
export function getWorthTier(worth: number): WorthTier {
  if (worth >= 75) {
    return {
      label: "S-Tier Match",
      glyph: "text-money",
      badge: "bg-money/15 text-money border-money/40",
      bar: "from-money via-money/85 to-money/50",
      glow: "color-mix(in srgb, var(--money) 34%, transparent)",
    };
  }
  if (worth >= 60) {
    return {
      label: "A-Tier Match",
      glyph: "text-action",
      badge: "bg-action/12 text-action border-action/35",
      bar: "from-action via-action/80 to-data/55",
      glow: "color-mix(in srgb, var(--primary) 30%, transparent)",
    };
  }
  if (worth >= 45) {
    return {
      label: "B-Tier Match",
      glyph: "text-data",
      badge: "bg-data/12 text-data border-data/30",
      bar: "from-data via-data/80 to-data/45",
      glow: "color-mix(in srgb, var(--data) 26%, transparent)",
    };
  }
  return {
    label: "C-Tier Match",
    glyph: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    bar: "from-muted-foreground/70 via-muted-foreground/50 to-muted-foreground/30",
    glow: "transparent",
  };
}

/**
 * The score glyph — DESIGN.md's brand mark: `W86` in mono 800 with tabular-nums.
 * Reused by the cards and the strategy timeline so the mark stays consistent.
 */
export function WorthScoreGlyph({
  worth,
  className,
}: {
  worth: number;
  className?: string;
}) {
  const tier = getWorthTier(worth);
  return (
    <span
      className={cn(
        "font-mono text-xl leading-none font-extrabold tracking-tight tabular-nums",
        tier.glyph,
        className,
      )}
      title={`Worth score ${worth}/100 — ${tier.label}`}
    >
      <span className="opacity-55">W</span>
      {worth}
    </span>
  );
}

export function WorthBar({
  worth,
  showTier = true,
}: {
  worth: number;
  showTier?: boolean;
}) {
  const tier = getWorthTier(worth);

  return (
    <div
      className="space-y-1.5"
      role="meter"
      aria-valuenow={worth}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Worth score: ${worth} out of 100`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5 font-medium text-base-content/70">
          <IconWorth className="size-3.5 shrink-0 text-action" />
          <span className="truncate">Worth Score</span>
          {showTier && (
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap",
                tier.badge,
              )}
            >
              {tier.label}
            </span>
          )}
        </div>
        <WorthScoreGlyph worth={worth} />
      </div>

      {/* demoted to a hairline — the glyph carries the score now */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-base-content/10">
        <div
          className={cn("worth-fill h-full rounded-full bg-gradient-to-r", tier.bar)}
          style={{
            width: `${Math.min(Math.max(worth, 4), 100)}%`,
            boxShadow: `0 0 8px ${tier.glow}`,
          }}
        />
      </div>
    </div>
  );
}

export function WorthBreakdownView({ breakdown }: { breakdown: WorthBreakdown }) {
  const items = [
    { label: "Skill Similarity", weight: "30%", value: Math.round(breakdown.skill * 100) },
    { label: "Learning & Tags", weight: "20%", value: Math.round(breakdown.learning * 100) },
    { label: "Platform Trust", weight: "20%", value: Math.round(breakdown.rep * 100) },
    { label: "Difficulty Fit", weight: "15%", value: Math.round(breakdown.difficulty_fit * 100) },
    { label: "Prize Scale", weight: "15%", value: Math.round(breakdown.prize * 100) },
  ];

  return (
    <div className="mt-3 space-y-2.5 rounded-xl border border-border bg-muted/60 p-3.5 text-xs">
      <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-base-content/80 uppercase">
        <span className="flex items-center gap-1.5">
          <IconSparkles className="size-3.5 text-action" />
          Worth Score Breakdown (Bedrock)
        </span>
        <span className="text-[10px] normal-case text-muted-foreground">formula weights</span>
      </div>

      <div className="grid gap-2">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-base-content/70">
                <IconTarget className="size-3 shrink-0 text-data opacity-70" />
                {it.label}
                <span className="text-muted-foreground">({it.weight})</span>
              </span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-base-content/90">
                {it.value}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-base-content/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-action to-data"
                style={{ width: `${Math.min(it.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
