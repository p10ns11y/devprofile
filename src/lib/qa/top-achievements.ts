import { readFileSync } from "fs";
import { join } from "path";

let cachedMarkdown: string | null = null;

export function isAchievementsQuestion(question: string): boolean {
  const qLower = question.toLowerCase();
  return (
    /\bachievements?\b|\biggest.*achievement\b|\bwhat.*biggest\b.*\b/i.test(qLower) ||
    /\bmost.*(successful|important).*project\b|\bwhat.*most.*proud\b|\bkey.*achievement\b|\bbiggest.*win\b/i.test(
      qLower
    ) ||
    /\bmost.*(significant|notable).*contribution\b|\bproudest.*moment\b|\bcareer.*highlight\b|\btop\s*3\b/i.test(
      qLower
    )
  );
}

/** Curated top-three narrative from markdown (build-time source of truth). */
export function loadTopAchievementsMarkdown(): string {
  if (cachedMarkdown) return cachedMarkdown;

  const path = join(process.cwd(), "src/data/top-three-achievements.md");
  const raw = readFileSync(path, "utf8");
  const body = raw
    .replace(/^\*\*Top 3 Standout Achievements\*\*\s*/i, "")
    .replace(/\*\*Process\/Interaction Feedback\*\*[\s\S]*$/i, "")
    .trim();

  cachedMarkdown = body;
  return body;
}

export function getAchievementsAnswer(): string {
  const body = loadTopAchievementsMarkdown();
  return `Here are my top three standout achievements:\n\n${body}`;
}
