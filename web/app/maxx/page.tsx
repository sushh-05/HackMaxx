"use client";
import { useState } from "react";
import type { RecommendResponse } from "@hackmaxx/shared";
import { recommend } from "../../lib/api";
import { HackathonCard } from "../../components/HackathonCard";
import { MaxxingStrategyPanel } from "../../components/MaxxingStrategyPanel";

function splitList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export default function MaxxPage() {
  const [title, setTitle] = useState("AI CP tutor agent (Bedrock + Lambda)");
  const [description, setDescription] = useState("AI agent that explains Codeforces problems and generates Kotlin/C++ scaffolding using Bedrock and serverless backend.");
  const [stack, setStack] = useState("Bedrock, Lambda, Next.js");
  const [tags, setTags] = useState("AI agent, edtech");
  const [repoUrl, setRepoUrl] = useState("");
  const [res, setRes] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      setRes(await recommend({
        title, description,
        tech_stack: splitList(stack),
        tags: splitList(tags),
        ...(repoUrl.trim() ? { repo_url: repoUrl.trim() } : {}),
      }));
    } catch {
      setError("Could not reach the backend — is `bun run dev:backend` running?");
      setRes(null);
    } finally { setLoading(false); }
  }

  return (
    <section>
      <h2>Maxx My Project</h2>
      <p style={{ color: "#555", marginTop: -8 }}>
        One project, many hackathons. We rank every open event by Worth Score and build a submission plan that maxxes total expected value.
      </p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="2-4 line description" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <input value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Tech stack (comma-separated)" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Domain tags (comma-separated)" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="Repo URL (optional)" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
      <button onClick={go} disabled={loading || !title.trim() || !description.trim()} style={{ padding: "10px 16px" }}>{loading ? "Maxxing…" : "Maxx it"}</button>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {res && (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <MaxxingStrategyPanel strategy={res.strategy} plan={res.plan} />
          {res.recommendations.map((r) => <HackathonCard key={r.hackathon.id} r={r} />)}
        </div>
      )}
    </section>
  );
}
