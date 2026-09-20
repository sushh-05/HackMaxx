"use client";
import React from "react";
import { IconSearch, IconX, IconGlobe, IconMapPin, IconZap, IconSliders } from "./Icons";

export const MODES = ["all", "online", "offline", "hybrid"] as const;
export type ModeFilter = (typeof MODES)[number];

export const SORT_OPTIONS = [
  { id: "deadline-asc", label: "⏳ Closing soonest" },
  { id: "prize-desc", label: "💰 Highest prize" },
  { id: "title-asc", label: "🔤 Title (A–Z)" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["id"];

export const QUICK_TAGS = [
  "AI",
  "Bedrock",
  "Fintech",
  "Devtools",
  "Cloud",
  "Open Source",
  "Serverless",
  "Web3",
];

export function FiltersBar({
  q,
  setQ,
  mode,
  setMode,
  selectedPlatform,
  setSelectedPlatform,
  platforms = [],
  sort,
  setSort,
  onReset,
}: {
  q: string;
  setQ: (v: string) => void;
  mode: ModeFilter;
  setMode: (m: ModeFilter) => void;
  selectedPlatform?: string;
  setSelectedPlatform?: (p: string) => void;
  platforms?: string[];
  sort?: SortOption;
  setSort?: (s: SortOption) => void;
  onReset?: () => void;
}): React.JSX.Element {
  const isFiltered = q.trim().length > 0 || mode !== "all" || (selectedPlatform && selectedPlatform !== "all");

  const modeIcons: Record<ModeFilter, React.ReactNode> = {
    all: null,
    online: <IconGlobe className="w-3 h-3" />,
    offline: <IconMapPin className="w-3 h-3" />,
    hybrid: <IconZap className="w-3 h-3" />,
  };

  return (
    <div className="mt-6 space-y-3.5">
      {/* Search Input & Core Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input with icons */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-base-content/40">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, tech stack (AI, Next.js, Lambda) or keywords..."
            aria-label="Search hackathons"
            className="w-full rounded-2xl bg-base-200/90 border border-base-content/15 pl-10 pr-10 py-2.5 text-sm placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-base-content/40 hover:text-base-content"
              aria-label="Clear search"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Platform Dropdown if available */}
        {setSelectedPlatform && platforms.length > 0 && (
          <div className="relative">
            <select
              value={selectedPlatform || "all"}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="select select-bordered select-sm h-10 rounded-xl bg-base-200 text-xs font-semibold border-base-content/15 focus:border-primary"
              aria-label="Filter by platform"
            >
              <option value="all">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Dropdown if available */}
        {setSort && (
          <div className="relative">
            <select
              value={sort || "deadline-asc"}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="select select-bordered select-sm h-10 rounded-xl bg-base-200 text-xs font-semibold border-base-content/15 focus:border-primary"
              aria-label="Sort hackathons"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mode pills & Quick topic chips */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Mode filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-base-200/60 rounded-xl border border-base-content/10">
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-content shadow-sm shadow-primary/30"
                    : "text-base-content/65 hover:text-base-content hover:bg-base-300"
                }`}
                onClick={() => setMode(m)}
              >
                {modeIcons[m]}
                <span>{m === "all" ? "All Modes" : m}</span>
              </button>
            );
          })}
        </div>

        {/* Quick tag chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-base-content/40 flex items-center gap-1 mr-0.5">
            <IconSliders className="w-3 h-3" /> Quick filters:
          </span>
          {QUICK_TAGS.map((tag) => {
            const active = q.toLowerCase().includes(tag.toLowerCase());
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (active) {
                    setQ(q.replace(new RegExp(`\\b${tag}\\b`, "i"), "").trim());
                  } else {
                    setQ(q ? `${q} ${tag}` : tag);
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all duration-150 border ${
                  active
                    ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                    : "bg-base-200/70 hover:bg-base-300 text-base-content/60 border-base-content/10 hover:border-base-content/20"
                }`}
              >
                {tag}
              </button>
            );
          })}

          {isFiltered && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] font-semibold text-error hover:underline ml-1 px-1.5 py-0.5"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
