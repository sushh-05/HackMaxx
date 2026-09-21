"use client";

import React, { useState, useEffect } from "react";
import {
  getUserPreferences,
  saveUserPreferences,
  resetUserPreferences,
  POPULAR_SKILLS,
  POPULAR_INTERESTS,
  type UserPreferences,
  type ExperienceLevel,
  type HackathonFormat,
  type TargetGoal,
} from "../../../lib/preferences";
import {
  IconSettings,
  IconUser,
  IconCode,
  IconTarget,
  IconZap,
  IconSparkles,
  IconCheck,
  IconReset,
  IconGlobe,
  IconTerminal,
  IconTag,
  IconMoney,
} from "../../../components/Icons";
import { Button } from "../../../components/ui/button";

const ROLE_OPTIONS = [
  "Fullstack & AI Agent Builder",
  "Solo Hackathon Farmer",
  "Frontend & UI/UX Specialist",
  "AI / ML Systems Engineer",
  "Smart Contract & Web3 Hacker",
  "Backend & Distributed Systems Dev",
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: "beginner", label: "Beginner", desc: "First-time hacker seeking high-learning, beginner-friendly events" },
  { id: "intermediate", label: "Intermediate", desc: "Built projects before; looking for solid prizes & resume boosts" },
  { id: "advanced", label: "Advanced", desc: "Competitive builder targeting top-3 placements and high EV" },
  { id: "pro", label: "Veteran Farmer", desc: "Maximizing portfolio ROI across multiple concurrent submissions" },
];

const FORMAT_OPTIONS: { id: HackathonFormat; label: string; desc: string }[] = [
  { id: "online", label: "Online / Virtual", desc: "Global asynchronous or remote submissions" },
  { id: "hybrid", label: "Hybrid", desc: "Flexible remote participation with optional demo day" },
  { id: "offline", label: "In-Person / IRL", desc: "Physical on-site weekend hackathons" },
];

const GOAL_OPTIONS: { id: TargetGoal; label: string; desc: string }[] = [
  { id: "ev", label: "EV Maximization", desc: "Optimize expected value: prize × P(win)" },
  { id: "prize", label: "Large Cash Bounties", desc: "Filter for high total purse events ($10k+)" },
  { id: "portfolio", label: "Portfolio Stock", desc: "Create reusable code assets for multiple demos" },
  { id: "learning", label: "Trial New Tech", desc: "Explore emerging agentic stacks or SDKs" },
  { id: "networking", label: "Recruiting & Talent", desc: "Connect with sponsor founders and judges" },
];

const PLATFORM_OPTIONS = ["devpost", "devfolio", "unstop", "ethglobal", "dorahacks"];

