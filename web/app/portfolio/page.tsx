"use client";

/**
 * /portfolio — saved projects as open positions.
 *
 * Row discipline mirrors components/ui/hackathon-watchlist.tsx: hairline
 * dividers, mono tabular numerics, W-glyph for the best worth score, money
 * colour for best total EV. Rows deep-link back to /maxx prefilled.
 */
import React, { useEffect, useState } from "react";
import { cn } from "cn";
import {
  IconPortfolio,
  IconDeadline,
  IconTrash,
  IconZap,
  IconBoxes,
  IconArrowRight,
} from "../../components/Icons";
import { WorthScoreGlyph } from "../../components/WorthScoreGauge";
import { Button } from "../../components/ui/button";
import { useCurrency } from "../../lib/currency";
import {
  listProjects,
  deleteProject,
  type PortfolioProject,
} from "../../lib/portfolio";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function maxxHref(p: PortfolioProject): string {
  const sp = new URLSearchParams({
    title: p.title,
    description: p.description,
    stack: p.stack.join(", "),
    tags: p.tags.join(", "),
  });
  return `/maxx?${sp.toString()}`;
}

export default function PortfolioPage(): React.JSX.Element {
  const [projects, setProjects] = useState<PortfolioProject[] | null>(null);
  const { format } = useCurrency();

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  function remove(id: string) {
    deleteProject(id);
    setProjects(listProjects());
  }

  return (
    <section className="space-y-6 pt-6 sm:pt-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <IconPortfolio className="size-3.5" />
          <span>Open Positions</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Your project{" "}
          <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl grad-text tracking-normal">
            portfolio.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Projects you have Maxxed, held like positions. Each row carries the last run&apos;s
          total expected value and best worth score — re-Maxx when the hackathon tape moves.
        </p>
      </div>

      {projects !== null && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center space-y-4">
          <div className="mx-auto size-11 rounded-xl bg-muted flex items-center justify-center">
            <IconPortfolio className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
              No positions open
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Run a project through the engine and save the result — it will list here with
              its EV, plan size and best worth score.
            </p>
          </div>
          <Button asChild size="sm" className="gap-1.5 rounded-xl font-bold">
            <a href="/maxx">
              <IconZap className="size-4" />
              <span>Maxx a project</span>
              <IconArrowRight className="size-3.5" />
            </a>
          </Button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <h3 className="text-[13px] font-semibold text-foreground">Positions</h3>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {projects.length} {projects.length === 1 ? "position" : "positions"}
            </span>
          </div>

          {/* column header — mirrors the hackathon watchlist grid */}
          <div className="hidden border-b border-border px-4 py-2 sm:grid sm:grid-cols-[minmax(0,1fr)_110px_74px_124px_64px_40px] sm:items-center sm:gap-3 sm:px-5">
            <span className="text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
              Project
            </span>
            <span className="text-right text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
              Last Maxxed
            </span>
            <span className="text-right text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
              Worth
            </span>
            <span className="text-right text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
              Total EV
            </span>
            <span className="text-right text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
              Plan
            </span>
            <span />
          </div>

          {projects.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-3 gap-y-1.5 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-foreground/[0.03] sm:grid-cols-[minmax(0,1fr)_110px_74px_124px_64px_40px] sm:px-5"
            >
              {/* project */}
              <div className="flex min-w-0 flex-col gap-1">
                <a
                  href={maxxHref(p)}
                  className="truncate text-[13px] font-semibold text-foreground no-underline hover:text-action hover:underline"
                  title="Open in Maxx, prefilled"
                >
                  {p.title}
                </a>
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                  {p.stack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-border bg-muted/60 px-1 py-px font-mono text-[9px]"
                    >
                      #{t}
                    </span>
                  ))}
                  {p.stack.length > 3 && (
                    <span className="font-mono text-[9px]">+{p.stack.length - 3}</span>
                  )}
                </div>
              </div>

              {/* metrics — sm:contents hands cells to the outer grid on desktop */}
              <div className="col-start-1 flex items-center justify-between gap-3 sm:contents">
                <div className="flex items-center justify-start gap-1 text-[11px] text-muted-foreground sm:justify-end sm:w-[110px]">
                  <IconDeadline className="size-3" />
                  <span className="font-mono tabular-nums">{formatDate(p.snapshot.timestamp)}</span>
                </div>

                <div className="flex justify-end sm:w-[74px]">
                  <WorthScoreGlyph worth={p.snapshot.topWorth} className="text-base" />
                </div>

                <div className="text-right sm:w-[124px]">
                  <span className="block font-mono text-[13px] font-bold tabular-nums text-money">
                    {format(p.snapshot.totalEV)}
                  </span>
                  <span className="block font-mono text-[9px] tabular-nums text-money/70">
                    best run
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1 text-[11px] text-data sm:w-[64px]">
                  <IconBoxes className="size-3" />
                  <span className="font-mono font-semibold tabular-nums">
                    {p.snapshot.planLength}
                  </span>
                </div>
              </div>

              {/* close position */}
              <div className={cn("row-start-1 col-start-2 flex justify-end sm:row-auto sm:col-start-auto")}>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Close position ${p.title}`}
                  title="Close position"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-deadline hover:bg-deadline/10"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
