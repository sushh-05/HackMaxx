"use client";
import { useEffect, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../lib/api";
import { FiltersBar, type ModeFilter } from "../components/FiltersBar";

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export default function ExplorePage() {
  const [items, setItems] = useState<Hackathon[]>([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetchHackathons(q, mode)
        .then((data) => { if (!cancelled) { setItems(data); setErr(""); } })
        .catch(() => { if (!cancelled) setErr("Backend not reachable — start it with `bun run dev:backend`."); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, mode]);

  return (
    <section>
      <div className="pt-7 pb-2">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Upcoming hackathons, <span className="grad-text">worth-ranked</span>
        </h2>
        <p className="mt-2.5 max-w-2xl text-base text-base-content/60">
          Live list of open hackathons. Find one that fits, then head to{" "}
          <a href="/maxx" className="link link-primary">Maxx My Project</a> to build a full submission plan.
        </p>
      </div>
      <FiltersBar q={q} setQ={setQ} mode={mode} setMode={setMode} />

      {err && (
        <div role="alert" className="alert alert-error mt-5">
          <span>{err}</span>
        </div>
      )}

      {loading && !err && (
        <div className="mt-5 grid gap-3.5">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-32 w-full" />)}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="mt-5 rounded-box border border-dashed border-base-content/25 p-10 text-center text-base-content/60">
          No hackathons match “{q || mode}”. Try a broader filter — or refresh the list from the Maxx page.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <>
          <div className="mt-5 grid gap-3.5">
            {items.map((h) => {
              const d = daysLeft(h.deadline);
              return (
                <article key={h.id} className="card card-in bg-base-300 border border-base-content/10 shadow-lg transition-transform duration-150 hover:-translate-y-0.5">
                  <div className="card-body gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="card-title font-display text-base">{h.title}</h3>
                      <span className={`badge ${d <= 7 ? "badge-error" : "badge-ghost"}`}>⏳ {d}d left</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-base-content/60">
                      <span>{h.platform}</span><span className="opacity-50">·</span>
                      <span>{h.mode}</span><span className="opacity-50">·</span>
                      <span>₹{h.prize_inr.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-sm text-base-content/60">{h.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {h.tech_tags.map((t) => <span key={t} className="badge badge-primary badge-outline badge-sm">{t}</span>)}
                    </div>
                    <div className="card-actions justify-end">
                      <a href={h.url} target="_blank" rel="noreferrer" className="link link-primary text-sm font-semibold">Open hackathon →</a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3.5 text-[13px] text-base-content/50">{items.length} hackathon{items.length === 1 ? "" : "s"} found</p>
        </>
      )}
    </section>
  );
}
