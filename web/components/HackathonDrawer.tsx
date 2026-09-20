"use client";

/**
 * Hackathon detail drawer — right-side slide-over opened from a watchlist row.
 *
 * Hand-rolled (no sheet/dialog dep): fixed positioning + CSS transform
 * transition on the DESIGN.md entrance easing, backdrop click + Esc to close.
 * Zero layout shift when closed — the panel is `fixed` and translated fully
 * off-canvas, so it never participates in document flow.
 *
 * All colours are Notebook theme semantic tokens (action/data/money/deadline),
 * numbers are mono tabular-nums, icons come from ./Icons role exports.
 */
import { useEffect, useState } from "react";
import { cn } from "cn";
import {
  IconX,
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconDeadline,
  IconFlame,
  IconTrophy,
  IconZap,
  IconWorth,
  IconExternal,
  IconTarget,
  IconSparkles,
  IconTrendingUp,
  IconPin,
  IconPinOff,
} from "./Icons";
import { getPlatformBadgeStyle } from "./HackathonCard";
import { useCurrency } from "../lib/currency";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import type { WatchlistRow } from "./ui/hackathon-watchlist";

const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

const MODE_ICON: Record<string, React.ReactNode> = {
  online: <IconGlobe className="size-3.5 text-action" />,
  offline: <IconMapPin className="size-3.5 text-data" />,
  hybrid: <IconHybrid className="size-3.5 text-money" />,
};

/** Worth-score formula factors, in plain terms (weights from WorthBreakdownView). */
const FORMULA_FACTORS = [
  {
    icon: <IconTarget className="size-3.5 shrink-0 text-data" />,
    label: "Skill Similarity",
    weight: "30%",
    plain: "How closely the hackathon's tech tags overlap the stack you already know.",
  },
  {
    icon: <IconSparkles className="size-3.5 shrink-0 text-data" />,
    label: "Learning & Tags",
    weight: "20%",
    plain: "Credit for tags that stretch you a little — new enough to grow, close enough to ship.",
  },
  {
    icon: <IconTrendingUp className="size-3.5 shrink-0 text-data" />,
    label: "Platform Trust",
    weight: "20%",
    plain: "Track record of the hosting platform — established platforms pay out and judge fairly.",
  },
  {
    icon: <IconWorth className="size-3.5 shrink-0 text-data" />,
    label: "Difficulty Fit",
    weight: "15%",
    plain: "Whether the event's scope matches what one builder can realistically finish in time.",
  },
  {
    icon: <IconTrophy className="size-3.5 shrink-0 text-money" />,
    label: "Prize Scale",
    weight: "15%",
    plain: "The size of the prize pool relative to the field — bigger pots score higher.",
  },
];

export function HackathonDrawer({
  row,
  open,
  onClose,
  onTagClick,
  isPinned = false,
  onTogglePin,
}: {
  row: WatchlistRow | null;
  open: boolean;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}) {
  const { format } = useCurrency();
  // Keep the last row mounted during the exit transition so content doesn't
  // vanish mid-slide.
  const [rendered, setRendered] = useState<WatchlistRow | null>(row);
  useEffect(() => {
    if (row) setRendered(row);
  }, [row]);

  // Lock background scroll when drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!rendered) return null;

  const days = daysLeft(rendered.deadline);
  const soon = days <= 7;
  const urgent = days <= 3;
  const platform = getPlatformBadgeStyle(rendered.platform);
  const maxxHref = `/maxx?title=${encodeURIComponent(rendered.title)}&tags=${encodeURIComponent(
    rendered.tech_tags.join(", "),
  )}`;

  return (
    <div
      aria-hidden={!open}
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${rendered.title} details`}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-bold tracking-wider uppercase",
                  platform.bg,
                  platform.text,
                  platform.border,
                )}
              >
                {rendered.platform}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                {MODE_ICON[rendered.mode] ?? null}
                {rendered.mode}
              </span>
            </div>
            <h2 className="font-display text-lg leading-tight font-bold text-foreground">
              {rendered.title}
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(rendered.id)}
                aria-pressed={isPinned}
                aria-label={isPinned ? `Unpin ${rendered.title}` : `Pin ${rendered.title}`}
                title={isPinned ? "Unpin from ticker" : "Pin to ticker"}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  isPinned ? "text-action bg-action/10" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isPinned ? <IconPin className="size-4" /> : <IconPinOff className="size-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <IconX className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {/* Deadline + prize facts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {urgent ? (
                  <IconFlame className="size-3 text-deadline" />
                ) : (
                  <IconDeadline className="size-3" />
                )}
                Deadline
              </span>
              <span className="mt-1 block font-mono text-[13px] font-semibold tabular-nums text-foreground">
                {new Date(rendered.deadline).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span
                className={cn(
                  "block font-mono text-[11px] font-semibold tabular-nums",
                  soon ? "text-deadline" : "text-muted-foreground",
                )}
              >
                {days}d left
              </span>
            </div>

            <div className="rounded-lg border border-money/30 bg-money/10 px-3 py-2">
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-money/85 uppercase">
                <IconTrophy className="size-3 text-money" />
                Prize Pool
              </span>
              <span className="mt-1 block font-mono text-[15px] font-black tabular-nums text-money">
                {format(rendered.prize_inr)}
              </span>
              {typeof rendered.ev_inr === "number" && (
                <span className="block font-mono text-[10px] tabular-nums text-money/70">
                  EV {format(rendered.ev_inr)}
                </span>
              )}
            </div>
          </div>

          {/* Tech tags */}
          {rendered.tech_tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Stack
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {rendered.tech_tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onTagClick?.(t);
                      onClose();
                    }}
                    className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-action/40 hover:text-action"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Worth-score formula explainer */}
          <Accordion
            type="single"
            collapsible
            className="rounded-xl border border-border bg-muted/40 px-3 [&_[data-slot=accordion-item]]:border-0"
          >
            <AccordionItem value="formula">
              <AccordionTrigger className="py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase hover:no-underline hover:text-action data-[state=open]:text-action data-[state=open]:hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <IconWorth className="size-3" />
                  How the Worth Score works
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs">
                <ul className="space-y-2.5 pb-1">
                  {FORMULA_FACTORS.map((f) => (
                    <li key={f.label} className="flex items-start gap-2">
                      {f.icon}
                      <div className="space-y-0.5">
                        <span className="block text-[11px] font-semibold text-foreground">
                          {f.label}{" "}
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {f.weight}
                          </span>
                        </span>
                        <p className="leading-normal text-muted-foreground">{f.plain}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Button asChild className="flex-1 rounded-xl text-xs font-bold shadow-sm shadow-primary/30">
            <a href={maxxHref}>
              <IconZap className="size-3.5" />
              <span>Maxx against this hackathon</span>
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
            <a href={rendered.url} target="_blank" rel="noreferrer">
              <span>Open</span>
              <IconExternal className="size-3.5" />
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}
