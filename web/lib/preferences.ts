// Client-only localStorage store & fit calculator for user developer preferences and context.
//
// Posture: Developer preferences define the "trading parameters" for the builder.
// Preferences feed directly into:
// 1. HackMaxx Copilot (contextual awareness of skills, target platforms, active ideas)
// 2. Dashboard Watchlist (Personal Fit Score calculation on top of Worth Score)
// 3. /maxx planner (pre-filling tech stack and tailoring submission strategies)
//
// Safe to import in SSR environments (all window/localStorage access is guarded).

import type { Hackathon } from "@hackmaxx/shared";

export const PREFERENCES_STORAGE_KEY = "hackmaxx:user-preferences:v1";
export const PREFERENCES_UPDATED_EVENT = "hackmaxx:preferences-updated";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type HackathonFormat = "online" | "offline" | "hybrid";
export type TargetGoal = "ev" | "prize" | "portfolio" | "learning" | "networking";

export interface UserPreferences {
  // Identity & Persona
  name: string;
  handle: string;
  githubUrl: string;
  role: string;
  experienceLevel: ExperienceLevel;
  bio: string;

  // Skills & Technical Context
  skills: string[];
  interests: string[];

  // Hackathon Constraints & Targets
  preferredFormats: HackathonFormat[];
  targetGoals: TargetGoal[];
  preferredPlatforms: string[];
  minPrizeUsd: number;
  maxDeadlineDays: number; // 0 = unlimited

  // Active Project Context (for quick maxxing & copilot seeding)
  activeIdeaTitle: string;
  activeIdeaDescription: string;
  activeIdeaStack: string[];
}

export const POPULAR_SKILLS = [
  "TypeScript",
  "Next.js",
  "React",
  "Python",
  "Rust",
  "Go",
  "AI Agents",
  "Tailwind CSS",
  "Solana",
  "Ethereum",
  "AWS",
  "Docker",
  "Bun",
  "GraphQL",
  "PostgreSQL",
  "PyTorch",
  "FastAPI",
  "LangChain",
] as const;

export const POPULAR_INTERESTS = [
  "AI & Autonomous Agents",
  "Developer Tooling",
  "FinTech & Quant",
  "DeFi & Web3",
  "HealthTech",
  "Open Source",
  "Enterprise SaaS",
  "Consumer Social",
] as const;

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: "Alex Builder",
  handle: "alexbuilder",
  githubUrl: "https://github.com",
  role: "Fullstack & AI Agent Builder",
  experienceLevel: "advanced",
  bio: "Fullstack developer farming hackathons with AI agents, modern TypeScript, and high-EV submission pipelines.",
  skills: ["TypeScript", "Next.js", "Python", "React", "AI Agents", "Tailwind CSS", "AWS"],
  interests: ["AI & Autonomous Agents", "Developer Tooling", "FinTech & Quant"],
  preferredFormats: ["online", "hybrid"],
  targetGoals: ["ev", "prize", "portfolio"],
  preferredPlatforms: ["devpost", "devfolio", "unstop"],
  minPrizeUsd: 2500,
  maxDeadlineDays: 60,
  activeIdeaTitle: "Autonomous ROI Hackathon Engine",
  activeIdeaDescription: "Real-time hackathon maxxing platform that maximizes EV across multi-event submissions.",
  activeIdeaStack: ["Next.js", "TypeScript", "Python", "Tailwind CSS", "Anthropic Claude"],
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getUserPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : DEFAULT_PREFERENCES.skills,
      interests: Array.isArray(parsed.interests) ? parsed.interests : DEFAULT_PREFERENCES.interests,
      preferredFormats: Array.isArray(parsed.preferredFormats) ? parsed.preferredFormats : DEFAULT_PREFERENCES.preferredFormats,
      targetGoals: Array.isArray(parsed.targetGoals) ? parsed.targetGoals : DEFAULT_PREFERENCES.targetGoals,
      preferredPlatforms: Array.isArray(parsed.preferredPlatforms) ? parsed.preferredPlatforms : DEFAULT_PREFERENCES.preferredPlatforms,
      activeIdeaStack: Array.isArray(parsed.activeIdeaStack) ? parsed.activeIdeaStack : DEFAULT_PREFERENCES.activeIdeaStack,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(partial: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const next: UserPreferences = {
    ...current,
    ...partial,
  };

  if (isClient()) {
    try {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT, { detail: next }));
    } catch {
      // quota or private mode fallback
    }
  }

  return next;
}