export default function SettingsPage(): React.JSX.Element {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    setPrefs(getUserPreferences());
  }, []);

  function handleSave() {
    saveUserPreferences(prefs);
    setSavedMessage("Preferences saved & synchronized with HackMaxx Copilot.");
    setTimeout(() => setSavedMessage(null), 3500);
  }

  function handleReset() {
    if (confirm("Reset all developer preferences to default values?")) {
      const def = resetUserPreferences();
      setPrefs(def);
      setSavedMessage("Preferences reset to defaults.");
      setTimeout(() => setSavedMessage(null), 3000);
    }
  }

  function toggleSkill(skill: string) {
    const has = prefs.skills.includes(skill);
    const updated = has
      ? prefs.skills.filter((s) => s !== skill)
      : [...prefs.skills, skill];
    const next = { ...prefs, skills: updated };
    setPrefs(next);
    saveUserPreferences(next);
  }

  function addCustomSkill(e: React.FormEvent) {
    e.preventDefault();
    const clean = customSkill.trim();
    if (!clean || prefs.skills.includes(clean)) return;
    const next = { ...prefs, skills: [...prefs.skills, clean] };
    setPrefs(next);
    saveUserPreferences(next);
    setCustomSkill("");
  }

  function toggleInterest(interest: string) {
    const has = prefs.interests.includes(interest);
    const updated = has
      ? prefs.interests.filter((i) => i !== interest)
      : [...prefs.interests, interest];
    const next = { ...prefs, interests: updated };
    setPrefs(next);
    saveUserPreferences(next);
  }

  function toggleFormat(format: HackathonFormat) {
    const has = prefs.preferredFormats.includes(format);
    if (has && prefs.preferredFormats.length === 1) return; // keep at least 1
    const updated = has
      ? prefs.preferredFormats.filter((f) => f !== format)
      : [...prefs.preferredFormats, format];
    const next = { ...prefs, preferredFormats: updated };
    setPrefs(next);
    saveUserPreferences(next);
  }

  function toggleGoal(goal: TargetGoal) {
    const has = prefs.targetGoals.includes(goal);
    if (has && prefs.targetGoals.length === 1) return;
    const updated = has
      ? prefs.targetGoals.filter((g) => g !== goal)
      : [...prefs.targetGoals, goal];
    const next = { ...prefs, targetGoals: updated };
    setPrefs(next);
    saveUserPreferences(next);
  }

  function togglePlatform(platform: string) {
    const has = prefs.preferredPlatforms.includes(platform);
    if (has && prefs.preferredPlatforms.length === 1) return;
    const updated = has
      ? prefs.preferredPlatforms.filter((p) => p !== platform)
      : [...prefs.preferredPlatforms, platform];
    const next = { ...prefs, preferredPlatforms: updated };
    setPrefs(next);
    saveUserPreferences(next);
  }

  return (
    <section className="space-y-8 pt-6 sm:pt-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <IconSettings className="size-3.5" />
            <span>Developer Profile & Parameters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
            Builder Settings & Personalization
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Configure your technical stack, builder persona, and hackathon constraints.
            These settings tune your live Personal Fit Scores and provide context to the <span className="text-foreground font-medium">HackMaxx Copilot</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs h-9 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <IconReset className="size-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs h-9 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm"
          >
            <IconCheck className="size-3.5 mr-1.5" />
            Save Profile
          </Button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-win/10 border border-win/30 text-win text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <IconCheck className="size-4" />
            <span>{savedMessage}</span>
          </div>
          <span className="font-mono text-[11px] opacity-80">Synced</span>
        </div>
      )}

      {/* Copilot Live Context Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/15 border border-primary/30 grid place-items-center text-primary shrink-0">
            <IconSparkles className="size-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <span>Agentic Copilot Context</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-win bg-win/10 px-1.5 py-0.5 rounded border border-win/20">
                <span className="pulse-dot size-1.5" />
                Live Hooked
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Press <span className="font-mono text-primary font-bold">/</span> or click the bottom-right Copilot bubble anytime to ask questions about your stack or plan maxxing strategies.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground shrink-0 bg-muted/60 px-2.5 py-1 rounded border border-border">
          {prefs.skills.length} skills · {prefs.preferredFormats.length} formats
        </div>
      </div>

      {/* Section 1: Developer Persona & Identity */}
      <div className="card-glass p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
          <IconUser className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground font-display">
            Developer Persona & Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Display Name
            </label>
            <input
              type="text"
              value={prefs.name}
              onChange={(e) => {
                const next = { ...prefs, name: e.target.value };
                setPrefs(next);
                saveUserPreferences(next);
              }}
              placeholder="e.g. Alex Builder"
              className="w-full h-10 px-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Developer Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">@</span>
              <input
                type="text"
                value={prefs.handle}
                onChange={(e) => {
                  const next = { ...prefs, handle: e.target.value.replace(/^@/, "") };
                  setPrefs(next);
                  saveUserPreferences(next);
                }}
                placeholder="handle"
                className="w-full h-10 pl-7 pr-3 text-sm rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Primary Builder Role
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => {
              const active = prefs.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    const next = { ...prefs, role: r };
                    setPrefs(next);
                    saveUserPreferences(next);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Experience Posture
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXPERIENCE_OPTIONS.map((exp) => {
              const active = prefs.experienceLevel === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => {
                    const next = { ...prefs, experienceLevel: exp.id };
                    setPrefs(next);
                    saveUserPreferences(next);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    active
                      ? "bg-primary/10 border-primary/60 text-foreground"
                      : "bg-background/40 border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>
                      {exp.label}
                    </span>
                    {active && <span className="size-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {exp.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Builder Bio & Elevator Pitch
          </label>
          <textarea
            rows={2}
            value={prefs.bio}
            onChange={(e) => {
              const next = { ...prefs, bio: e.target.value };
              setPrefs(next);
              saveUserPreferences(next);
            }}
            placeholder="Describe your technical superpowers and typical hackathon focus..."
            className="w-full p-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Section 2: Technical Stack & Skills */}
      <div className="card-glass p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <IconCode className="size-4 text-primary" />
            <h2 className="text-base font-bold text-foreground font-display">
              Technical Stack & Skills
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {prefs.skills.length} selected
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Select the technologies you build with. HackMaxx checks upcoming hackathon track themes and prize bounties to calculate your live <span className="text-foreground font-semibold">Personal Fit Score</span>.
        </p>

        {/* Selected skills pills */}
        <div className="flex flex-wrap gap-1.5">
          {prefs.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground border border-primary shadow-xs"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => toggleSkill(skill)}
                className="opacity-70 hover:opacity-100 text-xs"
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add custom skill input */}
        <form onSubmit={addCustomSkill} className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder="Add custom skill or framework (e.g. PyTorch, Svelte, WebGPU)..."
            className="flex-1 h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="h-9 text-xs font-semibold border-border"
          >
            Add Skill
          </Button>
        </form>

        {/* Popular skill suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Popular Stacks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map((s) => {
              const active = prefs.skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    active
                      ? "bg-primary/15 text-primary border-primary/40 font-bold"
                      : "bg-muted/40 text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Domain interests */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Domain Focus & Tracks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_INTERESTS.map((interest) => {
              const active = prefs.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    active
                      ? "bg-win/15 text-win border-win/40 font-bold"
                      : "bg-muted/40 text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Hackathon Constraints & Targets */}
      <div className="card-glass p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
          <IconTarget className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground font-display">
            Hackathon Constraints & Strategy
          </h2>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Allowed Event Formats
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {FORMAT_OPTIONS.map((fmt) => {
              const active = prefs.preferredFormats.includes(fmt.id);
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => toggleFormat(fmt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    active
                      ? "bg-primary/10 border-primary text-foreground font-semibold"
                      : "bg-background/40 border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{fmt.label}</span>
                    {active && <IconCheck className="size-3.5 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-normal">
                    {fmt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Goals */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Target Strategic Goals
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((g) => {
              const active = prefs.targetGoals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGoal(g.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                    active
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-background/40 border-border/70 text-muted-foreground hover:border-border"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{g.label}</span>
                    <span className="text-[11px] text-muted-foreground block">{g.desc}</span>
                  </div>
                  {active && <IconCheck className="size-3.5 text-primary shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Platforms & Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Preferred Platforms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_OPTIONS.map((plt) => {
                const active = prefs.preferredPlatforms.includes(plt);
                return (
                  <button
                    key={plt}
                    type="button"
                    onClick={() => togglePlatform(plt)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono capitalize transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-muted/40 text-muted-foreground border-border/70 hover:text-foreground"
                    }`}
                  >
                    {plt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Min Prize Target (USD)
              </label>
              <span className="text-xs font-mono font-bold text-money">
                ${prefs.minPrizeUsd.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={prefs.minPrizeUsd}
              onChange={(e) => {
                const next = { ...prefs, minPrizeUsd: Number(e.target.value) };
                setPrefs(next);
                saveUserPreferences(next);
              }}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Active Project Idea (Context for Copilot & /maxx) */}
      <div className="card-glass p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <IconZap className="size-4 text-money" />
            <h2 className="text-base font-bold text-foreground font-display">
              Active Project Idea & Context
            </h2>
          </div>
          <a
            href={`/maxx?title=${encodeURIComponent(prefs.activeIdeaTitle)}&description=${encodeURIComponent(prefs.activeIdeaDescription)}&stack=${encodeURIComponent(prefs.activeIdeaStack.join(", "))}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-money hover:underline"
          >
            <span>Maxx this project</span>
            <span>→</span>
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Store your currently in-flight project or repo context. The Copilot uses this to instantly brainstorm submission angles and evaluate project reuse across hackathons.
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-mono">
              Project Title
            </label>
            <input
              type="text"
              value={prefs.activeIdeaTitle}
              onChange={(e) => {
                const next = { ...prefs, activeIdeaTitle: e.target.value };
                setPrefs(next);
                saveUserPreferences(next);
              }}
              placeholder="e.g. Autonomous ROI Hackathon Planner"
              className="w-full h-10 px-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-mono">
              Description & Core Value Proposition
            </label>
            <textarea
              rows={2}
              value={prefs.activeIdeaDescription}
              onChange={(e) => {
                const next = { ...prefs, activeIdeaDescription: e.target.value };
                setPrefs(next);
                saveUserPreferences(next);
              }}
              placeholder="Brief summary of the idea and problem it solves..."
              className="w-full p-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
