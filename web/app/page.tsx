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
} from "../components/Icons";
import { useCurrency } from "../lib/currency";
import { Button } from "../components/ui/button";
import { HackathonWatchlist } from "../components/ui/hackathon-watchlist";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetchHackathons(q, mode)
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
    <section className="space-y-8 pt-6 sm:pt-8">
      {/* Hero Section with Live Stats */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <IconSparkles className="size-3.5" />
              <span>AI-Ranked Hackathon Portfolio</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Upcoming hackathons,{" "}
              <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl grad-text tracking-normal">
                worth-ranked.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
              Stop hunting one hackathon at a time. Browse active hackathons across Devpost, Devfolio,
              Unstop and MLH, then jump to{" "}
              <a href="/maxx" className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 transition-colors">
                Maxx My Project
              </a>{" "}
              to build a multi-submission portfolio with maximum expected value.
            </p>
          </div>

          <div className="flex-none">
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
            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-money flex items-center gap-1.5">
                <IconTrophy className="size-3.5 text-money" /> Total Prize Pool
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-money block mt-1">
                {format(totalPrizePool)}
              </span>
              <span className="text-[11px] text-base-content/50 block mt-0.5">
                across all open events
              </span>
            </div>

            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <IconLayers className="size-3.5 text-primary" /> Active Hackathons
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-primary block mt-1">
                {items.length} Events
              </span>
              <span className="text-[11px] text-base-content/50 block mt-0.5">
                ready for submission
              </span>
            </div>

            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-warning flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-warning" /> Closing Soon
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-warning block mt-1">
                {urgentCount} Hackathons
              </span>
              <span className="text-[11px] text-base-content/50 block mt-0.5">
                ≤ 7 days left
              </span>
            </div>

            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-secondary flex items-center gap-1.5">
                <IconGlobe className="size-3.5 text-secondary" /> Tracked Platforms
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-secondary block mt-1">
                {platforms.length || 4} Platforms
              </span>
              <span className="text-[11px] text-base-content/50 block mt-0.5">
                Devpost, Devfolio, Unstop+
              </span>
            </div>
          </div>
        )}
      </div>

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
        <Alert className="rounded-2xl border border-error/30 shadow-lg bg-error text-error-content">
          <IconZap className="size-5" />
          <AlertTitle className="font-bold">Backend Connection Issue</AlertTitle>
          <AlertDescription className="text-xs opacity-90 text-error-content">{err}</AlertDescription>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {loading && !err && (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-glass rounded-2xl p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-base-content/10 rounded-full" />
                <div className="h-4 w-20 bg-base-content/10 rounded-full" />
              </div>
              <div className="h-6 w-2/3 bg-base-content/15 rounded-lg" />
              <div className="h-4 w-full bg-base-content/10 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-base-content/10 rounded-lg" />
                <div className="h-6 w-20 bg-base-content/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !err && filteredItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-base-content/20 bg-base-200/40 p-12 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-base-300 flex items-center justify-center mx-auto text-base-content/50">
            <IconSparkles className="size-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display font-bold text-lg">No matching hackathons</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
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

      {/* Results — watchlist rows, not marketing cards (DESIGN.md > Layout) */}
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
          title="Open hackathons"
          onTagClick={setQ}
        />
      )}
    </section>
  );
}
