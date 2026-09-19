import type { Recommendation } from "@hackmaxx/shared";
import { WorthBar } from "./WorthScoreGauge";

const REUSE_CLASS = { High: "badge-high", Medium: "badge-med", Low: "badge-low" } as const;

export function HackathonCard({ r }: { r: Recommendation }) {
  const { hackathon: h, worth, why, reuse } = r;
  const days = Math.max(0, Math.ceil((new Date(h.deadline).getTime() - Date.now()) / 86400000));
  return (
    <article className="card">
      <div className="card-head">
        <h3 className="card-title">{h.title}</h3>
        <span className={`badge ${REUSE_CLASS[reuse]}`} title="How much of your project you can reuse as-is">
          {reuse === "High" ? "🟢" : reuse === "Medium" ? "🟡" : "⚪"} {reuse} reuse
        </span>
      </div>
      <div className="card-meta">
        <span>{h.platform}</span><span className="dot">·</span>
        <span>{h.mode}</span><span className="dot">·</span>
        <span className={days <= 7 ? "badge badge-deadline-soon" : undefined}>⏳ {days}d left</span><span className="dot">·</span>
        <span>₹{h.prize_inr.toLocaleString("en-IN")}</span>
      </div>
      <WorthBar worth={worth} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {h.tech_tags.map((t) => <span key={t} className="badge badge-tag">{t}</span>)}
      </div>
      <p className="card-why">{why}</p>
      <div className="card-footer">
        <a href={h.url} target="_blank" rel="noreferrer">Open hackathon →</a>
      </div>
    </article>
  );
}
