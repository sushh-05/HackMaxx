import {
  buildMaxxingPlan, buildWhy, keywordSimilarity, reuseLabel, worthScore,
  type ProjectInput, type RecommendResponse,
} from "@hackmaxx/shared";
import { listHackathons } from "../lib/dynamo.js";
import { embedText, explainMatch } from "../lib/bedrock.js";
import { cosine } from "@hackmaxx/shared";

export async function handler(event: { body?: string }) {
  const raw = JSON.parse(event.body ?? "{}");
  const project: ProjectInput = {
    tech_stack: [],
    tags: [],
    ...raw,
  };
  if (!project.title || !project.description) {
    return { statusCode: 400, body: JSON.stringify({ error: "title + description required" }) };
  }
  const hacks = await listHackathons();
  const maxPrize = Math.max(1, ...hacks.map((h) => h.prize_inr));
  const emb = await embedText(`${project.title} ${project.description}`);

  const scored = await Promise.all(
    hacks.map(async (h) => {
      const skill = emb && h.embedding ? cosine(emb, h.embedding) : keywordSimilarity(project, h);
      const { worth, breakdown } = worthScore(project, h, { skillSim: skill, maxPrize });
      const why = await explainMatch({ projectTitle: project.title, hackathonTitle: h.title, fallback: buildWhy(project, h) });
      return { hackathon: h, worth, breakdown, why, reuse: reuseLabel(why, skill) };
    })
  );
  scored.sort((a, b) => b.worth - a.worth);
  const top = scored.slice(0, 8);

  // The hackmaxxing plan: which ones to actually submit to, in deadline order,
  // with total expected value + cumulative win chance across the run.
  const plan = buildMaxxingPlan(top);

  const strategy = plan.steps.length > 0
    ? plan.headline + " Order: " + plan.steps.map((s) => `${s.title} (${s.days_left}d left, EV ₹${s.expected_value_inr.toLocaleString("en-IN")}, ${s.effort} effort)`).join(" → ") + "."
    : plan.headline;

  const res: RecommendResponse = { recommendations: top, strategy, plan };
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(res) };
}
