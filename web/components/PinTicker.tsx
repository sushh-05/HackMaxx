"use client";

/**
 * PinTicker — slim sticky strip of pinned hackathons at the top of the
 * dashboard, below the Nav header.
 *
 * One row high, hairline dividers, mono tabular-nums numerics,
 * pulse-dot in the deadline colour when ≤3 days left (win otherwise) —
 * DESIGN.md > Motion: reuses the existing `pulse-dot` keyframes only.
 */
import { cn } from "cn";
import { IconPin, IconX } from "./Icons";
import { WorthScoreGlyph } from "./WorthScoreGauge";
import type { WatchlistRow } from "./ui/hackathon-watchlist";

const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

export function PinTicker({
  items,
  pins,
  onUnpin,
}: {
  /** full fetched items list — ticker resolves pinned ids against it */
  items: Pick<WatchlistRow, "id" | "title" | "url" | "deadline" | "worth">[];
  pins: string[];
  onUnpin: (id: string) => void;
}) {
  // Resolve pinned ids against the fetched list, preserving pin order.
  const pinned = pins
    .map((id) => items.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  if (pinned.length === 0) return null;

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-border bg-background/90 backdrop-blur-xl sm:-mx-6">
      <div className="flex items-stretch overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
        <span className="flex shrink-0 items-center gap-1.5 border-r border-border px-3 font-mono text-[9px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          <IconPin className="size-3 text-action" />
          Pinned
        </span>
        {pinned.map((h) => {
          const days = daysLeft(h.deadline);
          const urgent = days <= 3;
          return (
            <div
              key={h.id}
              className="group flex shrink-0 items-center gap-2 border-r border-border px-3 py-2 transition-colors hover:bg-foreground/[0.03]"
            >
              {/* pulse-dot: deadline colour ≤3d, win otherwise (DESIGN.md > Motion) */}
              <span
                className="pulse-dot"
                style={
                  urgent
                    ? {
                        backgroundColor: "var(--deadline)",
                        boxShadow: "0 0 10px var(--deadline)",
                      }
                    : undefined
                }
                aria-hidden="true"
              />
              <a
                href={h.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 no-underline"
                title={h.title}
              >
                <span className="max-w-44 truncate text-[11px] font-semibold text-foreground group-hover:text-action hover:underline">
                  {h.title}
                </span>
                {typeof h.worth === "number" && (
                  <WorthScoreGlyph worth={h.worth} className="text-[11px]" />
                )}
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    urgent ? "font-semibold text-deadline" : "text-muted-foreground",
                  )}
                >
                  {days}d
                </span>
              </a>
              <button
                type="button"
                onClick={() => onUnpin(h.id)}
                aria-label={`Unpin ${h.title}`}
                className="flex size-4 items-center justify-center rounded-sm text-muted-foreground opacity-40 transition-opacity hover:text-deadline hover:opacity-100 group-hover:opacity-70"
              >
                <IconX className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
