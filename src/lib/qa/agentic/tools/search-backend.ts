import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveAgenticRetrieval } from "@/lib/qa/config/resolve-qa-mode";
import type { SearchResult } from "@/lib/qa/types";
import { collectionsClient } from "@/lib/qa/xai-collections";

let localPacketCache: { ingestDocument: string; coreIdentity: string } | null = null;

function readFileSafe(p: string): string {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function localSearch(query: string, k = 5): SearchResult {
  if (!localPacketCache) {
    const DATA_DIR = join(process.cwd(), "src/data");
    const PERSONA_DIR = join(DATA_DIR, "persona");
    const psProfile = readFileSafe(join(PERSONA_DIR, "ps-profile-v1.md"));
    const golden = readFileSafe(join(DATA_DIR, "golden-qa.md"));
    const casual = readFileSafe(join(DATA_DIR, "casual-qa.md"));
    const top3 = readFileSafe(join(DATA_DIR, "top-three-achievements.md"));
    localPacketCache = {
      coreIdentity: psProfile,
      ingestDocument: [psProfile, golden, casual, top3].join("\n\n---\n\n"),
    };
  }

  const q = query.toLowerCase();
  const sources: Array<{ text: string; section: string }> = [
    { text: localPacketCache.coreIdentity, section: "ps-profile-v1" },
    { text: localPacketCache.ingestDocument, section: "ingest-document" },
    { text: readFileSafe(join(process.cwd(), "src/data/golden-qa.md")), section: "golden-qa" },
  ];

  const scored = sources
    .map((s) => {
      const textLower = s.text.toLowerCase();
      const score = q.split(/\s+/).reduce((acc, word) => {
        if (word.length < 3) return acc;
        return acc + (textLower.match(new RegExp(word, "g")) || []).length;
      }, 0);
      return { ...s, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const final = scored.length > 0 ? scored : sources.slice(0, k).map((s) => ({ ...s, score: 0 }));

  return {
    chunks: final.map((s) => ({
      text: s.text.slice(0, 1200),
      score: s.score > 0 ? Math.min(1, s.score / 10) : undefined,
      metadata: { section: s.section },
    })),
    citations: [],
  };
}

/** Single retrieval decision point for agentic tools (Scenario S8). */
export async function searchProfile(
  query: string,
  opts?: { k?: number; prefix?: string }
): Promise<SearchResult> {
  const k = opts?.k ?? 5;
  const shaped = opts?.prefix ? `${opts.prefix}: ${query}` : query;

  if (resolveAgenticRetrieval() === "local-profile-files") {
    return localSearch(shaped, k);
  }

  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
  const searchOpts: { k: number; filters?: { collection_ids: string[] } } = { k };
  if (manualCollection) {
    searchOpts.filters = { collection_ids: [manualCollection] };
  }
  return collectionsClient.search(shaped, searchOpts);
}
