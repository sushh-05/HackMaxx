"use client";
import { useEffect, useState } from "react";
import type { Hackathon } from "@hackmaxx/shared";
import { fetchHackathons } from "../lib/api";
import { FiltersBar } from "../components/FiltersBar";

export default function ExplorePage() {
  const [items, setItems] = useState<Hackathon[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      fetchHackathons(q).then(setItems).catch(() => setErr("Backend not running? `bun run dev:backend`"));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section>
      <h2>Upcoming hackathons</h2>
      <FiltersBar q={q} setQ={setQ} />
      {err && <p>{err}</p>}
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((h) => (
          <article key={h.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <strong>{h.title}</strong> · {h.platform} · {h.mode}
            <div style={{ color: "#555" }}>{h.description}</div>
            <a href={h.url} target="_blank" rel="noreferrer">Open →</a>
          </article>
        ))}
      </div>
    </section>
  );
}
