import type { MaxxingPlan } from "@hackmaxx/shared";

const EFFORT_NOTE = { Low: "minor tweaks", Medium: "moderate rework", High: "heavy rework" } as const;

export function MaxxingStrategyPanel({ strategy, plan }: { strategy: string; plan?: MaxxingPlan }) {
  return (
    <section className="card strategy-bg border border-base-content/15 shadow-xl">
      <div className="card-body p-6">
        <h2 className="card-title font-display flex items-center gap-2">🎯 Maxxing strategy</h2>
        <p className="text-[15px]">{strategy}</p>
        {plan && plan.steps.length > 0 && (
          <>
            <ol className="mt-4 grid list-none gap-2.5 p-0">
              {plan.steps.map((s, i) => (
                <li
                  key={s.hackathon_id}
                  className="card-in flex items-center gap-3 rounded-xl border border-base-content/10 bg-base-content/[0.03] px-3.5 py-3"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="step-num">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-bold">
                      <a href={s.url} target="_blank" rel="noreferrer" className="link link-primary no-underline hover:underline">{s.title}</a>
                    </div>
                    <div className="mt-0.5 text-xs text-base-content/60">
                      {s.days_left}d left · EV ₹{s.expected_value_inr.toLocaleString("en-IN")} ·{" "}
                      {s.effort} effort ({EFFORT_NOTE[s.effort]})
                    </div>
                  </div>
                  <span className="badge badge-primary badge-outline badge-sm">Worth {s.worth}</span>
                </li>
              ))}
            </ol>
            <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-base-content/20 pt-4 text-sm text-base-content/60">
              <span>Total expected value across the run</span>
              <strong className="font-display text-xl text-accent">₹{plan.total_expected_value_inr.toLocaleString("en-IN")}</strong>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
