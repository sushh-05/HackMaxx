// `bun seed` — sanity check: loads seed.csv via backend lib + scores one project.
import { listHackathons } from "../backend/src/lib/dynamo";
import { keywordSimilarity, worthScore } from "../shared/src/index";

const hacks = await listHackathons();
console.log(`loaded ${hacks.length} hackathons from data/seed.csv`);
const project = { title: "AI CP tutor", description: "Bedrock agent for Codeforces explanations", tech_stack: ["Bedrock", "Lambda"], tags: ["AI agent"] };
const maxPrize = Math.max(...hacks.map((h) => h.prize_inr));
for (const h of hacks.slice(0, 3)) {
  const skill = keywordSimilarity(project, h);
  const { worth } = worthScore(project, h, { skillSim: skill, maxPrize });
  console.log(`${worth} — ${h.title}`);
}
