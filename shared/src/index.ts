// @hackmaxx/shared — types + Worth Score. Single source of truth for web + backend.

export type HackathonMode = "online" | "offline" | "hybrid";

export interface Hackathon {
  id: string;
  title: string;
  url: string;
  platform: string;
  deadline: string; // ISO
  prize_inr: number;
  tech_tags: string[];
  mode: HackathonMode;
  description: string;
  embedding?: number[];
  reputation_score: number; // 0..1
  difficulty_score: number; // 0..1
}

export interface ProjectInput {
  title: string;
  description: string;
  tech_stack: string[];
  tags: string[];
  repo_url?: string;
}

export interface WorthBreakdown {
  skill: number;
  learning: number;
  prize: number;
  rep: number;
  difficulty_fit: number;
}

export interface Recommendation {
  hackathon: Hackathon;
  worth: number; // 0..100
  breakdown: WorthBreakdown;
  why: string;
  reuse: "High" | "Medium" | "Low";
}

export interface PlanStep {
  hackathon_id: string;
  title: string;
  url: string;
  deadline: string; // ISO
  days_left: number;
  prize_inr: number;
  worth: number;
  reuse: Recommendation["reuse"];
  effort: "Low" | "Medium" | "High"; // reuse High→Low effort, Low→High effort
  expected_value_inr: number; // prize × P(win)
}

export interface MaxxingPlan {
  steps: PlanStep[]; // submission order = deadline order
  total_expected_value_inr: number;
  headline: string;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  strategy: string;
  plan: MaxxingPlan;
}

const PLATFORM_REP: Record<string, number> = {
  devpost: 0.9,
  mlh: 0.9,
  devfolio: 0.85,
  unstop: 0.8,
  hackerearth: 0.75,
  luma: 0.6,
};

export function platformReputation(platform: string): number {
  return PLATFORM_REP[platform.trim().toLowerCase()] ?? 0.5;
}

export function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Keyword-overlap fallback when Bedrock embeddings are unavailable (local/dev + demo insurance). */
export function keywordSimilarity(project: ProjectInput, h: Hackathon): number {
  const hay = `${h.title} ${h.description} ${h.tech_tags.join(" ")}`.toLowerCase();
  const tokens = `${project.title} ${project.description} ${project.tech_stack.join(" ")} ${project.tags.join(" ")}`
    .toLowerCase().split(/[^a-z0-9+#.]+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return 0;
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return Math.min(hits / Math.min(tokens.length, 12), 1);
}

export function tagOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.3;
  const setB = new Set(b.map((t) => t.toLowerCase()));
  const hits = a.filter((t) => setB.has(t.toLowerCase())).length;
  return hits / Math.max(a.length, b.length);
}

export function worthScore(
  project: ProjectInput,
  h: Hackathon,
  opts: { skillSim: number; maxPrize: number; projectComplexity?: number }
): { worth: number; breakdown: WorthBreakdown } {
  const skill = opts.skillSim;
  const learning = 0.5 + 0.5 * tagOverlap([...project.tech_stack, ...project.tags], h.tech_tags);
  const prize = opts.maxPrize > 0 ? Math.min(h.prize_inr / opts.maxPrize, 1) : 0.5;
  const rep = h.reputation_score;
  const complexity = opts.projectComplexity ?? 0.5;
  const difficulty_fit = 1 - Math.abs(complexity - h.difficulty_score);
  const worth =
    100 * (0.3 * skill + 0.2 * learning + 0.15 * prize + 0.2 * rep + 0.15 * difficulty_fit);
  return { worth: Math.round(worth), breakdown: { skill, learning, prize, rep, difficulty_fit } };
}

export function reuseLabel(why: string, skill: number): "High" | "Medium" | "Low" {
  if (skill > 0.65) return "High";
  if (skill > 0.4) return "Medium";
  return "Low";
}

/** Reuse → effort mapping: high reuse means minimal rework. */
export function effortFromReuse(reuse: Recommendation["reuse"]): PlanStep["effort"] {
  return reuse === "High" ? "Low" : reuse === "Medium" ? "Medium" : "High";
}

/**
 * Rough P(win) from worth + difficulty fit. A well-matched project at a
 * mid-difficulty hackathon wins/places more often; calibrate after real submissions.
 */
export function winProbability(worth: number, difficulty_fit: number): number {
  const base = Math.pow(worth / 100, 1.5); // 100 worth → ~1.0, 50 → ~0.35
  const field = 0.35 + 0.3 * difficulty_fit; // field strength discount, better fit → better odds
  return Math.min(Math.round(base * field * 100) / 100, 0.9);
}

export function daysUntil(iso: string, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000));
}

/**
 * The hackmaxxing plan: which hackathons to submit to, in what order, and the
 * total expected value of the whole run. Submissions are independent events —
 * each added hackathon multiplies your chance of placing somewhere.
 */
export function buildMaxxingPlan(
  recommendations: Recommendation[],
  opts?: { maxSteps?: number; now?: number }
): MaxxingPlan {
  const now = opts?.now ?? Date.now();
  const maxSteps = opts?.maxSteps ?? 5;
  const effortWeight = (e: PlanStep["effort"]) => (e === "Low" ? 1 : e === "Medium" ? 2 : 4);
  // Rank by EV per unit effort (maxxing = best ROI submissions first).
  const candidates = recommendations
    .filter((r) => daysUntil(r.hackathon.deadline, now) > 0)
    .map((r) => {
      const reuse = r.reuse;
      const effort = effortFromReuse(reuse);
      const p = winProbability(r.worth, r.breakdown.difficulty_fit);
      const expected_value_inr = Math.round(r.hackathon.prize_inr * p);
      return {
        hackathon_id: r.hackathon.id,
        title: r.hackathon.title,
        url: r.hackathon.url,
        deadline: r.hackathon.deadline,
        days_left: daysUntil(r.hackathon.deadline, now),
        prize_inr: r.hackathon.prize_inr,
        worth: r.worth,
        reuse,
        effort,
        expected_value_inr,
      } as PlanStep;
    })
    .filter((s) => s.reuse !== "Low")
    .sort((a, b) => b.expected_value_inr / effortWeight(b.effort) - a.expected_value_inr / effortWeight(a.effort))
    .slice(0, maxSteps)
    .sort((a, b) => a.days_left - b.days_left); // execute in deadline order

  const total = candidates.reduce((s, c) => s + c.expected_value_inr, 0);
  const cumulative_win_chance = candidates.reduce(
    (s, c) => s + (1 - s) * winProbability(c.worth, 0.5), 0
  );
  const headline = candidates.length === 0
    ? "No open, well-matching hackathons right now — refresh the list and check back."
    : `Submit to ${candidates.length} hackathon${candidates.length > 1 ? "s" : ""} in the next ${candidates[candidates.length - 1].days_left}d — ` +
      `expected value ₹${total.toLocaleString("en-IN")}, ~${Math.round(cumulative_win_chance * 100)}% chance of placing in at least one.`;
  return { steps: candidates, total_expected_value_inr: total, headline };
}

export function buildWhy(project: ProjectInput, h: Hackathon): string {
  const overlap = h.tech_tags.filter((t) =>
    [...project.tech_stack, ...project.tags].map((x) => x.toLowerCase()).includes(t.toLowerCase())
  );
  const tech = overlap.length > 0 ? ` Matches your ${overlap.slice(0, 3).join(", ")}.` : "";
  return `Fits "${h.title}" (${h.platform}).${tech} Reuse with minor pitch/UI tweaks.`;
}
