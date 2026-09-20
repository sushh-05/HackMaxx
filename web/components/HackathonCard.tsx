"use client";
import React, { useState } from "react";
import type { Recommendation } from "@hackmaxx/shared";
import { WorthBar, WorthBreakdownView } from "./WorthScoreGauge";
import {
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconZap,
  IconTrophy,
  IconCalendar,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
} from "./Icons";

export function getPlatformBadgeStyle(platform: string): { bg: string; text: string; border: string } {
  const p = platform.toLowerCase();
  if (p.includes("devpost")) {
    return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
  }
  if (p.includes("devfolio")) {
    return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" };
  }
  if (p.includes("unstop")) {
    return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
  }
  if (p.includes("mlh")) {
    return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" };
  }
  return { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/30" };
}

export function HackathonCard({
  r,
  onTagClick,
}: {
  r: Recommendation;
  onTagClick?: (tag: string) => void;
}): React.JSX.Element {
  const { hackathon: h, worth, why, reuse, breakdown } = r;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const days = Math.max(0, Math.ceil((new Date(h.deadline).getTime() - Date.now()) / 86400000));
  const platformStyle = getPlatformBadgeStyle(h.platform);

  const reuseInfo = {
    High: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400",
      hint: "High reuse (~80%+ as-is, minor pitch tweaks)",
    },
    Medium: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
      hint: "Medium reuse (~50% rework, feature additions)",
    },
    Low: {
      badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      dot: "bg-slate-400",
      hint: "Low reuse (heavy adaptation needed)",
    },
  }[reuse];

  return (
    <article className="card-glass rounded-2xl p-5 sm:p-6 card-in transition-all duration-200 hover:-translate-y-0.5 relative group">
      <div className="flex flex-col gap-4">
        {/* Top bar: Platform + Mode + Deadline countdown + Reuse badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Platform badge */}
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] border ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
              {h.platform}
            </span>

            {/* Mode badge */}
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-base-300/80 text-base-content/70 border border-base-content/10 capitalize">
              {h.mode === "online" && <IconGlobe className="w-3 h-3 text-primary" />}
              {h.mode === "offline" && <IconMapPin className="w-3 h-3 text-amber-400" />}
              {h.mode === "hybrid" && <IconZap className="w-3 h-3 text-secondary" />}
              <span>{h.mode}</span>
            </span>

            {/* Deadline Urgency Pill */}
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                days <= 3
                  ? "bg-error/15 text-error border-error/30 animate-pulse"
                  : days <= 7
                  ? "bg-warning/15 text-warning border-warning/30"
                  : "bg-base-300/80 text-base-content/70 border-base-content/10"
              }`}
            >
              <IconCalendar className="w-3 h-3" />
              <span>{days <= 3 ? `🚨 ${days}d left · Closing soon` : `${days}d left`}</span>
            </span>
          </div>

          {/* Reuse badge */}
          <div className="flex items-center" title={reuseInfo.hint}>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${reuseInfo.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${reuseInfo.dot}`} />
              <span>{reuse} Reuse</span>
            </span>
          </div>
        </div>

        {/* Title and Prize header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
          <div className="space-y-1">
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">
              <a href={h.url} target="_blank" rel="noreferrer" className="no-underline hover:underline">
                {h.title}
              </a>
            </h3>
            <p className="text-xs sm:text-sm text-base-content/65 line-clamp-2 leading-relaxed">
              {h.description}
            </p>
          </div>

          {/* Prize pool box */}
          <div className="flex-none self-start sm:self-auto px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/25 text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent/80 flex items-center gap-1 justify-end">
              <IconTrophy className="w-3 h-3 text-accent" /> Prize Pool
            </span>
            <span className="font-mono text-base sm:text-lg font-black tabular-nums text-accent block">
              ₹{h.prize_inr.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Worth Score Progress Bar */}
        <div className="pt-1">
          <WorthBar worth={worth} />
        </div>

        {/* Why this matches quote box */}
        {why && (
          <div className="p-3 rounded-xl bg-base-200/70 border border-base-content/8 text-xs text-base-content/80 flex items-start gap-2.5">
            <IconSparkles className="w-4 h-4 text-primary flex-none mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-primary text-[11px] uppercase tracking-wider block">
                Bedrock Match Rationale
              </span>
              <p className="leading-normal">{why}</p>
            </div>
          </div>
        )}

        {/* Tech tags pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {h.tech_tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTagClick?.(t)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Score Breakdown Accordion if available */}
        {breakdown && (
          <div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 text-[11px] font-semibold text-base-content/50 hover:text-primary transition-colors"
            >
              <span>{showBreakdown ? "Hide Bedrock Formula Details" : "View Bedrock Formula Details"}</span>
              {showBreakdown ? <IconChevronUp className="w-3 h-3" /> : <IconChevronDown className="w-3 h-3" />}
            </button>
            {showBreakdown && <WorthBreakdownView breakdown={breakdown} />}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-base-content/8">
          <a
            href={`/maxx?title=${encodeURIComponent(h.title)}&tags=${encodeURIComponent(h.tech_tags.join(", "))}`}
            className="btn btn-ghost btn-sm text-xs font-bold text-primary hover:bg-primary/10"
          >
            <IconZap className="w-3.5 h-3.5" />
            <span>Maxx around this</span>
          </a>
          <a
            href={h.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold shadow-sm shadow-primary/30"
          >
            <span>Open Hackathon</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
