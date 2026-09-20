// Client-only localStorage store for the project portfolio.
//
// Posture: saved projects are open positions. Each project holds the snapshot
// of its latest Maxx result (timestamp, total EV, plan length, top worth score)
// so the /portfolio watchlist can show last-Maxxed state without re-running
// the engine.
//
// All window/localStorage access is guarded so this module is safe to import
// from server-rendered code paths.

export const PORTFOLIO_STORAGE_KEY = "hackmaxx:portfolio:v1";

export interface MaxxSnapshot {
  /** ms epoch of the successful recommend() */
  timestamp: number;
  /** total_expected_value_inr from the plan */
  totalEV: number;
  /** number of steps in the maxxing plan */
  planLength: number;
  /** highest worth score across recommendations */
  topWorth: number;
}

export interface PortfolioProject {
  /** stable id — derived from the title so re-saving the same title updates */
  id: string;
  title: string;
  description: string;
  /** tech stack list, as entered (comma-split) */
  stack: string[];
  tags: string[];
  repoUrl?: string;
  snapshot: MaxxSnapshot;
}

interface PortfolioFile {
  version: 1;
  projects: PortfolioProject[];
}

export function portfolioIdForTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): PortfolioFile {
  if (!isClient()) return { version: 1, projects: [] };
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return { version: 1, projects: [] };
    const parsed = JSON.parse(raw) as Partial<PortfolioFile>;
    if (!parsed || !Array.isArray(parsed.projects)) return { version: 1, projects: [] };
    return { version: 1, projects: parsed.projects };
  } catch {
    return { version: 1, projects: [] };
  }
}

function writeAll(file: PortfolioFile): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(file));
  } catch {
    // storage full / private mode — portfolio is best-effort by design
  }
}

export function listProjects(): PortfolioProject[] {
  return readAll().projects
    .slice()
    .sort((a, b) => b.snapshot.timestamp - a.snapshot.timestamp);
}

export function getProjectByTitle(title: string): PortfolioProject | null {
  const id = portfolioIdForTitle(title);
  return readAll().projects.find((p) => p.id === id) ?? null;
}

export interface SaveProjectInput {
  title: string;
  description: string;
  stack: string[];
  tags: string[];
  repoUrl?: string;
  snapshot: MaxxSnapshot;
}

/** Insert or update (same title → same position, refreshed snapshot). */
export function saveProject(input: SaveProjectInput): PortfolioProject {
  const file = readAll();
  const id = portfolioIdForTitle(input.title);
  const project: PortfolioProject = {
    id,
    title: input.title,
    description: input.description,
    stack: input.stack,
    tags: input.tags,
    ...(input.repoUrl ? { repoUrl: input.repoUrl } : {}),
    snapshot: input.snapshot,
  };
  const idx = file.projects.findIndex((p) => p.id === id);
  if (idx >= 0) file.projects[idx] = project;
  else file.projects.push(project);
  writeAll(file);
  return project;
}

export function deleteProject(id: string): void {
  const file = readAll();
  file.projects = file.projects.filter((p) => p.id !== id);
  writeAll(file);
}
