#!/usr/bin/env bun
/**
 * hackmaxx — terminal client for the HackMaxx platform.
 *
 * Views: watchlist (live index) → m to maxx the highlighted row → streaming
 * plan view → d to draft the plan to a markdown file.
 * Keys: ↑↓/j/k move · Enter details · m maxx · / filter · r reload
 * · t sort · d draft plan .md · Esc back · q quit.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  type ParsedKey,
  type RenderContext,
} from "@opentui/core";
import type {
  Hackathon,
  RecommendResponse,
  ProjectInput,
} from "@hackmaxx/shared";

const BASE = process.env.HACKMAXX_API_URL ?? "http://localhost:3011";

/* Notebook palette, translated to hex for the terminal. */
const C = {
  bg: "#2b2b2b",
  card: "#333333",
  fg: "#dcdcdc",
  dim: "#a0a0a0",
  faint: "#6f6f6f",
  border: "#4f4f4f",
  action: "#b0b0b0",
  data: "#94a3b8",
  money: "#f3eac8",
  deadline: "#d9afaf",
  win: "#7ec294",
} as const;

const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

const fmtINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* ---------- API ---------- */

async function apiHackathons(q = ""): Promise<Hackathon[]> {
  const params = q ? `?q=${encodeURIComponent(q)}` : "";
  const r = await fetch(`${BASE}/hackathons${params}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as Hackathon[];
}

async function apiRecommend(input: ProjectInput): Promise<RecommendResponse> {
  const r = await fetch(`${BASE}/recommend`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as RecommendResponse;
}

/* ---------- App ---------- */

type SortKey = "deadline" | "prize" | "title";

class App {
  private renderer!: CliRenderer;
  private ctx!: RenderContext;
  private root!: BoxRenderable;
  private body!: BoxRenderable;
  private status!: TextRenderable;
  private hint!: TextRenderable;

  private items: Hackathon[] = [];
  private cursor = 0;
  private filter = "";
  private filtering = false;
  private sort: SortKey = "deadline";
  private view: "watchlist" | "maxx" | "preview" = "watchlist";
  private busy = false;
  private lastRun: { project: ProjectInput; res: RecommendResponse } | null = null;
  private draftedFile: string | null = null;
  private previewOffset = 0;

  async run() {
    this.renderer = await createCliRenderer({
      exitOnCtrlC: true,
      targetFps: 30,
    });
    this.ctx = this.renderer;
    this.renderer.setBackgroundColor(C.bg);

    this.root = new BoxRenderable(this.ctx, {
      id: "root",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      paddingX: 1,
    });

    const header = new BoxRenderable(this.ctx, {
      id: "header",
      width: "100%",
      height: 3,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingX: 1,
      border: ["bottom"],
      borderColor: C.border,
    });
    header.add(
      new TextRenderable(this.ctx, {
        content: "⚡ HackMaxx",
        fg: C.fg,
        attributes: 1, // bold
      })
    );
    header.add(
      new TextRenderable(this.ctx, {
        content: "live index · worth-ranked",
        fg: C.dim,
      })
    );
    this.root.add(header);

    this.body = new BoxRenderable(this.ctx, {
      id: "body",
      width: "100%",
      flexGrow: 1,
      flexDirection: "column",
      paddingX: 1,
      paddingY: 1,
      gap: 0,
    });
    this.root.add(this.body);

    this.status = new TextRenderable(this.ctx, { content: "", fg: C.dim });
    this.root.add(this.status);

    this.hint = new TextRenderable(this.ctx, {
      content:
        "↑↓ move · Enter expand · m maxx · / filter · t sort · r reload · q quit",
      fg: C.faint,
    });
    this.root.add(this.hint);

    this.renderer.root.add(this.root);

    this.renderer.keyInput.on("keypress", (key: ParsedKey) => this.onKey(key));

    await this.load();
    this.renderWatchlist();
    this.renderer.start();
  }

  private async load() {
    this.setStatus("loading index…", C.dim);
    try {
      this.items = await apiHackathons();
      this.setStatus(
        `${this.items.length} open events · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        C.win
      );
    } catch {
      this.setStatus(
        `index unreachable at ${BASE} — set HACKMAXX_API_URL or start the backend`,
        C.deadline
      );
    }
  }

  private sorted(): Hackathon[] {
    let rows = [...this.items];
    if (this.filter) {
      const n = this.filter.toLowerCase();
      rows = rows.filter((h) =>
        `${h.title} ${h.platform} ${h.tech_tags.join(" ")}`.toLowerCase().includes(n)
      );
    }
    rows.sort((a, b) => {
      if (this.sort === "prize") return b.prize_inr - a.prize_inr;
      if (this.sort === "title") return a.title.localeCompare(b.title);
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    return rows;
  }

  private setStatus(text: string, fg: string) {
    this.status.content = text;
    this.status.fg = fg;
  }

  private clearBody() {
    for (const child of this.body.getChildren()) this.body.remove(child);
  }

  private rowLine(h: Hackathon, active: boolean): TextRenderable {
    const d = daysLeft(h.deadline);
    const urgent = d <= 3;
    const soon = d > 3 && d <= 7;
    const dayColor = urgent ? C.deadline : soon ? C.money : C.dim;
    const prefix = active ? "❯ " : "  ";
    const title = h.title.length > 46 ? h.title.slice(0, 45) + "…" : h.title;
    const line =
      `${prefix}${title.padEnd(48)}` +
      `${h.platform.padEnd(10)}` +
      `${fmtINR(h.prize_inr).padStart(10)}` +
      `  ${String(d).padStart(3)}d`;
    const t = new TextRenderable(this.ctx, { content: line, fg: C.dim });
    // Colour the whole row on active; dim otherwise. Per-span colouring via
    // StyledText is possible but a flat tone reads cleaner in a watchlist.
    t.fg = active ? C.fg : C.dim;
    if (active) t.attributes = 1;
    if (urgent && !active) t.fg = dayColor;
    return t;
  }

  private renderWatchlist() {
    this.clearBody();
    this.view = "watchlist";
    this.hint.content =
      "↑↓ move · Enter expand · m maxx · / filter · t sort · r reload · q quit" +
      (this.filter ? `   [filter: ${this.filter}]` : "");

    const rows = this.sorted();
    if (this.cursor >= rows.length) this.cursor = Math.max(0, rows.length - 1);

    if (rows.length === 0) {
      this.body.add(
        new TextRenderable(this.ctx, {
          content: this.filter
            ? `no events match "${this.filter}" — Esc clears`
            : "index empty — try r to reload",
          fg: C.faint,
        })
      );
      return;
    }

    rows.forEach((h, i) => {
      this.body.add(this.rowLine(h, i === this.cursor));
      if (i === this.cursor) this.renderDetail(h);
    });
  }

  private renderDetail(h: Hackathon) {
    const box = new BoxRenderable(this.ctx, {
      width: "100%",
      border: true,
      borderStyle: "single",
      borderColor: C.action,
      backgroundColor: C.card,
      paddingX: 1,
      marginY: 1,
      flexDirection: "column",
      title: " details ",
      titleColor: C.dim,
    });
    box.add(
      new TextRenderable(this.ctx, {
        content: `url      ${h.url}`,
        fg: C.data,
      })
    );
    box.add(
      new TextRenderable(this.ctx, {
        content: `mode     ${h.mode} · deadline ${new Date(h.deadline).toDateString()}`,
        fg: C.dim,
      })
    );
    box.add(
      new TextRenderable(this.ctx, {
        content: `stack    ${h.tech_tags.map((t) => "#" + t).join(" ")}`,
        fg: C.data,
      })
    );
    if (h.description) {
      box.add(
        new TextRenderable(this.ctx, {
          content: h.description,
          fg: C.fg,
        })
      );
    }
    box.add(
      new TextRenderable(this.ctx, {
        content: "press m to maxx a project against this event",
        fg: C.money,
      })
    );
    this.body.add(box);
  }

  /* ---------- Maxx flow ---------- */

  private async runMaxx(anchor?: Hackathon) {
    if (this.busy) return;
    this.busy = true;
    this.view = "maxx";
    this.clearBody();

    const project: ProjectInput = anchor
      ? {
          title: `Multi-hackathon edition for ${anchor.title}`,
          description: anchor.description || anchor.title,
          tech_stack: anchor.tech_tags,
          tags: anchor.tech_tags,
        }
      : {
          title: "Untitled project",
          description: "Portfolio project",
          tech_stack: [],
          tags: [],
        };

    const log = (text: string, fg: string = C.dim) => {
      this.body.add(new TextRenderable(this.ctx, { content: text, fg }));
      this.renderer.requestRender();
    };

    log("", C.dim);
    log(`  ❯ maxx "${project.title}"`, C.fg);
    log("  [engine] profiling project…", C.faint);
    this.renderer.requestRender();

    const t0 = Date.now();
    try {
      const res = await apiRecommend(project);
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      log(`  [engine] scored ${res.recommendations.length} events in ${secs}s`, C.faint);
      log("", C.dim);

      for (const step of res.plan.steps) {
        log(
          `  [ok] W${String(step.worth).padEnd(3)} ${step.title.slice(0, 44).padEnd(46)} EV ${fmtINR(step.expected_value_inr).padStart(10)} · ${step.days_left}d`,
          C.win
        );
        await new Promise((r) => setTimeout(r, 120)); // typewriter pacing
      }

      log("", C.dim);
      log(
        `  [plan] ${res.plan.steps.length} submissions · total expected value ${fmtINR(res.plan.total_expected_value_inr)}`,
        C.money
      );
      if (res.strategy) {
        log("", C.dim);
        log(`  ${res.strategy}`, C.dim);
      }
      log("", C.dim);
      log("  ❯ ▊", C.action);

      this.lastRun = { project, res };
      this.setStatus("run complete — d to draft plan file · Esc back to watchlist", C.win);
    } catch {
      log(`  [err] engine unreachable at ${BASE}`, C.deadline);
      this.setStatus("maxx failed — Esc back", C.deadline);
    } finally {
      this.busy = false;
    }

    this.hint.content = "d draft plan .md · Esc back to watchlist · q quit";
  }

  /* ---------- Plan draft export ---------- */

  private draftPlan() {
    if (!this.lastRun) return;
    const { project, res } = this.lastRun;
    const slug = project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    const file = `maxx-plan-${slug}.md`;
    const lines = [
      `# Maxx Plan — ${project.title}`,
      ``,
      `> Generated by HackMaxx · ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `## Project`,
      ``,
      project.description,
      ...(project.tech_stack.length ? [``, `**Stack:** ${project.tech_stack.join(", ")}`] : []),
      ``,
      `## Strategy`,
      ``,
      res.strategy,
      ``,
      `## Submission pipeline (deadline order)`,
      ``,
      ...res.plan.steps.map(
        (s, i) =>
          `${i + 1}. **[${s.title}](${s.url})** — ${s.days_left}d left · Worth W${s.worth} · EV ${fmtINR(s.expected_value_inr)} · ${s.effort} effort (${s.reuse} reuse)`
      ),
      ``,
      `## Total expected value`,
      ``,
      `**${fmtINR(res.plan.total_expected_value_inr)}** across ${res.plan.steps.length} submissions.`,
      ``,
      ...res.recommendations.slice(0, 5).flatMap((r) => [
        `### W${r.worth} — ${r.hackathon.title}`,
        ``,
        r.why,
        ``,
      ]),
    ];
    try {
      writeFileSync(file, lines.join("\n"));
      this.draftedFile = file;
      this.setStatus(`drafted ${file} — p to preview · Esc back`, C.win);
      this.body.add(
        new TextRenderable(this.ctx, {
          content: `  [ok] wrote ${file} — p to preview`,
          fg: C.win,
        })
      );
      this.renderer.requestRender();
    } catch {
      this.setStatus("could not write plan file", C.deadline);
    }
  }

  /* ---------- Plan preview + follow-up ---------- */

  private suggestChanges(): string[] {
    if (!this.lastRun) return [];
    const { res } = this.lastRun;
    const out: string[] = [];
    const steps = res.plan.steps;
    const urgent = steps.filter((s) => s.days_left <= 3);
    if (urgent.length > 0)
      out.push(`⚠ ${urgent.length} deadline${urgent.length > 1 ? "s" : ""} within 3 days — cut scope on ${urgent[0].title} first.`);
    const highEffort = steps.filter((s) => s.effort === "High");
    if (highEffort.length > 0)
      out.push(`Drop ${highEffort[0].title} if time is tight — High effort drags portfolio EV.`);
    const lowWorth = steps.filter((s) => s.worth < 60);
    if (lowWorth.length > 0)
      out.push(`Re-check ${lowWorth.map((s) => s.title).join(", ")} — worth below 60 weakens the plan.`);
    const noDesc = !this.lastRun.project.description || this.lastRun.project.description.length < 40;
    if (noDesc) out.push("Add a 2–3 line project description — thin briefs score shallow matches.");
    if (steps.length === 1) out.push("Only one target selected — broaden tags to widen the pool.");
    if (out.length === 0) out.push("Plan looks tight. Ship it.");
    return out;
  }

  private renderPreview() {
    this.clearBody();
    this.view = "preview";
    this.previewOffset = 0;
    this.hint.content = "↑↓ scroll · s suggestions · Esc back to plan · q quit";
    this.setStatus(`preview: ${this.draftedFile}`, C.data);
    this.drawPreview();
  }

  private drawPreview() {
    if (!this.draftedFile || !existsSync(this.draftedFile)) return;
    const text = readFileSync(this.draftedFile, "utf8");
    const lines = text.split("\n");
    const height = Math.max(4, (this.renderer.terminalHeight ?? 24) - 8);
    const window_ = lines.slice(this.previewOffset, this.previewOffset + height);

    const box = new BoxRenderable(this.ctx, {
      width: "100%",
      border: true,
      borderStyle: "single",
      borderColor: C.action,
      backgroundColor: C.card,
      paddingX: 1,
      title: ` ${this.draftedFile} `,
      titleColor: C.dim,
      flexDirection: "column",
    });
    for (const line of window_) {
      const fg = line.startsWith("# ") ? C.fg : line.startsWith("##") ? C.action : line.startsWith(">") ? C.faint : C.dim;
      const t = new TextRenderable(this.ctx, { content: line || " ", fg });
      if (line.startsWith("#")) t.attributes = 1;
      box.add(t);
    }
    this.body.add(box);
  }

  private drawSuggestions() {
    const suggestions = this.suggestChanges();
    const box = new BoxRenderable(this.ctx, {
      width: "100%",
      border: true,
      borderStyle: "single",
      borderColor: C.money,
      backgroundColor: C.card,
      paddingX: 1,
      marginY: 1,
      title: " follow-up suggestions ",
      titleColor: C.money,
      flexDirection: "column",
    });
    for (const s of suggestions) {
      box.add(new TextRenderable(this.ctx, { content: `  · ${s}`, fg: C.dim }));
    }
    this.body.add(box);
    this.setStatus("suggestions shown — Esc back to plan", C.money);
  }

  /* ---------- Keys ---------- */

  private onKey(key: ParsedKey) {
    if (this.view === "preview") {
      if (key.name === "escape") {
        this.renderWatchlist();
        this.setStatus("", C.dim);
        return;
      }
      if (key.name === "up" || key.name === "k") {
        this.previewOffset = Math.max(0, this.previewOffset - 1);
        this.clearBody();
        this.drawPreview();
      }
      if (key.name === "down" || key.name === "j") {
        this.previewOffset += 1;
        this.clearBody();
        this.drawPreview();
      }
      if (key.name === "s") {
        this.clearBody();
        this.drawPreview();
        this.drawSuggestions();
      }
      return;
    }

    if (this.view === "maxx") {
      if (key.name === "escape" && !this.busy) {
        this.renderWatchlist();
        this.setStatus("", C.dim);
      }
      if (key.name === "d" && !this.busy && this.lastRun) this.draftPlan();
      if (key.name === "p" && !this.busy && this.draftedFile) this.renderPreview();
      return;
    }

    if (this.filtering) {
      if (key.name === "return" || key.name === "escape") {
        this.filtering = false;
        if (key.name === "escape") this.filter = "";
      } else if (key.name === "backspace") {
        this.filter = this.filter.slice(0, -1);
      } else if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
        this.filter += key.sequence;
      }
      this.cursor = 0;
      this.renderWatchlist();
      return;
    }

    const rows = this.sorted();
    switch (key.name) {
      case "up":
      case "k":
        this.cursor = (this.cursor - 1 + rows.length) % Math.max(rows.length, 1);
        this.renderWatchlist();
        break;
      case "down":
      case "j":
        this.cursor = (this.cursor + 1) % Math.max(rows.length, 1);
        this.renderWatchlist();
        break;
      case "m": {
        const h = rows[this.cursor];
        if (h) void this.runMaxx(h);
        break;
      }
      case "t":
        this.sort = this.sort === "deadline" ? "prize" : this.sort === "prize" ? "title" : "deadline";
        this.setStatus(`sorted by ${this.sort}`, C.data);
        this.renderWatchlist();
        break;
      case "r":
        void this.load().then(() => this.renderWatchlist());
        break;
      case "/":
        this.filtering = true;
        this.filter = "";
        this.renderWatchlist();
        break;
      case "escape":
        if (this.filter) {
          this.filter = "";
          this.renderWatchlist();
        }
        break;
      case "q":
        this.renderer.destroy();
        process.exit(0);
    }
  }
}

await new App().run();
