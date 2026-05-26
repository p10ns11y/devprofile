import { QA_ROUTER } from "./constants";
import { embedQueryForIndex } from "./embed-query";
import { loadQAIndex } from "./load-index";
import type { QAIndex, RetrievedChunk } from "./types";

const RRF_K = 60;
const BM25_K1 = 1.2;
const BM25_B = 0.75;

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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function buildBm25Stats(index: QAIndex) {
  const docs = index.bm25;
  const N = docs.length;
  const avgdl = docs.reduce((sum, d) => sum + d.tokens.length, 0) / Math.max(docs.length, 1);
  const df = new Map<string, number>();

  for (const doc of docs) {
    const seen = new Set<string>();
    for (const t of doc.tokens) {
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
  }

  return { N, avgdl, df };
}

function bm25Score(
  queryTokens: string[],
  docTokens: string[],
  stats: { N: number; avgdl: number; df: Map<string, number> }
): number {
  const tf = new Map<string, number>();
  for (const t of docTokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  const dl = docTokens.length;
  let score = 0;

  for (const term of queryTokens) {
    const freq = tf.get(term) ?? 0;
    if (freq === 0) continue;

    const n = stats.df.get(term) ?? 0;
    const idf = Math.log(1 + (stats.N - n + 0.5) / (n + 0.5));
    const denom = freq + BM25_K1 * (1 - BM25_B + (BM25_B * dl) / stats.avgdl);
    score += idf * ((freq * (BM25_K1 + 1)) / denom);
  }

  return score;
}

function reciprocalRankFusion(rankLists: number[][]): Map<number, number> {
  const scores = new Map<number, number>();

  for (const ranks of rankLists) {
    for (let rank = 0; rank < ranks.length; rank++) {
      const chunkIndex = ranks[rank];
      scores.set(chunkIndex, (scores.get(chunkIndex) ?? 0) + 1 / (RRF_K + rank + 1));
    }
  }

  return scores;
}

function chunkIndexById(index: QAIndex): Map<string, number> {
  const map = new Map<string, number>();
  index.chunks.forEach((c, i) => map.set(c.id, i));
  return map;
}

/** Hybrid BM25 + dense retrieval with RRF fusion. */
export function retrieveFromIndex(
  index: QAIndex,
  queryVec: number[],
  question: string,
  topK = QA_ROUTER.RETRIEVAL_TOP_K
): RetrievedChunk[] {
  const idToIndex = chunkIndexById(index);
  const queryTokens = tokenize(question);
  const stats = buildBm25Stats(index);

  const vectorRanked = index.chunks
    .map((chunk, i) => ({
      index: i,
      similarity: cosineSimilarity(queryVec, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .map((r) => r.index);

  const bm25Ranked = index.bm25
    .map((doc) => ({
      index: idToIndex.get(doc.id) ?? -1,
      score: bm25Score(queryTokens, doc.tokens, stats),
    }))
    .filter((r) => r.index >= 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.index);

  const fused = reciprocalRankFusion([vectorRanked, bm25Ranked]);
  const sorted = [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, topK);

  const vectorSimByIndex = new Map(
    index.chunks.map((chunk, i) => [i, cosineSimilarity(queryVec, chunk.embedding)])
  );

  return sorted.map(([chunkIndex, rrfScore]) => {
    const chunk = index.chunks[chunkIndex];
    const similarity = vectorSimByIndex.get(chunkIndex) ?? 0;
    return {
      id: chunk.id,
      text: chunk.text,
      section: chunk.section,
      source: chunk.source,
      similarity: Math.max(similarity, Math.min(1, rrfScore * 10)),
    };
  });
}

/** Load index, embed question, hybrid retrieve. */
export async function retrieveContext(question: string): Promise<{
  index: QAIndex;
  queryVec: number[];
  chunks: RetrievedChunk[];
}> {
  const index = loadQAIndex();
  const queryVec = await embedQueryForIndex(index, question);
  const chunks = retrieveFromIndex(index, queryVec, question);
  return { index, queryVec, chunks };
}
