"use client";
import { useEffect, useRef, useState } from "react";
import type { RecommendResponse } from "@hackmaxx/shared";
import { recommend } from "../../lib/api";
import { HackathonCard } from "../../components/HackathonCard";
import { MaxxingStrategyPanel } from "../../components/MaxxingStrategyPanel";
import {
  IconZap,
  IconSparkles,
  IconLayers,
  IconGithub,
  IconCode,
  IconTag,
  IconSliders,
  IconTrendingUp,
} from "../../components/Icons";

function splitList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

const EXAMPLES = [
  {
    label: "🤖 AI CP Tutor",
    title: "AI CP tutor agent (Bedrock + Lambda)",
    description:
      "AI agent that explains Codeforces and LeetCode problems, analyzes time complexity, and generates Kotlin/C++ scaffolding using AWS Bedrock and a serverless backend.",
    stack: "Bedrock, Lambda, Next.js, Python",
    tags: "AI agent, edtech, developer tools",
  },
  {
    label: "💳 KiranaPay UPI",
    title: "KiranaPay — UPI ledger for kirana stores",
    description:
      "Serverless UPI-first bookkeeping and invoice reconciliation app for small shops: auto ledger, WhatsApp payment reminders, and daily voice sales digest.",
    stack: "React, Lambda, DynamoDB, Node.js",
    tags: "Fintech, SMB, payments",
  },
  {
    label: "📊 gitpulse OSS",
    title: "gitpulse — OSS contribution insights",
    description:
      "TypeScript CLI + dashboard that visualizes repo contribution health, PR review bottlenecks, and bus factor risks for open source maintainers.",
    stack: "TypeScript, Node.js, Next.js, D3",
    tags: "Devtools, OpenSource, analytics",
  },
];

