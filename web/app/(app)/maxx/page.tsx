"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Hackathon, RecommendResponse } from "@hackmaxx/shared";
import { recommend, fetchHackathons } from "../../../lib/api";
import { HackathonCard } from "../../../components/HackathonCard";
import { MaxxingStrategyPanel } from "../../../components/MaxxingStrategyPanel";
import {
  IconZap,
  IconSparkles,
  IconLayers,
  IconGithub,
  IconCode,
  IconTag,
  IconTrendingUp,
  IconSave,
  IconCheck,
} from "../../../components/Icons";
import { Button } from "../../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";
import { Kbd } from "../../../components/ui/kbd";
import { Spinner } from "../../../components/ui/spinner";
import { saveProject, getProjectByTitle } from "../../../lib/portfolio";

function splitList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function quickFillFrom(h: Hackathon): { title: string; description: string; stack: string; tags: string } {
  const tags = h.tech_tags.join(", ");
  return {
    title: `Multi-hackathon edition for ${h.title}`,
    description: h.description,
    stack: tags,
    tags,
  };
}

export default function MaxxPage(): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("");
  const [tags, setTags] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presets, setPresets] = useState<Hackathon[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState("");
  const [reuseFilter, setReuseFilter] = useState<"all" | "High" | "Medium">("all");

  const [res, setRes] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedState, setSavedState] = useState<"idle" | "saved" | "updated">("idle");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check URL search params for prefilled context — Explore rows pass
  // title/tags; /portfolio rows additionally pass description/stack.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlTitle = sp.get("title");
      const urlTags = sp.get("tags");
      const urlDescription = sp.get("description");
      const urlStack = sp.get("stack");
      if (urlTitle) {
        setTitle(urlDescription ? urlTitle : `Multi-hackathon edition for ${urlTitle}`);
        setSelectedPreset(null);
      }
      if (urlDescription) {
        setDescription(urlDescription);
        setSelectedPreset(null);
      }
      if (urlStack) {
        setStack(urlStack);
        setSelectedPreset(null);
      }
      if (urlTags) {
        setTags(urlTags);
        if (!urlStack) setStack(urlTags);
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
    setSavedState("idle");
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
      setSavedState("idle");
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

  // Quick-fill presets come from the live hackathon index, not hardcoded samples:
  // each chip pre-fills the form from a real open event's tags/description.
  useEffect(() => {
    let cancelled = false;
    fetchHackathons()
      .then((data) => {
        if (!cancelled) {
          const upcoming = [...data.items]
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 3);
          setPresets(upcoming);
        }
      })
      .catch(() => {
        /* presets stay empty — the form works without them */
      })
      .finally(() => {
        if (!cancelled) setPresetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function loadPreset(h: Hackathon) {
    setSelectedPreset(h.id);
    const fill = quickFillFrom(h);
    setTitle(fill.title);
    setDescription(fill.description);
    setStack(fill.stack);
    setTags(fill.tags);
  }

  function clearForm() {
    setSelectedPreset(null);
    setTitle("");
    setDescription("");
    setStack("");
    setTags("");
    setRepoUrl("");
    setRes(null);
  }

  const canSubmit = !loading && title.trim().length > 0 && description.trim().length > 0;

  // Persist this project + current result snapshot as an open position.
  function saveToPortfolio() {
    if (!res) return;
    const existed = getProjectByTitle(title) !== null;
    saveProject({
      title,
      description,
      stack: splitList(stack),
      tags: splitList(tags),
      ...(repoUrl.trim() ? { repoUrl: repoUrl.trim() } : {}),
      snapshot: {
        timestamp: Date.now(),
        totalEV: res.plan.total_expected_value_inr,
        planLength: res.plan.steps.length,
        topWorth: res.recommendations.reduce((m, r) => Math.max(m, r.worth), 0),
      },
    });
    setSavedState(existed ? "updated" : "saved");
  }

  // Filter recommendations
  const filteredRecs = res
    ? res.recommendations.filter((r) => (reuseFilter === "all" ? true : r.reuse === reuseFilter))
    : [];

  return (
    <section className="space-y-8 pt-6 sm:pt-8">
      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <IconZap className="size-3.5" />
          <span>AI Portfolio Optimization</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          One project.{" "}
          <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl grad-text tracking-normal">
            Many hackathons.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Don&apos;t let your project die after a single weekend. Paste your project details below —
          AWS Bedrock Titan generates semantic embeddings, queries the hackathon vector space, and
          builds a high-ROI submission schedule ordered by deadline.
        </p>

        {/* 3-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border">
            <span className="size-7 rounded-lg bg-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center flex-none">
              1
            </span>
            <div className="text-xs">
              <span className="font-bold text-foreground block">Describe Project</span>
              <span className="text-muted-foreground">Idea, tech stack & domain</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border">
            <span className="size-7 rounded-lg bg-data/20 text-data font-mono font-bold text-xs flex items-center justify-center flex-none">
              2
            </span>
            <div className="text-xs">
              <span className="font-bold text-foreground block">Bedrock Scoring</span>
              <span className="text-muted-foreground">Titan cosine & Worth algorithm</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border">
            <span className="size-7 rounded-lg bg-money/20 text-money font-mono font-bold text-xs flex items-center justify-center flex-none">
              3
            </span>
            <div className="text-xs">
              <span className="font-bold text-foreground block">Maxxed Plan</span>
              <span className="text-muted-foreground">Deadline-ordered EV schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Project Input Card */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-8 space-y-6 relative overflow-hidden shadow-sm">
        {/* Quick-fill presets — real open events from the live index */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <IconSparkles className="size-3.5 text-primary" /> Start from an open event:
            </span>
            {presetsLoading &&
              [0, 1, 2].map((i) => (
                <span key={i} className="h-6 w-24 rounded-xl bg-muted animate-pulse" aria-hidden="true" />
              ))}
            {!presetsLoading && presets.length === 0 && (
              <span className="text-[11px] text-muted-foreground">
                No open events in the index — describe your project below instead.
              </span>
            )}
            {!presetsLoading &&
              presets.map((h) => (
                <Button
                  key={h.id}
                  type="button"
                  variant={selectedPreset === h.id ? "default" : "ghost"}
                  size="xs"
                  onClick={() => loadPreset(h)}
                  aria-pressed={selectedPreset === h.id}
                  className={`rounded-xl px-2.5 sm:px-3 py-1 font-semibold text-xs transition-all ${
                    selectedPreset === h.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {h.title}
                </Button>
              ))}
          </div>

          <button
            type="button"
            onClick={clearForm}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Clear to Blank
          </button>
        </div>

        {/* Input Form Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconCode className="size-3.5 text-primary" />
              <span>Project Title *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSelectedPreset(null);
              }}
              placeholder="e.g. KiranaPay — UPI ledger for kirana stores"
              className="w-full rounded-xl sm:rounded-2xl bg-card border border-input px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconSparkles className="size-3.5 text-data" />
                <span>Description & Architecture (2–4 lines) *</span>
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {description.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedPreset(null);
              }}
              placeholder="What does your project do, who is it for, and how is it architected? (e.g. Serverless payment reconciler built with AWS Lambda, DynamoDB, Bedrock...)"
              className="w-full rounded-xl sm:rounded-2xl bg-card border border-input p-3.5 sm:p-4 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-all duration-200 resize-y"
            />
          </div>

          {/* Tech stack & Domain tags in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconLayers className="size-3.5 text-primary" />
                <span>Tech Stack (comma-separated)</span>
              </label>
              <input
                type="text"
                value={stack}
                onChange={(e) => {
                  setStack(e.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="Bedrock, Lambda, DynamoDB, Next.js"
                className="w-full rounded-xl sm:rounded-2xl bg-card border border-input px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconTag className="size-3.5 text-data" />
                <span>Domain Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="AI agent, fintech, edtech, devtools"
                className="w-full rounded-xl sm:rounded-2xl bg-card border border-input px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-all duration-200"
              />
            </div>
          </div>

          {/* GitHub Repo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconGithub className="size-3.5 text-muted-foreground" />
              <span>GitHub Repo URL (optional)</span>
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full rounded-xl sm:rounded-2xl bg-card border border-input px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
            <span className="hidden sm:inline-block">Shortcut:</span>
            <Kbd className="rounded-md bg-muted text-[10px] font-mono">
              ⌘ / Ctrl + Enter
            </Kbd>
            <span>to trigger Maxx</span>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={go}
            disabled={!canSubmit}
            className={`rounded-2xl font-extrabold px-8 shadow-xl shadow-primary/25 transition-all duration-300 gap-2.5 w-full sm:w-auto ${
              canSubmit ? "hover:scale-[1.02] active:scale-[0.98]" : "opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Spinner />
                <span>Maxxing with Bedrock…</span>
              </>
            ) : (
              <>
                <IconZap className="size-5 text-primary-foreground" />
                <span>Maxx My Project</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="rounded-2xl border border-destructive/40 shadow-lg bg-destructive/10 text-destructive">
          <IconZap className="size-5" />
          <AlertTitle className="font-bold">Recommendation Error</AlertTitle>
          <AlertDescription className="text-xs opacity-90">{error}</AlertDescription>
        </Alert>
      )}

      {/* Dynamic Bedrock AI Loading State */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 text-center motion-reduce:animate-none animate-pulse shadow-sm"
        >
          <div className="size-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <IconSparkles className="size-7 animate-spin motion-reduce:animate-none" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-extrabold text-xl">
              {loadingStep === 0 && "Analyzing Project Architecture…"}
              {loadingStep === 1 && "Generating Titan Embeddings & Vector Search…"}
              {loadingStep >= 2 && "Synthesizing Expected Value Schedule with Claude…"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Evaluating skill match, learning value, platform reputation, and prize expected value.
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={loadingStep + 1}
            aria-label="Analysis progress"
            className="w-full max-w-sm mx-auto h-2 bg-muted rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-primary via-data to-money transition-all duration-500 rounded-full motion-reduce:transition-none"
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
            <MaxxingStrategyPanel strategy={res.strategy} plan={res.plan} projectTitle={title} />

            {/* Recommendations List Header with Filter Tabs & Save to Portfolio */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <IconTrendingUp className="size-5 text-primary" />
                  <span>All Ranked Hackathon Matches</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ranked by Bedrock Worth Score — the execution plan above picked the highest-ROI subset.
                </p>
              </div>

              {/* Save-to-portfolio + Reuse Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={saveToPortfolio}
                  disabled={savedState !== "idle"}
                  className="gap-1.5 rounded-xl border border-money/40 text-money hover:bg-money/10 hover:text-money disabled:opacity-100 font-semibold"
                >
                  {savedState === "idle" ? (
                    <>
                      <IconSave className="size-3.5" />
                      <span>Save to portfolio</span>
                    </>
                  ) : (
                    <>
                      <IconCheck className="size-3.5 text-win" />
                      <span>{savedState === "updated" ? "Position updated" : "Position saved"}</span>
                    </>
                  )}
                </Button>

                <div role="group" aria-label="Filter by reuse level" className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setReuseFilter("all")}
                    aria-pressed={reuseFilter === "all"}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      reuseFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({res.recommendations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReuseFilter("High")}
                    aria-pressed={reuseFilter === "High"}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      reuseFilter === "High"
                        ? "bg-win text-win-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    High Reuse Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setReuseFilter("Medium")}
                    aria-pressed={reuseFilter === "Medium"}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      reuseFilter === "Medium"
                        ? "bg-money text-money-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Medium Reuse
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Cards Grid */}
            <p className="sr-only" role="status">
              {filteredRecs.length} of {res.recommendations.length} matches shown
            </p>
            <div className="grid gap-4">
              {filteredRecs.map((r) => (
                <HackathonCard key={r.hackathon.id} r={r} />
              ))}
            </div>
            {filteredRecs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-2">
                <p className="font-display font-bold text-foreground">No {reuseFilter} reuse matches</p>
                <p className="text-xs text-muted-foreground">
                  The engine found no {reuseFilter.toLowerCase()}-reuse events for this project — widen the filter.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReuseFilter("all")}
                  className="rounded-xl font-semibold"
                >
                  Show all {res.recommendations.length}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
