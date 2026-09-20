"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../lib/api";
import { useCurrency, type CurrencyCode } from "../lib/currency";
import { Kbd } from "./ui/kbd";
import {
  IconDashboard,
  IconZap,
  IconTimeline,
  IconPortfolio,
  IconScale,
  IconSun,
  IconMoon,
  IconMoney,
  IconSearch,
  IconWorth,
  IconGlobe,
} from "./Icons";

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ReactNode;
  run: () => void;
};

// Case-insensitive substring match with a prefix boost. Score < 0 = no match.
function scoreMatch(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx === -1) return -1;
  return idx === 0 ? 100 - t.length : 10 - idx;
}

const THEME_STORAGE_KEY = "hackmaxx-theme";

function readTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" || saved === "hackmaxx-light" ? "light" : "dark";
}

function applyTheme(theme: "dark" | "light") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// Cycles only the three display currencies exposed by the palette (per spec).
const CYCLE: CurrencyCode[] = ["INR", "USD", "EUR"];

function PaletteDialog({ onClose }: { onClose: () => void }): React.JSX.Element {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  useEffect(() => {
    let cancelled = false;
    fetchHackathons()
      .then((hs) => {
        if (!cancelled) setHackathons(hs);
      })
      .catch(() => {
        // Backend may be down during local review — the palette still works.
      })
      .finally(() => {
        if (!cancelled) setLoadingHackathons(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cycleCurrency = useCallback(() => {
    const idx = CYCLE.indexOf(currency);
    setCurrency(CYCLE[(idx + 1) % CYCLE.length]);
  }, [currency, setCurrency]);

  const actionItems: PaletteItem[] = useMemo(() => {
    const theme = readTheme();
    return [
      {
        id: "go-dashboard",
        label: "Go to Dashboard",
        hint: "/",
        keywords: "explore hackathons home dashboard",
        icon: <IconDashboard className="size-4" />,
        run: () => {
          close();
          router.push("/");
        },
      },
      {
        id: "go-maxx",
        label: "Go to Maxx My Project",
        hint: "/maxx",
        keywords: "maxxing plan recommend strategy submit",
        icon: <IconZap className="size-4" />,
        run: () => {
          close();
          router.push("/maxx");
        },
      },
      {
        id: "go-timeline",
        label: "Go to Timeline",
        hint: "/timeline",
        keywords: "deadline gantt schedule calendar time",
        icon: <IconTimeline className="size-4" />,
        run: () => {
          close();
          router.push("/timeline");
        },
      },
      {
        id: "go-portfolio",
        label: "Go to Portfolio",
        hint: "/portfolio",
        keywords: "positions saved projects tracker holdings",
        icon: <IconPortfolio className="size-4" />,
        run: () => {
          close();
          router.push("/portfolio");
        },
      },
      {
        id: "go-compare",
        label: "Go to Compare",
        hint: "/compare",
        keywords: "head to head comparison table diff vs",
        icon: <IconScale className="size-4" />,
        run: () => {
          close();
          router.push("/compare");
        },
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Toggle theme — switch to light" : "Toggle theme — switch to dark",
        keywords: "dark light mode appearance notebook",
        icon:
          theme === "dark" ? (
            <IconSun className="size-4" />
          ) : (
            <IconMoon className="size-4" />
          ),
        run: () => {
          applyTheme(readTheme() === "dark" ? "light" : "dark");
          close();
        },
      },
      {
        id: "cycle-currency",
        label: "Currency: cycle INR / USD / EUR",
        hint: currency,
        keywords: "money usd inr eur convert prize exchange",
        icon: <IconMoney className="size-4 text-money" />,
        run: () => {
          cycleCurrency();
          close();
        },
      },
    ];
  }, [router, close, currency, cycleCurrency]);

  const hackathonItems: PaletteItem[] = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return hackathons
      .map((h) => {
        const hay = `${h.title} ${h.platform} ${h.tech_tags.join(" ")}`;
        return { h, score: scoreMatch(q, hay) };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ h }) => ({
        id: `hack-${h.id}`,
        label: h.title,
        hint: h.platform,
        icon: <IconWorth className="size-4 text-action" />,
        run: () => {
          close();
          router.push(
            `/maxx?title=${encodeURIComponent(h.title)}&tags=${encodeURIComponent(
              h.tech_tags.join(", ")
            )}`
          );
        },
      }));
  }, [query, hackathons, router, close]);

  const visibleActions: PaletteItem[] = useMemo(() => {
    const q = query.trim();
    if (!q) return actionItems;
    return actionItems
      .map((it) => ({ it, score: scoreMatch(q, `${it.label} ${it.keywords ?? ""}`) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it);
  }, [query, actionItems]);

  const items = [...visibleActions, ...hackathonItems];

  useEffect(() => {
    setActive(0);
  }, [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (items.length ? (a + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[active]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  let rowIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/60 backdrop-blur-sm pt-[10vh] sm:pt-[18vh] px-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <IconSearch className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons or type a command…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-label="Command or hackathon search"
          />
          <Kbd>esc</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5" role="listbox" aria-activedescendant={items[active]?.id}>
          {visibleActions.length > 0 && (
            <>
              <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Commands
              </div>
              {visibleActions.map((it) => {
                rowIndex += 1;
                const idx = rowIndex;
                return (
                  <button
                    key={it.id}
                    id={it.id}
                    role="option"
                    aria-selected={idx === active}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => it.run()}
                    className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-left ${
                      idx === active ? "bg-accent text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="text-muted-foreground shrink-0">{it.icon}</span>
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.hint && (
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {it.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {hackathonItems.length > 0 && (
            <>
              <div className="px-2.5 pt-2 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Hackathons
              </div>
              {hackathonItems.map((it) => {
                rowIndex += 1;
                const idx = rowIndex;
                return (
                  <button
                    key={it.id}
                    id={it.id}
                    role="option"
                    aria-selected={idx === active}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => it.run()}
                    className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-left ${
                      idx === active ? "bg-accent text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="text-muted-foreground shrink-0">{it.icon}</span>
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.hint && (
                      <span className="font-mono text-xs tabular-nums text-muted-foreground flex items-center gap-1">
                        <IconGlobe className="size-3" />
                        {it.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {query.trim() && items.length === 0 && (
            <div className="px-3 py-6 text-sm text-center text-muted-foreground">
              No matches for “{query.trim()}”
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            close
          </span>
          {loadingHackathons && query.trim() && (
            <span className="ml-auto font-mono tabular-nums">loading hackathons…</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommandPalette(): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpenRequest() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("hackmaxx:open-palette", onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hackmaxx:open-palette", onOpenRequest);
    };
  }, []);

  if (!open) return null;
  return <PaletteDialog onClose={() => setOpen(false)} />;
}
