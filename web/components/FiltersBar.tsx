"use client";
import React from "react";
import { IconSearch, IconX, IconGlobe, IconMapPin, IconHybrid, IconFilters, IconReset } from "./Icons";
import { NativeSelect } from "./ui/native-select";

export const MODES = ["all", "online", "offline", "hybrid"] as const;
export type ModeFilter = (typeof MODES)[number];

export const SORT_OPTIONS = [
  { id: "deadline-asc", label: "Closing soonest" },
  { id: "prize-desc", label: "Highest prize" },
  { id: "title-asc", label: "Title (A–Z)" },
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
}) {
  const isFiltered = q.trim().length > 0 || mode !== "all" || (selectedPlatform && selectedPlatform !== "all");

  const modeIcons: Record<ModeFilter, React.ReactNode> = {
    all: null,
    online: <IconGlobe className="size-3" />,
    offline: <IconMapPin className="size-3" />,
    hybrid: <IconHybrid className="size-3" />,
  };

  return (
    <div className="mt-6 space-y-3.5">
      {/* Search Input & Core Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input with icons */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <IconSearch className="size-4" />
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, tech stack (AI, Next.js, Lambda) or keywords..."
            aria-label="Search hackathons"
            className="w-full rounded-lg border border-input bg-card/80 py-2.5 pr-10 pl-10 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>

        {/* Platform Dropdown if available */}
        {setSelectedPlatform && platforms.length > 0 && (
          <NativeSelect
            value={selectedPlatform || "all"}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-10 rounded-lg border-border bg-card/80 text-xs font-semibold focus:border-ring"
            aria-label="Filter by platform"
          >
            <option value="all">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect>
        )}

        {/* Sort Dropdown if available */}
        {setSort && (
          <NativeSelect
            value={sort || "deadline-asc"}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 rounded-lg border-border bg-card/80 text-xs font-semibold focus:border-ring"
            aria-label="Sort hackathons"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      {/* Mode pills & Quick topic chips */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Mode filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/60 p-1">
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
          <span className="flex items-center gap-1 mr-0.5 text-[11px] font-medium text-muted-foreground">
            <IconFilters className="size-3" /> Quick filters:
          </span>
          {QUICK_TAGS.map((tag) => {
            const active = q.toLowerCase().includes(tag.toLowerCase());
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (active) {
                    setQ(q.replace(new RegExp(`\\b${tag}\\b`, "i"), "").trim());
                  } else {
                    setQ(q ? `${q} ${tag}` : tag);
                  }
                }}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-all duration-150 ${
                  active
                    ? "border-action/45 bg-action/15 font-semibold text-action"
                    : "border-border bg-muted/60 font-medium text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
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
              className="ml-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-deadline transition-colors hover:bg-deadline/10 hover:underline"
            >
              <IconReset className="size-3" /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
