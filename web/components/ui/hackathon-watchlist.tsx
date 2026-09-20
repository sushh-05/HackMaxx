"use client";

/**
 * Watchlist table — dense, trade-desk style list of hackathons with
 * real-time sorting, worth scores, compare selection, pinning, and drawer details.
 *
 * Visual hierarchy:
 *   - Accent rail at the row's leading edge marks active row
 *   - Checkbox on the left enables head-to-head comparison staging
 *   - Pin button on the right pins to the top ticker
 *   - Clicking anywhere on the row opens the detail slide-over
 *   - Monospace tabular-nums for all figures (worth, prize, deadline days)
 *   - Semantic Notebook tokens only (money, win, deadline, action, data)
 */
import { useState } from "react";
import { cn } from "cn";
import {
  IconCheck,
  IconChevronDown,
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconFlame,
  IconDeadline,
  IconPin,
  IconPinOff,
} from "../Icons";
import { WorthScoreGlyph } from "../WorthScoreGauge";
import { getPlatformBadgeStyle } from "../HackathonCard";
import { useCurrency } from "../../lib/currency";
import type { SortOption } from "../FiltersBar";

export type WatchlistRow = {
  id: string;
  title: string;
  platform: string;
  mode: "online" | "offline" | "hybrid" | string;
  prize_inr: number;
  deadline: string;
  tech_tags: string[];
  url: string;
  worth?: number;
  ev_inr?: number;
};

const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

const MODE_ICON: Record<string, React.ReactNode> = {
  online: <IconGlobe className="size-3 text-action" />,
  offline: <IconMapPin className="size-3 text-data" />,
  hybrid: <IconHybrid className="size-3 text-money" />,
};

