"use client";

/**
 * Head-to-head hackathon comparison — trade-desk table.
 *
 * Reads staged ids from localStorage (client-only, guarded) with ?ids=a,b,c
 * as the URL fallback, fetches the catalog via fetchHackathons, and renders
 * attribute rows against 2-3 hackathon columns. The best value per row is
 * highlighted in the win colour. Semantic Notebook tokens only.
 */
import React, { useEffect, useMemo, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../../../lib/api";
import { useCurrency } from "../../../lib/currency";
import { getPlatformBadgeStyle } from "../../../components/HackathonCard";
import { WorthScoreGlyph } from "../../../components/WorthScoreGauge";
import {
  IconGlobe,
  IconMapPin,
  IconHybrid,
  IconDeadline,
  IconFlame,
  IconTrophy,
  IconZap,
  IconScale,
  IconX,
} from "../../../components/Icons";
import { Button } from "../../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";

const COMPARE_KEY = "hackmaxx:compare:v1";

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

const MODE_ICON: Record<string, React.ReactNode> = {
  online: <IconGlobe className="size-3 text-action" />,
  offline: <IconMapPin className="size-3 text-data" />,
  hybrid: <IconHybrid className="size-3 text-money" />,
};

function Cell({
  best = false,
  className = "",
  children,
}: {
  best?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td
      className={
        "border-t border-border px-4 py-2.5 align-middle font-mono text-[12px] tabular-nums " +
        (best ? "text-win font-bold " : "text-foreground ") +
        className
      }
    >
      {children}
    </td>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="row"
      className="border-t border-border px-4 py-2.5 text-left align-middle font-mono text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase whitespace-nowrap"
    >
      {children}
    </th>
  );
}

export default function ComparePage(): React.JSX.Element {
  const [ids, setIds] = useState<string[]>([]);
  const { format } = useCurrency();
  const [items, setItems] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("ids");
      if (fromUrl) {
        setIds(fromUrl.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3));
        return;
      }
      const raw = window.localStorage.getItem(COMPARE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setIds(parsed.filter((x): x is string => typeof x === "string").slice(0, 3));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  function removeId(id: string) {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      try {
        window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    fetchHackathons()
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setErr("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErr("The hackathon index is unreachable right now — retry in a few seconds.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { cols, skipped } = useMemo(() => {
    const byId = new Map(items.map((h) => [h.id, h]));
    const found: Hackathon[] = [];
    const missing: string[] = [];
    ids.forEach((id) => {
      const h = byId.get(id);
      if (h) found.push(h);
      else missing.push(id);
    });
    return { cols: found, skipped: missing };
  }, [items, ids]);

  const ppdOf = (h: Hackathon): number => h.prize_inr / Math.max(1, daysLeft(h.deadline));

  const best = useMemo(() => {
    if (cols.length === 0) return { prize: -1, days: -1, ppd: -1, worth: -1 };
    const worths = cols.map((c) => (c as Hackathon & { worth?: number }).worth ?? -1);
    return {
      prize: Math.max(...cols.map((c) => c.prize_inr)),
      days: Math.max(...cols.map((c) => daysLeft(c.deadline))),
      ppd: Math.max(...cols.map(ppdOf)),
      worth: Math.max(...worths),
    };
  }, [cols]);

  const verdict = useMemo(() => {
    if (cols.length < 2) return "";
    const ranked = [...cols].sort((a, b) => ppdOf(b) - ppdOf(a));
    const top = ranked[0];
    const rest = ranked.slice(1);
    const ratios = rest.map((r) => (ppdOf(r) > 0 ? ppdOf(top) / ppdOf(r) : Infinity));
    const closest = Math.min(...ratios);
    if (!Number.isFinite(closest) || closest <= 1.05) return "";
    return (
      "Ship to " +
      top.title +
      " — " +
      closest.toFixed(1) +
      "x the prize/day of " +
      rest.map((r) => r.title).join(", ") +
      "."
    );
  }, [cols]);

  return (
    <section className="space-y-6 pt-6 sm:pt-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <IconScale className="size-3.5" />
            <span>Head-to-head</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Compare Hackathons
          </h1>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {cols.length > 0
              ? `${cols.length} events staged from the watchlist`
              : "Stage 2–3 hackathons from the dashboard watchlist to compare them here."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold self-start sm:self-auto">
          <a href="/dashboard">Back to dashboard</a>
        </Button>
      </div>

      {skipped.length > 0 && (
        <div className="rounded-xl border border-deadline/40 bg-deadline/10 px-4 py-2.5 font-mono text-xs text-deadline">
          Skipped unknown or stale ids: {skipped.join(", ")}
        </div>
      )}

      {err && (
        <Alert className="rounded-2xl border-destructive/30 bg-destructive/10 shadow-lg">
          <IconZap className="size-5 text-destructive" />
          <AlertTitle className="font-bold text-destructive">Backend connection issue</AlertTitle>
          <AlertDescription className="text-xs opacity-90">{err}</AlertDescription>
        </Alert>
      )}

      {loading && !err && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-5 w-40 rounded-full bg-muted animate-pulse" />
          <div className="mt-4 h-32 rounded-lg bg-muted/60 animate-pulse" />
        </div>
      )}

      {!loading && !err && cols.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-foreground">Nothing staged yet.</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Check the compare boxes on 2–3 watchlist rows on the dashboard, then press Compare.
          </p>
          <Button asChild size="sm" className="rounded-xl font-bold">
            <a href="/dashboard">Open dashboard</a>
          </Button>
        </div>
      )}

      {!loading && !err && cols.length > 0 && (
        <>
          {/* Mobile scroll hint */}
          {cols.length > 1 && (
            <div className="flex items-center justify-between sm:hidden px-1 text-[11px] font-mono text-muted-foreground">
              <span>← Swipe horizontally to compare columns →</span>
              <span className="tabular-nums">{cols.length} hackathons</span>
            </div>
          )}

          <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr>
                <th className="w-[132px] px-4 py-3 text-left align-bottom">
                  <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                    Attribute
                  </span>
                </th>
                {cols.map((c) => {
                  const platform = getPlatformBadgeStyle(c.platform);
                  return (
                    <th key={c.id} className="px-4 py-3 text-left align-bottom">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={
                              "inline-flex w-fit rounded-full border px-1.5 py-px text-[9px] font-bold tracking-wider uppercase " +
                              platform.bg +
                              " " +
                              platform.text +
                              " " +
                              platform.border
                            }
                          >
                            {c.platform}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeId(c.id)}
                            aria-label={`Remove ${c.title} from comparison`}
                            title="Remove from compare"
                            className="size-5 flex items-center justify-center rounded-md text-muted-foreground opacity-50 hover:text-deadline hover:opacity-100 hover:bg-deadline/10 transition-colors"
                          >
                            <IconX className="size-3" />
                          </button>
                        </div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] font-semibold leading-snug text-foreground no-underline hover:text-action hover:underline"
                        >
                          {c.title}
                        </a>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <RowLabel>Platform</RowLabel>
                {cols.map((c) => {
                  const platform = getPlatformBadgeStyle(c.platform);
                  return (
                    <Cell key={c.id}>
                      <span
                        className={
                          "inline-flex rounded-full border px-1.5 py-px text-[9px] font-bold tracking-wider " +
                          platform.bg +
                          " " +
                          platform.text +
                          " " +
                          platform.border
                        }
                      >
                        {c.platform}
                      </span>
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <RowLabel>Mode</RowLabel>
                {cols.map((c) => (
                  <Cell key={c.id} className="capitalize">
                    <span className="inline-flex items-center gap-1">
                      {MODE_ICON[c.mode] ?? null}
                      {c.mode}
                    </span>
                  </Cell>
                ))}
              </tr>
              <tr>
                <RowLabel>Deadline</RowLabel>
                {cols.map((c) => {
                  const d = daysLeft(c.deadline);
                  const urgent = d <= 3;
                  return (
                    <Cell key={c.id} best={d === best.days}>
                      <span className={"inline-flex items-center gap-1 " + (urgent ? "text-deadline" : "")}>
                        {urgent ? <IconFlame className="size-3" /> : <IconDeadline className="size-3" />}
                        {new Date(c.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="text-muted-foreground font-normal">({d}d left)</span>
                      </span>
                    </Cell>
                  );
                })}
              </tr>
              <tr>
                <RowLabel>Prize</RowLabel>
                {cols.map((c) => (
                  <Cell key={c.id} best={c.prize_inr === best.prize} className="text-money">
                    <span className="inline-flex items-center gap-1">
                      <IconTrophy className="size-3" />
                      {format(c.prize_inr)}
                    </span>
                  </Cell>
                ))}
              </tr>
              <tr>
                <RowLabel>Tech tags</RowLabel>
                {cols.map((c) => (
                  <Cell key={c.id}>
                    <span className="flex flex-wrap gap-1">
                      {c.tech_tags.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="rounded-sm border border-border bg-muted/60 px-1 py-px font-mono text-[9px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </span>
                  </Cell>
                ))}
              </tr>
              {cols.some((c) => typeof (c as Hackathon & { worth?: number }).worth === "number") && (
                <tr>
                  <RowLabel>Worth</RowLabel>
                  {cols.map((c) => {
                    const w = (c as Hackathon & { worth?: number }).worth;
                    return (
                      <Cell key={c.id} best={typeof w === "number" && w === best.worth}>
                        {typeof w === "number" ? (
                          <WorthScoreGlyph worth={w} className="text-[13px]" />
                        ) : (
                          <span className="text-muted-foreground opacity-50">—</span>
                        )}
                      </Cell>
                    );
                  })}
                </tr>
              )}
              <tr>
                <RowLabel>Prize / day</RowLabel>
                {cols.map((c) => (
                  <Cell key={c.id} best={ppdOf(c) === best.ppd} className="text-money">
                    {format(Math.round(ppdOf(c)))} /d
                  </Cell>
                ))}
              </tr>
              <tr>
                <RowLabel>Action</RowLabel>
                {cols.map((c) => (
                  <td key={c.id} className="border-t border-border px-4 py-3 align-middle">
                    <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5 rounded-xl border-action/40 text-action hover:bg-action/10 hover:text-action">
                      <a href={`/maxx?title=${encodeURIComponent(c.title)}&tags=${encodeURIComponent(c.tech_tags.join(", "))}`}>
                        <IconZap className="size-3.5" />
                        <span>Maxx this</span>
                      </a>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )}

      {verdict && (
        <p className="rounded-xl border border-win/40 bg-win/10 px-4 py-3 font-mono text-xs font-semibold tabular-nums text-win">
          {verdict}
        </p>
      )}
    </section>
  );
}
