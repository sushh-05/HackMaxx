import type { Recommendation } from "@hackmaxx/shared";

export function HackathonCard({ r }: { r: Recommendation }) {
  const { hackathon: h, worth, why, reuse } = r;
  const days = Math.max(0, Math.ceil((new Date(h.deadline).getTime() - Date.now()) / 86400000));
  return (
    <article style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{h.title}</h3>
        <span title="reuse potential">{reuse === "High" ? "🟢" : reuse === "Medium" ? "🟡" : "⚪"} {reuse}</span>
      </div>
      <p style={{ color: "#555" }}>{h.platform} · {h.mode} · ⏳ {days}d left · ₹{h.prize_inr.toLocaleString("en-IN")}</p>
      <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8 }}>
        <div style={{ width: `${worth}%`, height: 8, borderRadius: 8, background: "#111827" }} />
      </div>
      <p><strong>Worth {worth}</strong> · {h.tech_tags.join(", ")}</p>
      <p>{why}</p>
      <a href={h.url} target="_blank" rel="noreferrer">Open hackathon →</a>
    </article>
  );
}
