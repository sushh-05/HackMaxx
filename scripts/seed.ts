// `bun seed` — sanity check: loads seed.csv via backend lib, scores one project, builds a maxxing plan.
import { listHackathons } from "../backend/src/lib/dynamo";
import { keywordSimilarity, worthScore, reuseLabel, buildMaxxingPlan, buildWhy, type Recommendation } from "../shared/src/index";

const hacks = await listHackathons();
console.log(`loaded ${hacks.length} hackathons from data/seed.csv`);

const project = { title: "AI CP tutor", description: "Bedrock agent for Codeforces explanations", tech_stack: ["Bedrock", "Lambda"], tags: ["AI agent"] };
const maxPrize = Math.max(...hacks.map((h) => h.prize_inr));

const recs: Recommendation[] = hacks.map((h) => {
  const skill = keywordSimilarity(project, h);
  const { worth, breakdown } = worthScore(project, h, { skillSim: skill, maxPrize });
  const why = buildWhy(project, h);
  return { hackathon: h, worth, breakdown, why, reuse: reuseLabel(why, skill) };
}).sort((a, b) => b.worth - a.worth);

console.log("\nscored:");
for (const r of recs) console.log(`  ${String(r.worth).padStart(3)} — ${r.hackathon.title} [${r.reuse}]`);

const plan = buildMaxxingPlan(recs);
console.log(`\nplan: ${plan.headline}`);
for (const s of plan.steps) {
  console.log(`  ${s.days_left}d — ${s.title} (EV ₹${s.expected_value_inr}, ${s.effort} effort)`);
}
