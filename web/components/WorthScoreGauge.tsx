import React from "react";
import type { WorthBreakdown } from "@hackmaxx/shared";
import { IconSparkles, IconTrendingUp } from "./Icons";

export function getWorthTier(worth: number): {
  label: string;
  badgeClass: string;
  textClass: string;
  barGradient: string;
  bgGlow: string;
} {
  if (worth >= 75) {
    return {
      label: "S-Tier Match",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      textClass: "text-emerald-400",
      barGradient: "from-emerald-500 via-teal-400 to-cyan-400",
      bgGlow: "rgba(16, 185, 129, 0.25)",
    };
  }
  if (worth >= 60) {
    return {
      label: "A-Tier Match",
      badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      textClass: "text-cyan-400",
      barGradient: "from-cyan-500 via-sky-400 to-indigo-400",
      bgGlow: "rgba(6, 182, 212, 0.25)",
    };
  }
  if (worth >= 45) {
    return {
      label: "B-Tier Match",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      textClass: "text-amber-400",
      barGradient: "from-amber-500 via-yellow-400 to-orange-400",
      bgGlow: "rgba(245, 158, 11, 0.25)",
    };
  }
  return {
    label: "C-Tier Match",
    badgeClass: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    textClass: "text-slate-400",
    barGradient: "from-slate-500 to-slate-400",
    bgGlow: "rgba(100, 116, 139, 0.2)",
  };
}

export function WorthBar({
  worth,
  showTier = true,
}: {
  worth: number;
  showTier?: boolean;
}): React.JSX.Element {
  const tier = getWorthTier(worth);

  return (
    <div className="space-y-1.5" role="meter" aria-valuenow={worth} aria-valuemin={0} aria-valuemax={100} aria-label={`Worth score: ${worth} out of 100`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-base-content/70">
          <IconTrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>Worth Score</span>
          {showTier && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.badgeClass}`}>
              {tier.label}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono text-base font-extrabold tabular-nums ${tier.textClass}`}>
            {worth}
          </span>
          <span className="text-[11px] text-base-content/40 font-mono">/100</span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-base-content/10 p-[1px] relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tier.barGradient} transition-all duration-700 ease-out`}
          style={{
            width: `${Math.min(Math.max(worth, 4), 100)}%`,
            boxShadow: `0 0 10px ${tier.bgGlow}`,
          }}
        />
      </div>
    </div>
  );
}

export function WorthBreakdownView({ breakdown }: { breakdown: WorthBreakdown }): React.JSX.Element {
  const items = [
    { label: "Skill Similarity", weight: "30%", value: Math.round(breakdown.skill * 100) },
    { label: "Learning & Tags", weight: "20%", value: Math.round(breakdown.learning * 100) },
    { label: "Platform Trust", weight: "20%", value: Math.round(breakdown.rep * 100) },
    { label: "Difficulty Fit", weight: "15%", value: Math.round(breakdown.difficulty_fit * 100) },
    { label: "Prize Scale", weight: "15%", value: Math.round(breakdown.prize * 100) },
  ];

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-base-200/90 border border-base-content/10 space-y-2.5 text-xs">
      <div className="flex items-center justify-between font-semibold text-base-content/80 text-[11px] uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <IconSparkles className="w-3.5 h-3.5 text-primary" />
          Worth Score Breakdown (Bedrock)
        </span>
        <span className="text-base-content/50 lowercase">formula weights</span>
      </div>

      <div className="grid gap-2">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-base-content/70">
                {it.label} <span className="text-base-content/40">({it.weight})</span>
              </span>
              <span className="font-mono tabular-nums font-semibold text-base-content/90">
                {it.value}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-base-content/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: `${Math.min(it.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
