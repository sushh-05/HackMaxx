"use client";
import { useState } from "react";
import type { RecommendResponse } from "@hackmaxx/shared";
import { recommend } from "../../lib/api";
import { HackathonCard } from "../../components/HackathonCard";
import { MaxxingStrategyPanel } from "../../components/MaxxingStrategyPanel";

export default function MaxxPage() {
  const [title, setTitle] = useState("AI CP tutor agent (Bedrock + Lambda)");
  const [description, setDescription] = useState("AI agent that explains Codeforces problems and generates Kotlin/C++ scaffolding using Bedrock and serverless backend.");
  const [stack, setStack] = useState("Bedrock, Lambda, Next.js");
  const [res, setRes] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      setRes(await recommend({
        title, description,
        tech_stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
        tags: ["AI agent", "edtech"],
      }));
    } finally { setLoading(false); }
  }

  return (
    <section>
      <h2>Maxx My Project</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <input value={stack} onChange={(e) => setStack(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <button onClick={go} disabled={loading} style={{ padding: "10px 16px" }}>{loading ? "Maxxing…" : "Find hackathons"}</button>
      {res && (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <MaxxingStrategyPanel strategy={res.strategy} />
          {res.recommendations.map((r) => <HackathonCard key={r.hackathon.id} r={r} />)}
        </div>
      )}
    </section>
  );
}