export default function MaxxPage() {
  const [selectedExample, setSelectedExample] = useState<number | null>(0);
  const [title, setTitle] = useState(EXAMPLES[0].title);
  const [description, setDescription] = useState(EXAMPLES[0].description);
  const [stack, setStack] = useState(EXAMPLES[0].stack);
  const [tags, setTags] = useState(EXAMPLES[0].tags);
  const [repoUrl, setRepoUrl] = useState("");
  const [reuseFilter, setReuseFilter] = useState<"all" | "High" | "Medium">("all");

  const [res, setRes] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check URL search params for prefilled hackathon context from Explore page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlTitle = sp.get("title");
      const urlTags = sp.get("tags");
      if (urlTitle) {
        setTitle(`Multi-hackathon edition for ${urlTitle}`);
        setSelectedExample(null);
      }
      if (urlTags) {
        setTags(urlTags);
        setStack(urlTags);
      }
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger Maxx
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (!loading && title.trim() && description.trim()) {
          go();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function go() {
    setLoading(true);
    setError(null);
    setRes(null);
    setLoadingStep(0);

    // Simulated progress steps for engaging Bedrock AI visualizer
    const timer1 = setTimeout(() => setLoadingStep(1), 600);
    const timer2 = setTimeout(() => setLoadingStep(2), 1400);

    try {
      const data = await recommend({
        title,
        description,
        tech_stack: splitList(stack),
        tags: splitList(tags),
        ...(repoUrl.trim() ? { repo_url: repoUrl.trim() } : {}),
      });
      setRes(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Could not reach the backend — ensure `bun run dev:backend` is running on port 3011.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
    }
  }

  function loadExample(i: number) {
    setSelectedExample(i);
    const ex = EXAMPLES[i];
    setTitle(ex.title);
    setDescription(ex.description);
    setStack(ex.stack);
    setTags(ex.tags);
  }

  function clearForm() {
    setSelectedExample(null);
    setTitle("");
    setDescription("");
    setStack("");
    setTags("");
    setRepoUrl("");
    setRes(null);
  }

  const canSubmit = !loading && title.trim().length > 0 && description.trim().length > 0;

  // Filter recommendations
  const filteredRecs = res
    ? res.recommendations.filter((r) => (reuseFilter === "all" ? true : r.reuse === reuseFilter))
    : [];

  return (
    <section className="space-y-8 pt-6 sm:pt-8">
      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <IconZap className="w-3.5 h-3.5" />
          <span>AI Portfolio Optimization</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          One project.{" "}
          <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl grad-text tracking-normal">
            Many hackathons.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-base-content/70 max-w-3xl leading-relaxed">
          Don&apos;t let your project die after a single weekend. Paste your project details below —
          AWS Bedrock Titan generates semantic embeddings, queries the hackathon vector space, and
          builds a high-ROI submission schedule ordered by deadline.
        </p>

        {/* 3-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-content/10">
            <span className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center flex-none">
              1
            </span>
            <div className="text-xs">
              <span className="font-bold text-base-content block">Describe Project</span>
              <span className="text-base-content/50">Idea, tech stack & domain</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-content/10">
            <span className="w-7 h-7 rounded-lg bg-secondary/20 text-secondary font-mono font-bold text-xs flex items-center justify-center flex-none">
              2
            </span>
            <div className="text-xs">
              <span className="font-bold text-base-content block">Bedrock Scoring</span>
              <span className="text-base-content/50">Titan cosine & Worth algorithm</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-content/10">
            <span className="w-7 h-7 rounded-lg bg-accent/20 text-accent font-mono font-bold text-xs flex items-center justify-center flex-none">
              3
            </span>
            <div className="text-xs">
              <span className="font-bold text-base-content block">Maxxed Plan</span>
              <span className="text-base-content/50">Deadline-ordered EV schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Project Input Card */}
      <div className="card-glass rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Preset Selector Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-content/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-base-content/50 mr-1 flex items-center gap-1">
              <IconSparkles className="w-3.5 h-3.5 text-primary" /> Load a sample project:
            </span>
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => loadExample(i)}
                className={`btn btn-xs rounded-xl px-3 py-1 font-semibold text-xs transition-all ${
                  selectedExample === i
                    ? "bg-primary text-primary-content border-primary shadow-sm"
                    : "btn-ghost border border-base-content/15 hover:border-primary/40 text-base-content/75"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={clearForm}
            className="text-xs text-base-content/40 hover:text-base-content transition-colors underline"
          >
            Clear to Blank
          </button>
        </div>

        {/* Input Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
              <IconCode className="w-3.5 h-3.5 text-primary" />
              <span>Project Title *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSelectedExample(null);
              }}
              placeholder="e.g. KiranaPay — UPI ledger for kirana stores"
              className="w-full rounded-2xl bg-base-100/90 border border-base-content/15 px-4 py-3 text-sm font-medium placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <IconSparkles className="w-3.5 h-3.5 text-secondary" />
                <span>Description & Architecture (2–4 lines) *</span>
              </label>
              <span className="text-[11px] text-base-content/40 font-mono">
                {description.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedExample(null);
              }}
              placeholder="What does your project do, who is it for, and how is it architected? (e.g. Serverless payment reconciler built with AWS Lambda, DynamoDB, Bedrock...)"
              className="w-full rounded-2xl bg-base-100/90 border border-base-content/15 p-4 text-sm font-medium placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-y"
            />
          </div>

          {/* Tech stack & Domain tags in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <IconLayers className="w-3.5 h-3.5 text-primary" />
                <span>Tech Stack (comma-separated)</span>
              </label>
              <input
                type="text"
                value={stack}
                onChange={(e) => {
                  setStack(e.target.value);
                  setSelectedExample(null);
                }}
                placeholder="Bedrock, Lambda, DynamoDB, Next.js"
                className="w-full rounded-2xl bg-base-100/90 border border-base-content/15 px-4 py-2.5 text-sm font-medium placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <IconTag className="w-3.5 h-3.5 text-secondary" />
                <span>Domain Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setSelectedExample(null);
                }}
                placeholder="AI agent, fintech, edtech, devtools"
                className="w-full rounded-2xl bg-base-100/90 border border-base-content/15 px-4 py-2.5 text-sm font-medium placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* GitHub Repo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
              <IconGithub className="w-3.5 h-3.5 text-base-content/70" />
              <span>GitHub Repo URL (optional)</span>
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full rounded-2xl bg-base-100/90 border border-base-content/15 px-4 py-2.5 text-sm font-medium placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-base-content/10">
          <div className="text-xs text-base-content/50 flex items-center gap-2">
            <span className="hidden sm:inline-block">Shortcut:</span>
            <kbd className="kbd kbd-sm rounded-lg bg-base-200 text-[10px] font-mono">
              ⌘ / Ctrl + Enter
            </kbd>
            <span>to trigger Maxx</span>
          </div>

          <button
            type="button"
            onClick={go}
            disabled={!canSubmit}
            className={`btn btn-primary btn-lg rounded-2xl font-extrabold px-8 shadow-xl shadow-primary/25 transition-all duration-300 gap-2.5 w-full sm:w-auto ${
              canSubmit ? "hover:scale-[1.02] active:scale-[0.98]" : "opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                <span>Maxxing with Bedrock…</span>
              </>
            ) : (
              <>
                <IconZap className="w-5 h-5 text-white" />
                <span>Maxx My Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div role="alert" className="alert alert-error rounded-2xl border border-error/30 shadow-lg">
          <IconZap className="w-5 h-5 text-white" />
          <div>
            <h4 className="font-bold">Recommendation Error</h4>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Dynamic Bedrock AI Loading State */}
      {loading && (
        <div className="card-glass rounded-3xl p-8 space-y-6 text-center animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <IconSparkles className="w-7 h-7 animate-spin" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-extrabold text-xl">
              {loadingStep === 0 && "Analyzing Project Architecture…"}
              {loadingStep === 1 && "Generating Titan Embeddings & Vector Search…"}
              {loadingStep >= 2 && "Synthesizing Expected Value Schedule with Claude…"}
            </h3>
            <p className="text-xs text-base-content/60">
              Evaluating skill match, learning value, platform reputation, and prize expected value.
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto h-2 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 rounded-full"
              style={{ width: `${(loadingStep + 1) * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Section */}
      <div ref={resultsRef} className="space-y-6">
        {res && (
          <>
            {/* Maxxing Strategy & Submission Pipeline */}
            <MaxxingStrategyPanel strategy={res.strategy} plan={res.plan} />

            {/* Recommendations List Header with Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-base-content/10">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-base-content flex items-center gap-2">
                  <IconTrendingUp className="w-5 h-5 text-primary" />
                  <span>All Ranked Hackathon Matches</span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Ranked by Bedrock Worth Score — the execution plan above picked the highest-ROI subset.
                </p>
              </div>

              {/* Reuse Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-base-200/80 rounded-xl border border-base-content/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setReuseFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reuseFilter === "all"
                      ? "bg-primary text-primary-content shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  All ({res.recommendations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReuseFilter("High")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reuseFilter === "High"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  High Reuse Only
                </button>
                <button
                  type="button"
                  onClick={() => setReuseFilter("Medium")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reuseFilter === "Medium"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  Medium Reuse
                </button>
              </div>
            </div>

            {/* Recommendations Cards Grid */}
            <div className="grid gap-4">
              {filteredRecs.map((r) => (
                <HackathonCard key={r.hackathon.id} r={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
