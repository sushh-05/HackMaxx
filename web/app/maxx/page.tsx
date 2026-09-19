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
      <div className="pt-7 pb-2">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          One project. <span className="grad-text">Many hackathons.</span>
        </h2>
        <p className="mt-2.5 max-w-2xl text-base text-base-content/60">
          Tell us about your project — we rank every open hackathon by Worth Score and build a
          submission plan that maxxes your total expected value and win chances.
        </p>
      </div>

      <div className="card mt-5 bg-base-300 border border-base-content/10 shadow-xl">
        <div className="card-body gap-4 p-6">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Project title</legend>
            <input className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AI CP tutor agent" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Description (2–4 lines)</legend>
            <textarea className="textarea textarea-bordered w-full" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does it do, for whom, with what?" />
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Tech stack</legend>
              <input className="input input-bordered w-full" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Bedrock, Lambda, Next.js" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Domain tags</legend>
              <input className="input input-bordered w-full" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI agent, edtech" />
            </fieldset>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Repo URL (optional)</legend>
            <input className="input input-bordered w-full" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" />
          </fieldset>
          <div className="flex flex-wrap items-center gap-3.5">
            <button className="btn btn-primary btn-lg font-extrabold" onClick={go} disabled={!canSubmit}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "⚡"}
              {loading ? "Maxxing…" : "Maxx it"}
            </button>
            <span className="flex flex-wrap items-center gap-1.5 text-[13px] text-base-content/50">
              Try an example:
              {EXAMPLES.map((ex, i) => (
                <button key={ex.label} className="btn btn-ghost btn-xs rounded-full border-base-content/15" onClick={() => loadExample(i)}>
                  {ex.label}
                </button>
              ))}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mt-5">
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="mt-5 grid gap-3.5">
          <div className="skeleton h-44 w-full" />
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      )}

      <div ref={resultsRef}>
        {res && (
          <div className="mt-5 grid gap-3.5">
            <MaxxingStrategyPanel strategy={res.strategy} plan={res.plan} />
            <p className="text-[13px] text-base-content/50">
              All {res.recommendations.length} ranked matches — the plan above picks the best-ROI subset.
            </p>
            {res.recommendations.map((r) => <HackathonCard key={r.hackathon.id} r={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
