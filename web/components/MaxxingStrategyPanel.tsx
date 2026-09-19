import type { MaxxingPlan } from "@hackmaxx/shared";

export function MaxxingStrategyPanel({ strategy, plan }: { strategy: string; plan?: MaxxingPlan }) {
  return (
    <section style={{ background: "#111827", color: "white", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Maxxing strategy</h2>
      <p>{strategy}</p>
      {plan && plan.steps.length > 0 && (
        <>
          <ol style={{ paddingLeft: 20, margin: "12px 0" }}>
            {plan.steps.map((s) => (
              <li key={s.hackathon_id} style={{ marginBottom: 6 }}>
                <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>{s.title}</a>{" "}
                — <strong>{s.days_left}d left</strong> · EV ₹{s.expected_value_inr.toLocaleString("en-IN")} · {s.effort} effort
              </li>
            ))}
          </ol>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Total expected value: <strong>₹{plan.total_expected_value_inr.toLocaleString("en-IN")}</strong>
          </p>
        </>
      )}
    </section>
  );
}
