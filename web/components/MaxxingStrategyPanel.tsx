import type { MaxxingPlan } from "@hackmaxx/shared";

const EFFORT_NOTE = { Low: "minor tweaks", Medium: "moderate rework", High: "heavy rework" } as const;

export function MaxxingStrategyPanel({ strategy, plan }: { strategy: string; plan?: MaxxingPlan }) {
  return (
    <section className="strategy">
      <h2>🎯 Maxxing strategy</h2>
      <p className="headline">{strategy}</p>
      {plan && plan.steps.length > 0 && (
        <>
          <ol className="plan-steps">
            {plan.steps.map((s, i) => (
              <li key={s.hackathon_id} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="plan-step-main">
                  <div className="t">
                    <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                  </div>
                  <div className="s">
                    {s.days_left}d left · EV ₹{s.expected_value_inr.toLocaleString("en-IN")} ·{" "}
                    {s.effort} effort ({EFFORT_NOTE[s.effort]})
                  </div>
                </div>
                <span className="badge badge-tag">Worth {s.worth}</span>
              </li>
            ))}
          </ol>
          <div className="plan-total">
            <span>Total expected value across the run</span>
            <strong>₹{plan.total_expected_value_inr.toLocaleString("en-IN")}</strong>
          </div>
        </>
      )}
    </section>
  );
}