/** Which column owns the active sort, and which way the caret points. */
const COLUMN_OF: Record<SortOption, "event" | "prize" | "deadline"> = {
  "title-asc": "event",
  "prize-desc": "prize",
  "deadline-asc": "deadline",
};

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: "event" | "prize" | "deadline";
  sort: SortOption;
  onSort: (next: SortOption) => void;
}) {
  const active = COLUMN_OF[sort] === column;
  const target: SortOption =
    column === "event" ? "title-asc" : column === "prize" ? "prize-desc" : "deadline-asc";

  return (
    <button
      type="button"
      onClick={() => onSort(target)}
      className={cn(
        "flex items-center gap-1 font-mono text-[10px] tracking-[0.07em] uppercase transition-colors",
        column !== "event" && "justify-end",
        column === "event" && "justify-start",
        active ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {active && <IconChevronDown className={cn("size-2.5 transition-transform", sort.endsWith("-desc") ? "" : "rotate-180")} />}
    </button>
  );
}

export function HackathonWatchlist({
  rows,
  sort,
  onSort,
  title,
  onTagClick,
  pins,
  onTogglePin,
  compareIds,
  onToggleCompare,
  compareRejected = false,
  onRowClick,
}: {
  rows: WatchlistRow[];
  sort: SortOption;
  onSort: (next: SortOption) => void;
  title?: string;
  onTagClick?: (tag: string) => void;
  /** ids currently pinned to the top ticker */
  pins?: string[];
  /** toggle pin status for a hackathon */
  onTogglePin?: (id: string) => void;
  /** ids currently staged for comparison — renders a checkbox on the row's rail */
  compareIds?: string[];
  /** toggle a row in/out of the compare set */
  onToggleCompare?: (id: string) => void;
  /** flashes when max compare limit reached */
  compareRejected?: boolean;
  /** trigger slide-over drawer */
  onRowClick?: (row: WatchlistRow) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(rows[0]?.id ?? null);
  const { format } = useCurrency();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <h3 className="text-[13px] font-semibold text-foreground">{title ?? "Watchlist"}</h3>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {rows.length} {rows.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* column header — mobile stacks instead, so hide it there */}
      <div
        className={cn(
          "hidden border-b border-border px-4 py-2 sm:grid sm:items-center sm:gap-3 sm:px-5",
          compareIds
            ? "sm:grid-cols-[20px_3px_minmax(0,1fr)_74px_124px_110px]"
            : "sm:grid-cols-[3px_minmax(0,1fr)_74px_124px_110px]",
        )}
      >
        {compareIds && (
          <span className="text-center font-mono text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
            ⇄
          </span>
        )}
        <span />
        <SortHeader label="Event" column="event" sort={sort} onSort={onSort} />
        <span className="text-right text-[10px] tracking-[0.07em] text-muted-foreground uppercase">
          Worth
        </span>
        <SortHeader label="Prize" column="prize" sort={sort} onSort={onSort} />
        <SortHeader label="Deadline" column="deadline" sort={sort} onSort={onSort} />
      </div>

      {rows.map((row) => {
        const selected = activeId === row.id;
        const pinned = pins?.includes(row.id) ?? false;
        const inCompare = compareIds?.includes(row.id) ?? false;
        const days = daysLeft(row.deadline);
        const urgent = days <= 3;
        const soon = days > 3 && days <= 7;
        const platform = getPlatformBadgeStyle(row.platform);

        return (
          <div
            key={row.id}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(row);
                  }
                : undefined
            }
            className={cn(
              "grid grid-cols-[3px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-foreground/[0.03] sm:gap-x-3 sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/60 focus-visible:ring-inset",
              compareIds
                ? "sm:grid-cols-[20px_3px_minmax(0,1fr)_74px_124px_110px]"
                : "sm:grid-cols-[3px_minmax(0,1fr)_74px_124px_110px]",
              onRowClick && "cursor-pointer select-none",
            )}
          >
            {/* compare checkbox */}
            {compareIds && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare?.(row.id);
                }}
                aria-pressed={inCompare}
                aria-label={inCompare ? `Remove ${row.title} from compare` : `Add ${row.title} to compare`}
                title={inCompare ? "Remove from compare" : "Compare this hackathon"}
                className={cn(
                  "hidden sm:flex size-[18px] items-center justify-center rounded-[4px] border font-mono transition-colors",
                  inCompare
                    ? "border-action bg-action text-action-foreground"
                    : "border-border bg-background text-transparent hover:border-action/50",
                  !inCompare && compareRejected && "border-deadline/70",
                )}
              >
                {inCompare ? <IconCheck className="size-3" /> : null}
              </button>
            )}

            {/* accent rail — the 21st pattern's selection marker */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(selected ? null : row.id);
              }}
              aria-pressed={selected}
              aria-label={selected ? "Collapse row" : "Select row"}
              className="flex self-stretch"
            >
              <span
                className={cn(
                  "w-[3px] shrink-0 rounded-full transition-colors",
                  selected ? "bg-action" : "bg-foreground/10 hover:bg-foreground/25",
                )}
              />
            </button>

            {/* event details */}
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-bold tracking-wider uppercase",
                    platform.bg,
                    platform.text,
                    platform.border,
                  )}
                >
                  {row.platform}
                </span>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="truncate text-[13px] font-semibold text-foreground no-underline hover:text-action hover:underline"
                >
                  {row.title}
                </a>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 capitalize">
                  {MODE_ICON[row.mode] ?? null}
                  {row.mode}
                </span>
                {row.tech_tags.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(t);
                    }}
                    className="rounded-sm border border-border bg-muted/60 px-1 py-px font-mono text-[9px] transition-colors hover:border-action/40 hover:text-action"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            {/* worth | prize | deadline — `sm:contents` hands the three cells to the outer grid */}
            <div className="col-start-2 flex items-center justify-between gap-3 sm:contents">
              <div className="flex justify-end sm:w-[74px]">
                {typeof row.worth === "number" ? (
                  <WorthScoreGlyph worth={row.worth} className="text-base" />
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground opacity-50">—</span>
                )}
              </div>

              <div className="text-right sm:w-[124px]">
                <span className="block font-mono text-[13px] font-bold tabular-nums text-money">
                  {format(row.prize_inr)}
                </span>
                {typeof row.ev_inr === "number" && (
                  <span className="block font-mono text-[9px] tabular-nums text-money/70">
                    EV {format(row.ev_inr)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center justify-end gap-1.5 text-[11px] font-semibold sm:w-[110px]",
                  urgent ? "text-deadline" : soon ? "text-money" : "text-muted-foreground",
                )}
              >
                {urgent ? <IconFlame className="size-3" /> : <IconDeadline className="size-3" />}
                <span className="font-mono tabular-nums">{days}d</span>

                {/* pin / unpin button */}
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(row.id);
                    }}
                    aria-pressed={pinned}
                    aria-label={pinned ? `Unpin ${row.title}` : `Pin ${row.title}`}
                    title={pinned ? "Unpin" : "Pin to ticker"}
                    className={cn(
                      "ml-1 flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors",
                      pinned
                        ? "text-action"
                        : "text-muted-foreground opacity-40 hover:text-action hover:opacity-100",
                    )}
                  >
                    {pinned ? <IconPin className="size-3" /> : <IconPinOff className="size-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
