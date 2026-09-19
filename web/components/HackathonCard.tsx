import type { Recommendation } from "@hackmaxx/shared";
import { WorthBar } from "./WorthScoreGauge";

const REUSE_BADGE = {
  High: "badge-success",
  Medium: "badge-warning",
  Low: "badge-ghost",
} as const;

export function HackathonCard({ r }: { r: Recommendation }) {
  const { hackathon: h, worth, why, reuse } = r;
  const days = Math.max(0, Math.ceil((new Date(h.deadline).getTime() - Date.now()) / 86400000));
  return (
    <article className="card card-in bg-base-300 border border-base-content/10 shadow-lg transition-transform duration-150 hover:-translate-y-0.5">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title font-display text-base">{h.title}</h3>
          <span className={`badge ${REUSE_BADGE[reuse]}`} title="How much of your project you can reuse as-is">
            {reuse === "High" ? "🟢" : reuse === "Medium" ? "🟡" : "⚪"} {reuse} reuse
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-base-content/60">
          <span>{h.platform}</span><span className="opacity-50">·</span>
          <span>{h.mode}</span><span className="opacity-50">·</span>
          <span className={days <= 7 ? "badge badge-error badge-sm" : undefined}>⏳ {days}d left</span>
          <span className="opacity-50">·</span>
          <span>₹{h.prize_inr.toLocaleString("en-IN")}</span>
        </div>
        <WorthBar worth={worth} />
        <div className="flex flex-wrap gap-1.5">
          {h.tech_tags.map((t) => <span key={t} className="badge badge-primary badge-outline badge-sm">{t}</span>)}
        </div>
        <p className="text-sm text-base-content/60">{why}</p>
        <div className="card-actions justify-end">
          <a href={h.url} target="_blank" rel="noreferrer" className="link link-primary text-sm font-semibold">Open hackathon →</a>
        </div>
      </div>
    </article>
  );
}
