"use client";
import React from "react";
import {
  IconSearch,
  IconX,
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconFilters,
  IconReset,
  IconDeadline,
  IconMoney,
  IconTag,
  type AppIcon,
} from "./Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const MODES = ["all", "online", "offline", "hybrid"] as const;
export type ModeFilter = (typeof MODES)[number];

export const SORT_OPTIONS = [
  { id: "deadline-asc", label: "Closing soonest" },
  { id: "prize-desc", label: "Highest prize" },
  { id: "title-asc", label: "Title (A–Z)" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["id"];

/** Real icons in the dropdown — a native <option> can only do emoji, or nothing. */
const SORT_ICON: Record<SortOption, React.ReactNode> = {
  "deadline-asc": <IconDeadline className="size-3.5 text-muted-foreground" />,
  "prize-desc": <IconMoney className="size-3.5 text-muted-foreground" />,
  "title-asc": <IconTag className="size-3.5 text-muted-foreground" />,
};

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

  const modeIcons: Record<ModeFilter, AppIcon | null> = {
    all: null,
    online: IconGlobe,
    offline: IconMapPin,
    hybrid: IconHybrid,
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

        {/* Platform Dropdown */}
        {setSelectedPlatform && platforms.length > 0 && (
          <Select value={selectedPlatform || "all"} onValueChange={setSelectedPlatform}>
            <SelectTrigger size="sm" className="h-10 w-[172px] rounded-lg text-xs font-semibold" aria-label="Filter by platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort Dropdown */}
        {setSort && (
          <Select value={sort || "deadline-asc"} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger size="sm" className="h-10 w-[196px] rounded-lg text-xs font-semibold" aria-label="Sort hackathons">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  <span className="flex items-center gap-1.5">
                    {SORT_ICON[opt.id]}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mode pills & Quick topic chips */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Mode filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/60 p-1">
          {MODES.map((m) => {
            const active = mode === m;
            const ModeIcon = modeIcons[m];
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
                {ModeIcon && <ModeIcon className="w-3 h-3" />}
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
