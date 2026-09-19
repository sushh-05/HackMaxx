"use client";
import { useRef, useState } from "react";
import type { RecommendResponse } from "@hackmaxx/shared";
import { recommend } from "../../lib/api";
import { HackathonCard } from "../../components/HackathonCard";
import { MaxxingStrategyPanel } from "../../components/MaxxingStrategyPanel";

function splitList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

const EXAMPLES = [
  {
    label: "AI CP tutor",
    title: "AI CP tutor agent (Bedrock + Lambda)",
    description: "AI agent that explains Codeforces problems and generates Kotlin/C++ scaffolding using Bedrock and serverless backend.",
    stack: "Bedrock, Lambda, Next.js",
    tags: "AI agent, edtech",
  },
  {
    label: "UPI fintech",
    title: "KiranaPay — UPI ledger for kirana stores",
    description: "Serverless UPI-first bookkeeping app for small shops: auto ledger, payment reminders, daily sales digest.",
    stack: "React, Lambda, DynamoDB",
    tags: "Fintech, SMB",
  },
  {
    label: "OSS devtool",
    title: "gitpulse — OSS contribution insights",
    description: "TypeScript CLI + dashboard that visualizes repo contribution health and review latency for maintainers.",
    stack: "TypeScript, Node, D3",
    tags: "Devtools, OpenSource",
  },
];

export default function MaxxPage() {
  const [title, setTitle] = useState(EXAMPLES[0].title);
  const [description, setDescription] = useState(EXAMPLES[0].description);
  const [stack, setStack] = useState(EXAMPLES[0].stack);
  const [tags, setTags] = useState(EXAMPLES[0].tags);
  const [repoUrl, setRepoUrl] = useState("");
  const [res, setRes] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function go() {
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const data = await recommend({
        title, description,
        tech_stack: splitList(stack),
        tags: splitList(tags),
        ...(repoUrl.trim() ? { repo_url: repoUrl.trim() } : {}),
      });
      setRes(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setError("Could not reach the backend — is `bun run dev:backend` running?");
    } finally { setLoading(false); }
  }

  function loadExample(i: number) {
    const ex = EXAMPLES[i];
    setTitle(ex.title); setDescription(ex.description); setStack(ex.stack); setTags(ex.tags);
  }

  const canSubmit = !loading && title.trim().length > 0 && description.trim().length > 0;

  return (
    <section>
      <div className="hero">
        <h2>One project. <span className="grad">Many hackathons.</span></h2>
        <p className="sub">
          Tell us about your project — we rank every open hackathon by Worth Score and build a
          submission plan that maxxes your total expected value and win chances.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Project title</label>
            <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AI CP tutor agent" />
          </div>
          <div className="field">
            <label htmlFor="desc">Description (2–4 lines)</label>
            <textarea id="desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does it do, for whom, with what?" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="stack">Tech stack</label>
              <input id="stack" className="input" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Bedrock, Lambda, Next.js" />
            </div>
            <div className="field">
              <label htmlFor="tags">Domain tags</label>
              <input id="tags" className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI agent, edtech" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="repo">Repo URL (optional)</label>
            <input id="repo" className="input" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button className="btn" onClick={go} disabled={!canSubmit}>
              {loading ? "Maxxing…" : "⚡ Maxx it"}
            </button>
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}>
              Try an example:{" "}
              {EXAMPLES.map((ex, i) => (
                <button key={ex.label} className="chip" style={{ marginLeft: 6, padding: "4px 10px" }} onClick={() => loadExample(i)}>
                  {ex.label}
                </button>
              ))}
            </span>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading && (
        <div className="grid">
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      )}

      <div ref={resultsRef}>
        {res && (
          <div className="grid">
            <MaxxingStrategyPanel strategy={res.strategy} plan={res.plan} />
            <p className="count-note" style={{ marginTop: 4 }}>
              All {res.recommendations.length} ranked matches — the plan above picks the best-ROI subset.
            </p>
            {res.recommendations.map((r) => <HackathonCard key={r.hackathon.id} r={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
