"use client";
import React from "react";
import type { Recommendation } from "@hackmaxx/shared";
import { WorthBar, WorthBreakdownView } from "./WorthScoreGauge";
import {
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconZap,
  IconTrophy,
  IconDeadline,
  IconFlame,
  IconSparkles,
  IconWorth,
  IconReuse,
} from "./Icons";
import { useCurrency } from "../lib/currency";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

/**
 * Platform chips resolve from the theme's chart slots rather than a fixed Tailwind
 * palette, so they stay legible under whichever 21st.dev theme is applied.
 */
export function getPlatformBadgeStyle(platform: string): { bg: string; text: string; border: string } {
  const p = platform.toLowerCase();
  if (p.includes("devpost")) {
    return { bg: "bg-chart-1/12", text: "text-chart-1", border: "border-chart-1/35" };
  }
  if (p.includes("devfolio")) {
    return { bg: "bg-chart-2/12", text: "text-chart-2", border: "border-chart-2/35" };
  }
  if (p.includes("unstop")) {
    return { bg: "bg-chart-4/14", text: "text-chart-4", border: "border-chart-4/35" };
  }
  if (p.includes("mlh")) {
    return { bg: "bg-chart-3/12", text: "text-chart-3", border: "border-chart-3/35" };
  }
  return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
}

export function HackathonCard({
  r,
  onTagClick,
}: {
  r: Recommendation;
  onTagClick?: (tag: string) => void;
}): React.JSX.Element {
  const { hackathon: h, worth, why, reuse, breakdown } = r;

  const { format } = useCurrency();
  const formattedWhy = why
    ? why.replace(/₹([\d,]+)/g, (_, match) => format(Number(match.replace(/,/g, ""))))
    : why;

  const days = Math.max(0, Math.ceil((new Date(h.deadline).getTime() - Date.now()) / 86400000));
  const platformStyle = getPlatformBadgeStyle(h.platform);

  const reuseInfo = {
    High: {
      badge: "bg-win/14 text-win border-win/40",
      dot: "bg-win",
      hint: "High reuse (~80%+ as-is, minor pitch tweaks)",
    },
    Medium: {
      badge: "bg-money/14 text-money border-money/40",
      dot: "bg-money",
      hint: "Medium reuse (~50% rework, feature additions)",
    },
    Low: {
      badge: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground",
      hint: "Low reuse (heavy adaptation needed)",
    },
  }[reuse];

  const urgent = days <= 3;
  const soon = days > 3 && days <= 7;

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-6 card-in transition-all duration-200 hover:-translate-y-0.5 relative group shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top bar: Platform + Mode + Deadline countdown + Reuse badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Platform badge */}
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] border ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
              {h.platform}
            </span>

            {/* Mode badge */}
            <span className="flex items-center gap-1 rounded-full border border-border bg-muted/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
              {h.mode === "online" && <IconGlobe className="size-3 text-action" />}
              {h.mode === "offline" && <IconMapPin className="size-3 text-data" />}
              {h.mode === "hybrid" && <IconHybrid className="size-3 text-money" />}
              <span>{h.mode}</span>
            </span>

            {/* Deadline Urgency Pill */}
            <span
              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                urgent
                  ? "animate-pulse bg-deadline/15 text-deadline border-deadline/40"
                  : soon
                  ? "bg-money/14 text-money border-money/35"
                  : "border-border bg-muted/70 text-muted-foreground"
              }`}
            >
              {urgent ? <IconFlame className="size-3" /> : <IconDeadline className="size-3" />}
              <span className="font-mono tabular-nums">{days}d left</span>
              {urgent && <span className="font-sans">· closing soon</span>}
            </span>
          </div>

          {/* Reuse badge */}
          <div className="flex items-center" title={reuseInfo.hint}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${reuseInfo.badge}`}
            >
              <IconReuse className="size-3" />
              <span>{reuse} Reuse</span>
              <span className={`size-1.5 rounded-full ${reuseInfo.dot}`} />
            </span>
          </div>
        </div>

        {/* Title and Prize header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
          <div className="space-y-1">
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              <a href={h.url} target="_blank" rel="noreferrer" className="no-underline hover:underline">
                {h.title}
              </a>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {h.description}
            </p>
          </div>

          {/* Prize pool plate — the money surface */}
          <div className="flex-none self-start rounded-lg border border-money/30 bg-money/10 px-3.5 py-2 text-right sm:self-auto">
            <span className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-wider text-money/85 uppercase">
              <IconTrophy className="size-3 text-money" /> Prize Pool
            </span>
            <span className="block font-mono text-base font-black tabular-nums text-money sm:text-lg">
              {format(h.prize_inr)}
            </span>
          </div>
        </div>

        {/* Worth Score Progress Bar */}
        <div className="pt-1">
          <WorthBar worth={worth} />
        </div>

        {/* Why this matches quote box */}
        {formattedWhy && (
          <div className="flex items-start gap-2.5 rounded-xl border border-l-2 border-border border-l-action/60 bg-muted/60 p-3 text-xs text-foreground">
            <IconSparkles className="mt-0.5 size-4 shrink-0 text-action" />
            <div className="space-y-0.5">
              <span className="block text-[11px] font-semibold tracking-wider text-action uppercase">
                Why this matches
              </span>
              <p className="leading-normal">{formattedWhy}</p>
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
              aria-label={`Filter by tag ${t}`}
              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-action/40 hover:bg-action/10 hover:text-action"
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Score Breakdown accordion */}
        {breakdown && (
          <Accordion
            type="single"
            collapsible
            className="rounded-xl border border-border bg-muted/40 px-3 [&_[data-slot=accordion-item]]:border-0"
          >
            <AccordionItem value="breakdown">
              <AccordionTrigger className="py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase hover:no-underline hover:text-action data-[state=open]:text-action data-[state=open]:hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <IconWorth className="size-3" />
                  Worth Score Formula
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs">
                <WorthBreakdownView breakdown={breakdown} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 border-t border-border">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-primary hover:bg-primary/10"
          >
            <a href={`/maxx?title=${encodeURIComponent(h.title)}&tags=${encodeURIComponent(h.tech_tags.join(", "))}`}>
              <IconZap className="size-3.5" />
              <span>Maxx around this</span>
            </a>
          </Button>
          <Button asChild size="sm" className="rounded-xl text-xs font-bold shadow-sm shadow-primary/30">
            <a href={h.url} target="_blank" rel="noreferrer">
              <span>Open Hackathon</span>
              <IconExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
