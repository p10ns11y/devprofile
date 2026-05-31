import type { RetrievedChunk, SearchResult } from "../types";

const TOOL_SECTION_LABELS: Record<string, string> = {
  profileSearch: "Profile",
  workExperience: "Work experience",
  skills: "Skills",
  projects: "Projects",
  educationAndBackground: "Education & background",
  principlesAndPhilosophy: "Principles & philosophy",
};

/** Map raw search scores (xAI can exceed 1.0) to 0–1 for the UI percentage display. */
export function normalizeScoresToSimilarity(
  chunks: Array<{ score?: number }>
): number[] {
  const raw = chunks.map((c) =>
    typeof c.score === "number" && c.score > 0 ? c.score : 0
  );
  const max = Math.max(...raw);
  if (max <= 0) {
    return chunks.map((_, i) => Math.max(0.25, 1 - i * 0.12));
  }
  return raw.map((s, i) => {
    if (s > 0) return Math.min(1, s / max);
    return Math.max(0.25, 1 - i * 0.12);
  });
}

function sectionFromChunk(
  toolName: string,
  metadata?: Record<string, unknown>
): string {
  const metaSection = metadata?.section;
  if (typeof metaSection === "string" && metaSection.trim()) {
    return metaSection.trim();
  }
  return TOOL_SECTION_LABELS[toolName] ?? toolName;
}

export function searchResultToDetails(
  result: SearchResult,
  toolName: string
): RetrievedChunk[] {
  const nonEmpty = result.chunks.filter((chunk) => (chunk.text || "").trim().length > 0);
  const sims = normalizeScoresToSimilarity(nonEmpty);
  return nonEmpty.map((chunk, i) => ({
    text: chunk.text.trim().slice(0, 2000),
    section: sectionFromChunk(toolName, chunk.metadata),
    similarity: sims[i] ?? 0.5,
    source: toolName,
  }));
}

/** Dedupe by text prefix; keep highest similarity; cap for UI panel. */
export function mergeRetrievedChunks(
  batches: RetrievedChunk[],
  max = 8
): RetrievedChunk[] {
  const byKey = new Map<string, RetrievedChunk>();
  for (const chunk of batches) {
    const key = chunk.text.slice(0, 120).trim();
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev || chunk.similarity > prev.similarity) {
      byKey.set(key, chunk);
    }
  }
  return [...byKey.values()]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, max);
}
