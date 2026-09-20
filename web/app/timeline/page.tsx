"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../../lib/api";
import {
  IconDeadline,
  IconTimeline,
  IconFlame,
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconZap,
} from "../../components/Icons";
import { useCurrency } from "../../lib/currency";
import { Button } from "../../components/ui/button";
import { HackathonDrawer } from "../../components/HackathonDrawer";
import { getPlatformBadgeStyle } from "../../components/HackathonCard";
import type { WatchlistRow } from "../../components/ui/hackathon-watchlist";

const DAY_MS = 86400000;
const URGENT_DAYS = 7;

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS));
}

/** Start of local day, so the "today" hairline is stable within a session. */
function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

interface MonthTick {
  label: string;
  pct: number;
}

export default function TimelinePage(): React.JSX.Element {
  const { format } = useCurrency();
  const [items, setItems] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "online" | "offline" | "hybrid">("all");
  const [drawerRow, setDrawerRow] = useState<WatchlistRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHackathons()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setErr("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErr("Backend not reachable — make sure `bun run dev:backend` is running on port 3011.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return items
      .filter((h) => h.deadline && !Number.isNaN(new Date(h.deadline).getTime()))
      .filter((h) => (modeFilter === "all" ? true : h.mode === modeFilter))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [items, modeFilter]);

  const rangeStart = useMemo(() => todayStart(), []);
  const rangeEnd = useMemo(() => {
    if (rows.length === 0) return rangeStart + 30 * DAY_MS;
    const furthest = Math.max(...rows.map((h) => new Date(h.deadline).getTime()));
    return Math.max(furthest + DAY_MS, rangeStart + DAY_MS * 14);
  }, [rows, rangeStart]);
  const span = rangeEnd - rangeStart;

  const pct = (t: number): number => Math.min(100, Math.max(0, ((t - rangeStart) / span) * 100));

  const monthTicks = useMemo<MonthTick[]>(() => {
    const ticks: MonthTick[] = [];
    const cursor = new Date(rangeStart);
    cursor.setDate(1);
    if (cursor.getTime() < rangeStart) cursor.setMonth(cursor.getMonth() + 1);
    while (cursor.getTime() <= rangeEnd && ticks.length < 24) {
      ticks.push({
        label: cursor.toLocaleDateString("en-IN", { month: "short" }),
        pct: pct(cursor.getTime()),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return ticks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  const urgentCount = useMemo(
    () => rows.filter((h) => daysLeft(h.deadline) <= URGENT_DAYS).length,
    [rows]
  );
  const totalPrize = useMemo(() => rows.reduce((s, h) => s + (h.prize_inr || 0), 0), [rows]);

  return (
    <section className="space-y-6 pt-6 sm:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <IconTimeline className="size-3.5" />
            <span>Deadline Gantt</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Timeline
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Every tracked hackathon on one clock. Bars run from today to deadline —{" "}
            <span className="text-deadline font-semibold">deadline colour</span> when the window is ≤ {URGENT_DAYS} days.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Mode filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/70 rounded-xl border border-border">
            {(["all", "online", "offline", "hybrid"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModeFilter(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  modeFilter === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono tabular-nums text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconFlame className="size-3.5 text-deadline" />
              <strong className="text-foreground">{urgentCount}</strong> closing soon
            </span>
            <span className="text-money font-semibold">{format(totalPrize)}</span>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-deadline/40 bg-deadline/10 px-4 py-2.5 text-xs text-deadline">
          {err}
        </div>
      )}

      {/* Gantt panel */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Month axis */}
        <div className="relative h-8 border-b border-border mx-4 sm:mx-6">
          {monthTicks.map((t) => (
            <div
              key={`${t.label}-${t.pct}`}
              className="absolute top-0 h-full border-l border-border"
              style={{ left: `${t.pct}%` }}
            >
              <span className="absolute top-1.5 left-1.5 font-mono tabular-nums text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="relative px-4 sm:px-6 py-2">
          {/* Today hairline — spans ticks + rows */}
          <div
            className="absolute top-0 bottom-0 w-px bg-action/60 pointer-events-none z-10"
            style={{ left: `${pct(Date.now())}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-1 -translate-x-1/2 font-mono tabular-nums text-[9px] uppercase tracking-[0.1em] text-action bg-card px-1 rounded-sm border border-action/40">
              today
            </span>
          </div>

          {loading && (
            <div className="py-12 text-center font-mono tabular-nums text-sm text-muted-foreground">
              loading deadlines…
            </div>
          )}

          {!loading && rows.length === 0 && !err && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No upcoming hackathons found for mode: {modeFilter}.
            </div>
          )}

          <ul className="divide-y divide-border">
            {rows.map((h, i) => {
              const dl = new Date(h.deadline).getTime();
              const left = pct(rangeStart);
              const width = Math.max(pct(dl) - left, 0.5);
              const dLeft = daysLeft(h.deadline);
              const urgent = dLeft <= URGENT_DAYS;
              const platform = getPlatformBadgeStyle(h.platform);

              return (
                <li
                  key={h.id}
                  className="flex items-center gap-3 py-2.5 hover:bg-foreground/[0.02] transition-colors rounded-lg px-1.5 -mx-1.5 cursor-pointer"
                  onClick={() =>
                    setDrawerRow({
                      id: h.id,
                      title: h.title,
                      url: h.url,
                      platform: h.platform,
                      mode: h.mode,
                      deadline: h.deadline,
                      prize_inr: h.prize_inr,
                      tech_tags: h.tech_tags,
                    })
                  }
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  {/* Title + platform + deadline meta */}
                  <div className="w-48 sm:w-60 shrink-0 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`inline-flex shrink-0 rounded-full border px-1.5 py-px text-[9px] font-bold tracking-wider uppercase ${platform.bg} ${platform.text} ${platform.border}`}
                      >
                        {h.platform}
                      </span>
                      <span className="truncate text-sm font-semibold text-foreground hover:text-action">
                        {h.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px] text-muted-foreground mt-0.5">
                      <IconDeadline className={`size-3 ${urgent ? "text-deadline" : "text-data"}`} />
                      <span className={urgent ? "text-deadline font-semibold" : ""}>{dLeft}d left</span>
                      <span>·</span>
                      <span>{new Date(h.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="relative flex-1 h-3">
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full origin-left ${
                        urgent ? "bg-deadline" : "bg-data"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`Deadline: ${new Date(h.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
                    />
                    {/* Deadline end-cap dot */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full border border-card ${
                        urgent ? "bg-deadline" : "bg-data"
                      }`}
                      style={{ left: `${left + width}%` }}
                    />
                  </div>

                  {/* Prize & Maxx action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 text-right font-mono tabular-nums text-sm font-semibold text-money">
                      {h.prize_inr > 0 ? format(h.prize_inr) : "—"}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs font-semibold text-action hover:bg-action/10 hover:text-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`/maxx?title=${encodeURIComponent(h.title)}&tags=${encodeURIComponent(h.tech_tags.join(", "))}`}>
                        <IconZap className="size-3" />
                        <span className="hidden sm:inline">Maxx</span>
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 font-mono tabular-nums text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-1.5 rounded-full bg-data" /> window open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-1.5 rounded-full bg-deadline" /> ≤ {URGENT_DAYS} days left
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-px h-3 bg-action/60" /> today
        </span>
      </div>

      {/* Detail slide-over drawer */}
      <HackathonDrawer
        row={drawerRow}
        open={drawerRow !== null}
        onClose={() => setDrawerRow(null)}
      />
    </section>
  );
}
