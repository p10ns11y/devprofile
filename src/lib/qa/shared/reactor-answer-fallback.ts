import { parseIdealAnswerFromGoldenChunk } from "../golden-routing";
import type { RetrievedChunk } from "../types";

/** Last-resort copy when Grok returns no text and no tool output was captured. */
export const REACTOR_EMPTY_NARRATIVE_PLACEHOLDER =
  "I used my specialized profile tools to look up information, but wasn't able to generate a complete narrative answer this time. The tool results may contain relevant details.";

export function isReactorEmptyNarrativePlaceholder(answer: string): boolean {
  return answer.trim() === REACTOR_EMPTY_NARRATIVE_PLACEHOLDER;
}

/**
 * Build a visitor-facing answer from structured retrieval chunks (preflight or tools)
 * when the model produced no narrative text.
 */
export function synthesizeAnswerFromRetrievedChunks(
  chunks: RetrievedChunk[],
  opts?: { maxChunks?: number }
): string | null {
  const meaningful = chunks.filter((c) => (c.text?.trim().length ?? 0) > 30);
  if (!meaningful.length) return null;

  const ranked = [...meaningful].sort((a, b) => b.similarity - a.similarity);
  for (const chunk of ranked) {
    const golden = parseIdealAnswerFromGoldenChunk(chunk.text);
    if (golden) return golden;
  }

  const top = ranked.slice(0, opts?.maxChunks ?? 2);
  const parts = top.map((c) => {
    const label = c.section?.trim() ? `**${c.section}**\n` : "";
    return `${label}${c.text.trim().slice(0, 2000)}`;
  });
  return `Based on my profile materials:\n\n${parts.join("\n\n")}`;
}
