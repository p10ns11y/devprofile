/**
 * Parse golden-qa.md and casual-qa.md → tests/qa/qa-golden.jsonl
 * Run: pnpm parse-golden-qa
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const NARRATIVE_PATTERN =
  /\b(why|how do you think|what's your view|compare|reflect|philosophy|trade-?off|biggest lesson|walk me through|tell me about)\b/i;

/** Heuristic expectedSections for retrieval eval (expand over time). */
function inferExpectedSections(question, tier) {
  const q = question.toLowerCase();
  const sections = [];

  // Narrative answers live in golden/casual corpus as well as cvdata
  if (tier === "golden") sections.push("Golden Q&A");
  if (tier === "casual") sections.push("Casual Q&A");

  if (/oneflow|team lead|playwright|typescript migration|self-organiz/i.test(q)) {
    sections.push("Experience", "Work Experience");
  }
  if (/zod|nullish|pr #1702/i.test(q)) sections.push("Projects", "Open Source");
  if (/premflow|arch-machine|grok dia|latex-cv/i.test(q))
    sections.push("Projects", "Hobby OSS Projects");
  if (/thesis|eeaas|2016|energy efficiency|epic predictor/i.test(q)) {
    sections.push("Education", "Publications", "Projects");
  }
  if (/dad|son|tamil|next chapter/i.test(q)) sections.push("Profile", "Short Bio");
  if (/skill|react|typescript|senior engineer/i.test(q)) sections.push("Skills", "Technologies");
  if (/achievement|proud|biggest/i.test(q)) sections.push("Experience", "Projects");
  if (/open source|oss|contribute/i.test(q)) sections.push("Projects", "Open Source Contributions");
  if (/poetry|tamil|blog/i.test(q)) sections.push("Profile");
  if (/devprofile|\.agents|multi-agent/i.test(q)) sections.push("Projects");

  if (sections.length === 0 && tier === "casual") {
    sections.push("Projects", "Skills", "Experience");
  }

  return [...new Set(sections)];
}

function inferCategory(question) {
  const q = question.toLowerCase();
  if (/thesis|eeaas|agentic|energy/i.test(q)) return "vision";
  if (/oneflow|lead|team|mentor/i.test(q)) return "leadership";
  if (/premflow|arch-machine|automate|build/i.test(q)) return "builder";
  if (/dad|chapter|life/i.test(q)) return "personal";
  if (/zod|open source|oss/i.test(q)) return "oss";
  return "general";
}

function parseQAPairs(markdown, tier, sourceFile) {
  const pairs = [];
  const re =
    /\*\*(?:\d+\.\s*)?Q:\s*([\s\S]*?)\*\*\s*\n+\s*\*\*A:\s*([\s\S]*?)(?=\n\*\*(?:\d+\.\s*)?Q:|\n###|\n\*\*Refreshed|\n\*\*Top 3|$)/gi;

  let index = 0;
  for (const match of markdown.matchAll(re)) {
    const question = match[1].replace(/\s+/g, " ").trim();
    // Markdown labels are often `**A:** body` — regex consumes `**A:` and leaves a leading `**`.
    let answer = match[2].replace(/^\*+\s*/, "").trim();
    answer = answer.replace(/\n\*\*Process\/Interaction Feedback[\s\S]*$/i, "").trim();

    if (!question || !answer || question.length < 8) continue;

    const id = `${tier}-${sourceFile.replace(/\.md$/, "")}-${++index}`;
    const expectedSections = inferExpectedSections(question, tier);
    const isNarrative = NARRATIVE_PATTERN.test(question) || question.split(/\s+/).length > 18;

    pairs.push({
      id,
      question,
      idealAnswer: answer,
      tier,
      category: inferCategory(question),
      expectedSections,
      tags: [],
      isNarrative,
      sourceFile,
    });
  }
  return pairs;
}

function main() {
  const goldenPath = resolve(root, "src/data/golden-qa.md");
  const casualPath = resolve(root, "src/data/casual-qa.md");
  const outDir = resolve(root, "tests/qa");
  const outPath = resolve(outDir, "qa-golden.jsonl");

  const goldenPairs = parseQAPairs(readFileSync(goldenPath, "utf8"), "golden", "golden-qa.md");
  const casualPairs = parseQAPairs(readFileSync(casualPath, "utf8"), "casual", "casual-qa.md");

  const seen = new Set();
  const all = [];
  for (const p of [...goldenPairs, ...casualPairs]) {
    const key = p.question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(p);
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, `${all.map((p) => JSON.stringify(p)).join("\n")}\n`, "utf8");

  console.log(`✅ Wrote ${all.length} Q&A pairs → ${outPath}`);
  console.log(
    `   golden: ${goldenPairs.length}, casual: ${casualPairs.length}, with expectedSections: ${all.filter((p) => p.expectedSections.length > 0).length}`
  );
}

main();
