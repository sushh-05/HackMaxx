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
      <div className="hero">
        <h2>Upcoming hackathons, <span className="grad">worth-ranked</span></h2>
        <p className="sub">
          Live list of open hackathons. Find one that fits, then head to{" "}
          <a href="/maxx">Maxx My Project</a> to build a full submission plan.
        </p>
      </div>
      <FiltersBar q={q} setQ={setQ} mode={mode} setMode={setMode} />

      {err && <div className="error-box">{err}</div>}

      {loading && !err && (
        <div className="grid">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" />)}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="empty">
          No hackathons match “{q || mode}”. Try a broader filter — or refresh the list from the Maxx page.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <>
          <div className="grid">
            {items.map((h) => {
              const d = daysLeft(h.deadline);
              return (
                <article key={h.id} className="card">
                  <div className="card-head">
                    <h3 className="card-title">{h.title}</h3>
                    <span className={`badge ${d <= 7 ? "badge-deadline-soon" : "badge-low"}`}>⏳ {d}d left</span>
                  </div>
                  <div className="card-meta">
                    <span>{h.platform}</span><span className="dot">·</span>
                    <span>{h.mode}</span><span className="dot">·</span>
                    <span>₹{h.prize_inr.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="card-why">{h.description}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {h.tech_tags.map((t) => <span key={t} className="badge badge-tag">{t}</span>)}
                  </div>
                  <div className="card-footer">
                    <a href={h.url} target="_blank" rel="noreferrer">Open hackathon →</a>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="count-note">{items.length} hackathon{items.length === 1 ? "" : "s"} found</p>
        </>
      )}
    </section>
  );
}
