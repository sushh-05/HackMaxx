"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../lib/api";
import { FiltersBar, type ModeFilter, type SortOption } from "../components/FiltersBar";
import {
  IconCalendar,
  IconGlobe,
  IconSparkles,
  IconTrophy,
  IconZap,
  IconLayers,
  IconScale,
} from "../components/Icons";
import { useCurrency } from "../lib/currency";
import { Button } from "../components/ui/button";
import { HackathonWatchlist, type WatchlistRow } from "../components/ui/hackathon-watchlist";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { PinTicker } from "../components/PinTicker";
import { HackathonDrawer } from "../components/HackathonDrawer";
import { usePins } from "../lib/pins";

const COMPARE_KEY = "hackmaxx:compare:v1";
const COMPARE_MIN = 2;
const COMPARE_MAX = 3;

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export default function ExplorePage(): React.JSX.Element {
  const { format } = useCurrency();
  const [items, setItems] = useState<Hackathon[]>([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("deadline-asc");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dataSource, setDataSource] = useState("AWS API Gateway");
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  // Drawer state
  const [drawerRow, setDrawerRow] = useState<WatchlistRow | null>(null);

  // Pins state
  const { pins, toggle: togglePin, unpin } = usePins();

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareRejected, setCompareRejected] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPARE_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw) as unknown;
      if (Array.isArray(ids)) {
        setCompareIds(ids.filter((x): x is string => typeof x === "string").slice(0, COMPARE_MAX));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    if (!compareRejected) return;
    const t = setTimeout(() => setCompareRejected(false), 2200);
    return () => clearTimeout(t);
  }, [compareRejected]);

  function handleToggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        setCompareRejected(false);
        const next = prev.filter((x) => x !== id);
        try {
          window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }
      if (prev.length >= COMPARE_MAX) {
        setCompareRejected(true);
        return prev;
      }
      const next = [...prev, id];
      try {
        window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function handleLaunchCompare() {
    if (compareIds.length < COMPARE_MIN) return;
    try {
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
    } catch {}
    const qs = encodeURIComponent(compareIds.join(","));
    window.location.href = `/compare?ids=${qs}`;
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetchHackathons(q, mode)
        .then((data) => {
          if (!cancelled) {
            setItems(data.items);
            setDataSource(data.source);
            setFetchedAt(data.fetchedAt);
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
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, mode]);

  // Extract unique platforms
  const platforms = useMemo(() => {
    const set = new Set<string>();
    items.forEach((h) => {
      if (h.platform) set.add(h.platform);
    });
    return Array.from(set).sort();
  }, [items]);

  // Client-side filtering & sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedPlatform && selectedPlatform !== "all") {
      result = result.filter(
        (h) => h.platform.toLowerCase() === selectedPlatform.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === "deadline-asc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sort === "prize-desc") {
        return b.prize_inr - a.prize_inr;
      }
      if (sort === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [items, selectedPlatform, sort]);

  // Summary Metrics
  const totalPrizePool = useMemo(() => {
    return items.reduce((sum, h) => sum + (h.prize_inr || 0), 0);
  }, [items]);

  const urgentCount = useMemo(() => {
    return items.filter((h) => daysLeft(h.deadline) <= 7).length;
  }, [items]);

  function handleReset() {
    setQ("");
    setMode("all");
    setSelectedPlatform("all");
    setSort("deadline-asc");
  }

  return (
    <section className="space-y-6 pt-4 sm:pt-6">
      {/* Pinned Hackathons Ticker */}
      <PinTicker items={items} pins={pins} onUnpin={unpin} />

      {/* Hero Section with Live Stats */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <IconSparkles className="size-3.5" />
              <span>Hackathon Portfolio Dashboard</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Upcoming hackathons,{" "}
              <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl grad-text tracking-normal">
                worth-ranked.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Stop hunting one hackathon at a time. Browse active hackathons across Devpost, Devfolio,
              Unstop and MLH, then jump to{" "}
              <a href="/maxx" className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 transition-colors">
                Maxx My Project
              </a>{" "}
              to build a multi-submission portfolio with maximum expected value.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" className="rounded-2xl px-4 font-semibold">
              <a href="/timeline">
                <IconCalendar className="size-4" />
                <span>Timeline</span>
              </a>
            </Button>
            <Button asChild className="rounded-2xl px-5 shadow-lg shadow-primary/25 font-bold">
              <a href="/maxx">
                <IconZap className="size-4" />
                <span>Maxx My Project</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        {!err && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-money flex items-center gap-1.5">
                <IconTrophy className="size-3.5 text-money" /> Total Prize Pool
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-money block mt-1">
                {format(totalPrizePool)}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                across all open events
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <IconLayers className="size-3.5 text-primary" /> Active Hackathons
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-primary block mt-1">
                {items.length} Events
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ready for submission
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-deadline flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-deadline" /> Closing Soon
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-deadline block mt-1">
                {urgentCount} Hackathons
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ≤ 7 days left
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-data flex items-center gap-1.5">
                <IconGlobe className="size-3.5 text-data" /> Tracked Platforms
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-data block mt-1">
                {platforms.length || 4} Platforms
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Devpost, Devfolio, Unstop+
              </span>
            </div>
          </div>
        )}
      </div>

      {!loading && !err && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-border/70 py-2 text-[11px] font-medium tracking-wide text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 uppercase">
            <span className="size-1.5 rounded-full bg-win shadow-[0_0_8px_var(--color-win)]" />
            Live index
          </span>
          <span>{dataSource}</span>
          <span className="font-mono tabular-nums">
            {fetchedAt ? `Fetched ${new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Fetched just now"}
          </span>
          <span className="text-base-content/40">Deadlines and prizes are checked at request time.</span>
        </div>
      )}

      {/* Filters Bar */}
      <FiltersBar
        q={q}
        setQ={setQ}
        mode={mode}
        setMode={setMode}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        platforms={platforms}
        sort={sort}
        setSort={setSort}
        onReset={handleReset}
      />

      {/* Error Alert */}
      {err && (
        <Alert className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive shadow-lg">
          <IconZap className="size-5" />
          <AlertTitle className="font-bold">Backend Connection Issue</AlertTitle>
          <AlertDescription className="text-xs opacity-90">{err}</AlertDescription>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {loading && !err && (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-muted rounded-full" />
                <div className="h-4 w-20 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-2/3 bg-muted/80 rounded-lg" />
              <div className="h-4 w-full bg-muted/50 rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded-lg" />
                <div className="h-5 w-20 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !err && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <IconSparkles className="size-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display font-bold text-lg text-foreground">No matching hackathons</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No open hackathons match your current search or filters. Try adjusting your query or resetting all filters.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl font-semibold"
          >
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Results — watchlist rows with pinning, compare, and drawer details */}
      {!loading && !err && filteredItems.length > 0 && (
        <HackathonWatchlist
          rows={filteredItems.map((h) => ({
            id: h.id,
            title: h.title,
            url: h.url,
            platform: h.platform,
            mode: h.mode,
            deadline: h.deadline,
            prize_inr: h.prize_inr,
            tech_tags: h.tech_tags,
          }))}
          sort={sort}
          onSort={setSort}
          title="Hackathon Dashboard"
          onTagClick={setQ}
          pins={pins}
          onTogglePin={togglePin}
          compareIds={compareIds}
          onToggleCompare={handleToggleCompare}
          compareRejected={compareRejected}
          onRowClick={(row) => setDrawerRow(row)}
        />
      )}

      {/* Detail slide-over drawer */}
      <HackathonDrawer
        row={drawerRow}
        open={drawerRow !== null}
        onClose={() => setDrawerRow(null)}
        onTagClick={setQ}
        isPinned={drawerRow ? pins.includes(drawerRow.id) : false}
        onTogglePin={togglePin}
      />

      {/* Floating compare bar — appears once ≥1 row is staged */}
      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3.5 rounded-2xl border border-action/40 bg-card/95 backdrop-blur-md px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-2xl max-w-[calc(100vw-32px)] sm:max-w-none">
            <span className="font-mono text-xs tabular-nums text-muted-foreground flex items-center gap-1.5">
              <IconScale className="size-3.5 text-action" />
              <span>{compareIds.length}/{COMPARE_MAX} staged</span>
            </span>
            {compareRejected && (
              <span className="font-mono text-[11px] sm:text-xs text-deadline truncate max-w-[140px] sm:max-w-none">
                max {COMPARE_MAX} reached
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleLaunchCompare}
              disabled={compareIds.length < COMPARE_MIN}
              className="rounded-xl font-bold gap-1 sm:gap-1.5 shadow-sm shadow-primary/25 text-xs sm:text-sm px-3"
            >
              <span>Compare</span>
              <span className="font-mono tabular-nums">({compareIds.length})</span>
            </Button>
            <button
              type="button"
              onClick={() => {
                setCompareIds([]);
                try {
                  window.localStorage.removeItem(COMPARE_KEY);
                } catch {}
              }}
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              clear
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
