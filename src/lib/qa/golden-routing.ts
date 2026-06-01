/**
 * Resolves when to return curated golden Q&A answers instead of template intro or generic Grok text.
 *
 * Two gates:
 * - Question match (embedding ≥ GOLDEN_MATCH_THRESHOLD or keyword overlap)
 * - Retrieval match (top "Golden Q&A" chunk ≥ GOLDEN_RETRIEVAL_MIN_SIM) — fixes panel/answer split
 *
 * Background: a strong Golden Q&A hit in the UI panel (e.g. 67.9% match) used to coexist with a
 * generic "Hello! I'm…" answer from `generateIntroductionAnswer()` in qa-utils because retrieval
 * and answer generation were separate. See README § "Troubleshooting: generic intro answer vs Golden Q&A panel".
 */
import { QA_ROUTER } from "./constants";
import type { GoldenQuestionEntry, QAIndex, RetrievedChunk } from "./types";

export type GoldenResolutionVia = "question-embed" | "keyword" | "retrieval";

export interface GoldenResolution {
  entry: GoldenQuestionEntry;
  similarity: number;
  via: GoldenResolutionVia;
}

const GOLDEN_SECTIONS = new Set(["golden q&a", "golden-qa"]);

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  const denom = Math.sqrt(aMag) * Math.sqrt(bMag);
  return denom === 0 ? 0 : dot / denom;
}

function tokenOverlapScore(a: string, b: string): number {
  const wordsA = new Set(
    a
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );
  const wordsB = b
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  if (wordsA.size === 0 || wordsB.length === 0) return 0;
  const shared = wordsB.filter((w) => wordsA.has(w)).length;
  return shared / Math.max(wordsA.size, wordsB.length);
}

export function isGoldenQaSection(section: string): boolean {
  return GOLDEN_SECTIONS.has(section.trim().toLowerCase());
}

/** Parse `Question: … Answer: …` chunk text from qa-index golden rows. */
export function parseIdealAnswerFromGoldenChunk(text: string): string | null {
  const match = text.match(/Answer:\s*([\s\S]+)/i);
  const answer = match?.[1]?.trim();
  return answer && answer.length > 20 ? answer : null;
}

function parseQuestionFromGoldenChunk(text: string): string | null {
  const match = text.match(/Question:\s*([\s\S]+?)\nAnswer:/i);
  return match?.[1]?.trim() || null;
}

function lookupGoldenEntry(index: QAIndex, chunk: RetrievedChunk): GoldenQuestionEntry | null {
  if (chunk.id) {
    const byId = index.goldenQuestions.find((e) => e.id === chunk.id);
    if (byId) return byId;
  }

  const chunkQuestion = parseQuestionFromGoldenChunk(chunk.text);
  if (chunkQuestion) {
    const exact = index.goldenQuestions.find((e) => e.question.trim() === chunkQuestion);
    if (exact) return exact;
  }

  return null;
}

export function findGoldenMatch(
  index: QAIndex,
  queryVec: number[] | null,
  question?: string
): GoldenResolution | null {
  if (queryVec) {
    let best: GoldenResolution | null = null;

    for (const entry of index.goldenQuestions) {
      const sim = cosineSimilarity(queryVec, entry.questionEmbedding);
      if (sim >= QA_ROUTER.GOLDEN_MATCH_THRESHOLD && (!best || sim > best.similarity)) {
        best = { entry, similarity: sim, via: "question-embed" };
      }
    }

    if (best) return best;
  }

  if (!question) return null;

  let keywordBest: GoldenResolution | null = null;
  for (const entry of index.goldenQuestions) {
    const sim = tokenOverlapScore(question, entry.question);
    if (
      sim >= QA_ROUTER.GOLDEN_KEYWORD_THRESHOLD &&
      (!keywordBest || sim > keywordBest.similarity)
    ) {
      keywordBest = { entry, similarity: sim, via: "keyword" };
    }
  }

  return keywordBest;
}

/** When hybrid retrieval surfaces Golden Q&A but question-embed match is below 0.87. */
export function findGoldenFromRetrieval(
  index: QAIndex,
  question: string,
  context: RetrievedChunk[]
): GoldenResolution | null {
  const goldenChunk = context
    .filter((c) => isGoldenQaSection(c.section))
    .sort((a, b) => b.similarity - a.similarity)[0];

  if (!goldenChunk || goldenChunk.similarity < QA_ROUTER.GOLDEN_RETRIEVAL_MIN_SIM) {
    return null;
  }

  const entry = lookupGoldenEntry(index, goldenChunk);
  if (entry) {
    return { entry, similarity: goldenChunk.similarity, via: "retrieval" };
  }

  const parsedAnswer = parseIdealAnswerFromGoldenChunk(goldenChunk.text);
  if (parsedAnswer) {
    const chunkQ = parseQuestionFromGoldenChunk(goldenChunk.text) || question;
    return {
      entry: {
        id: goldenChunk.id ?? "golden-chunk",
        question: chunkQ,
        idealAnswer: parsedAnswer,
        questionEmbedding: [],
      },
      similarity: goldenChunk.similarity,
      via: "retrieval",
    };
  }

  return null;
}

export function resolveGoldenAnswer(
  index: QAIndex,
  question: string,
  opts: { queryVec?: number[] | null; retrieval?: RetrievedChunk[] } = {}
): GoldenResolution | null {
  return (
    findGoldenMatch(index, opts.queryVec ?? null, question) ??
    (opts.retrieval?.length ? findGoldenFromRetrieval(index, question, opts.retrieval) : null)
  );
}

/** Detect generic CV intro template so agentic path can prefer golden retrieval. */
export function isGenericIntroAnswer(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    t.startsWith("hello! i'm") && t.includes("what would you like to know more about my experience")
  );
}

export function shouldPreferGoldenAnswer(modelAnswer: string, golden: GoldenResolution): boolean {
  if (golden.via !== "retrieval") return true;
  if (golden.similarity >= QA_ROUTER.GOLDEN_RETRIEVAL_MIN_SIM) {
    return isGenericIntroAnswer(modelAnswer) || modelAnswer.trim().length < 80;
  }
  return false;
}
