"use client";
import { useEffect, useMemo, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../lib/api";
import { FiltersBar, type ModeFilter, type SortOption } from "../components/FiltersBar";
import { getPlatformBadgeStyle } from "../components/HackathonCard";
import {
  IconCalendar,
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconSparkles,
  IconTrophy,
  IconZap,
  IconLayers,
} from "../components/Icons";

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export default function ExplorePage(): React.JSX.Element {
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
              <IconSparkles className="w-3.5 h-3.5" />
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
              <a href="/maxx" className="link link-primary font-semibold">
                Maxx My Project
              </a>{" "}
              to build a multi-submission portfolio with maximum expected value.
            </p>
          </div>

          <div className="flex-none">
            <a
              href="/maxx"
              className="btn btn-primary rounded-2xl px-5 shadow-lg shadow-primary/25 font-bold flex items-center gap-2"
            >
              <IconZap className="w-4 h-4" />
              <span>Maxx My Project</span>
            </a>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        {!err && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-accent flex items-center gap-1.5">
                <IconTrophy className="w-3.5 h-3.5 text-accent" /> Total Prize Pool
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tabular-nums text-accent block mt-1">
                ₹{totalPrizePool.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-base-content/50 block mt-0.5">
                across all open events
              </span>
            </div>

            <div className="card-glass rounded-2xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <IconLayers className="w-3.5 h-3.5 text-primary" /> Active Hackathons
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
                <IconCalendar className="w-3.5 h-3.5 text-warning" /> Closing Soon
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
                <IconGlobe className="w-3.5 h-3.5 text-secondary" /> Tracked Platforms
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
        <div role="alert" className="alert alert-error rounded-2xl border border-error/30 shadow-lg">
          <IconZap className="w-5 h-5 text-white" />
          <div>
            <h4 className="font-bold">Backend Connection Issue</h4>
            <p className="text-xs opacity-90">{err}</p>
          </div>
        </div>
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
          <div className="w-12 h-12 rounded-2xl bg-base-300 flex items-center justify-center mx-auto text-base-content/50">
            <IconSparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display font-bold text-lg">No matching hackathons</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              No open hackathons match your current search or filters. Try adjusting your query or resetting all filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-sm rounded-xl font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Results List */}
      {!loading && !err && filteredItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-base-content/50 px-1">
            <span>
              Showing <strong className="text-base-content font-mono">{filteredItems.length}</strong> hackathon
              {filteredItems.length === 1 ? "" : "s"}
            </span>
            <span>Sorted by: {sort === "deadline-asc" ? "Deadline soonest" : sort === "prize-desc" ? "Highest prize" : "Title"}</span>
          </div>

          <div className="grid gap-4">
            {filteredItems.map((h) => {
              const d = daysLeft(h.deadline);
              const platformStyle = getPlatformBadgeStyle(h.platform);

              return (
                <article
                  key={h.id}
                  className="card-glass rounded-2xl p-5 sm:p-6 card-in transition-all duration-200 hover:-translate-y-0.5 group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Top row: Platform, Mode, Countdown */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] border ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
                          {h.platform}
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-base-300/80 text-base-content/70 border border-base-content/10 capitalize">
                          {h.mode === "online" && <IconGlobe className="w-3 h-3 text-primary" />}
                          {h.mode === "offline" && <IconMapPin className="w-3 h-3 text-amber-400" />}
                          {h.mode === "hybrid" && <IconZap className="w-3 h-3 text-secondary" />}
                          <span>{h.mode}</span>
                        </span>

                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${d <= 3
                              ? "bg-error/15 text-error border-error/30 animate-pulse"
                              : d <= 7
                                ? "bg-warning/15 text-warning border-warning/30"
                                : "bg-base-300/80 text-base-content/70 border-base-content/10"
                            }`}
                        >
                          <IconCalendar className="w-3 h-3" />
                          <span>{d <= 3 ? `🚨 ${d}d left · Closing soon` : `${d}d left`}</span>
                        </span>
                      </div>

                      {/* Prize display */}
                      <div className="px-3 py-1 rounded-xl bg-accent/10 border border-accent/25 text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-accent/80 flex items-center gap-1 justify-end">
                          <IconTrophy className="w-3 h-3 text-accent" /> Prize
                        </span>
                        <span className="font-mono text-base font-black tabular-nums text-accent block">
                          ₹{h.prize_inr.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Title and description */}
                    <div className="space-y-1.5">
                      <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">
                        <a href={h.url} target="_blank" rel="noreferrer" className="no-underline hover:underline">
                          {h.title}
                        </a>
                      </h3>
                      <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {h.description}
                      </p>
                    </div>

                    {/* Tech tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {h.tech_tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQ(t)}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-base-content/8">
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
            })}
          </div>
        </div>
      )}
    </section>
  );
}