export function resetUserPreferences(): UserPreferences {
  if (isClient()) {
    try {
      window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT, { detail: DEFAULT_PREFERENCES }));
    } catch {
      // ignore
    }
  }
  return DEFAULT_PREFERENCES;
}

export interface PersonalFitResult {
  /** 0 to 100 personal fit score */
  fitScore: number;
  /** Skills present in user preferences that match the hackathon's tech tags */
  matchedSkills: string[];
  /** Format match flag */
  formatMatches: boolean;
  /** Platform match flag */
  platformMatches: boolean;
  /** Actionable badges/reasons why this fits */
  reasons: string[];
}

/**
 * Calculates how well a hackathon matches the user's specific skills,
 * target formats, preferred platforms, and builder experience profile.
 */
export function calculatePersonalFit(
  hackathon: Hackathon,
  prefs: UserPreferences
): PersonalFitResult {
  const userSkillsLower = new Set(prefs.skills.map((s) => s.toLowerCase().trim()));
  const hackathonTags = hackathon.tech_tags || [];
  
  // 1. Skill Match
  const matchedSkills: string[] = [];
  for (const tag of hackathonTags) {
    const tLower = tag.toLowerCase().trim();
    for (const skill of userSkillsLower) {
      if (tLower.includes(skill) || skill.includes(tLower)) {
        matchedSkills.push(tag);
        break;
      }
    }
  }

  const skillScore = hackathonTags.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / Math.max(1, Math.min(hackathonTags.length, 3))) * 100))
    : 70; // neutral when no tags

  // 2. Format Match
  const formatMatches = prefs.preferredFormats.includes(hackathon.mode);
  const formatScore = formatMatches ? 100 : 30;

  // 3. Platform Match
  const pLower = (hackathon.platform || "").toLowerCase();
  const platformMatches = prefs.preferredPlatforms.some((p) => pLower.includes(p.toLowerCase()));
  const platformScore = platformMatches ? 100 : 50;

  // 4. Goals and Experience Alignment
  let goalBonus = 0;
  const reasons: string[] = [];

  if (matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length} skill match (${matchedSkills.slice(0, 2).join(", ")})`);
  }

  if (formatMatches) {
    reasons.push(`${hackathon.mode.toUpperCase()} format match`);
  }

  if (prefs.targetGoals.includes("prize") || prefs.targetGoals.includes("ev")) {
    const prizeUsd = (hackathon.prize_inr || 0) / 85;
    if (prizeUsd >= prefs.minPrizeUsd) {
      goalBonus += 10;
      reasons.push("High prize target hit");
    }
  }

  if (prefs.experienceLevel === "pro" || prefs.experienceLevel === "advanced") {
    if (hackathon.reputation_score >= 0.8) {
      goalBonus += 10;
      reasons.push("High reputation Tier 1 event");
    }
  } else if (prefs.experienceLevel === "beginner") {
    if (hackathon.difficulty_score <= 0.6) {
      goalBonus += 10;
      reasons.push("Beginner friendly difficulty");
    }
  }

  // Composite Weighted Fit Score:
  // Skills 45% + Format 25% + Platform 15% + Reputation/Goals 15% + bonus
  const rawScore = (skillScore * 0.45) + (formatScore * 0.25) + (platformScore * 0.15) + (hackathon.reputation_score * 100 * 0.15) + goalBonus;
  const fitScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    fitScore,
    matchedSkills,
    formatMatches,
    platformMatches,
    reasons,
  };
}
