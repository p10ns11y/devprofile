/**
 * Evaluate retrieval (and light context faithfulness) against qa-golden.jsonl.
 * Uses qa-index.json when present; otherwise reports missing index.
 * Run: npm run qa:eval
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const TOP_K = 5;
const RRF_K = 60;
const BM25_K1 = 1.2;
const BM25_B = 0.75;

const SALIENT_TERM =
  /\b([A-Z][a-z]{2,}(?:[-'][A-Za-z]+)?|Oneflow|premflow|Zod|Omarchy|Playwright|TypeScript|React(?:JS)?|Ollama|LangChain|Chroma|EEaaS)\b/g;

function cosineSimilarity(a, b) {
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

function sectionMatches(retrievedSection, expected) {
  const r = retrievedSection.toLowerCase();
  return expected.some((e) => {
    const x = e.toLowerCase();
    return r.includes(x) || x.includes(r) || r.startsWith(x) || x.startsWith(r);
  });
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function buildBm25Stats(index) {
  const docs = index.bm25 ?? [];
  const N = docs.length;
  const avgdl = docs.reduce((sum, d) => sum + d.tokens.length, 0) / Math.max(docs.length, 1);
  const df = new Map();
  for (const doc of docs) {
    const seen = new Set();
    for (const t of doc.tokens) {
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
  }
  return { N, avgdl, df };
}

function bm25Score(queryTokens, docTokens, stats) {
  const tf = new Map();
  for (const t of docTokens) tf.set(t, (tf.get(t) ?? 0) + 1);
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

function hybridRetrieve(index, queryVec, question, k) {
  if (!index.bm25?.length) {
    const scored = index.chunks.map((chunk, i) => ({
      index: i,
      similarity: cosineSimilarity(queryVec, chunk.embedding),
      section: chunk.section,
      source: chunk.source,
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, k);
  }

  const idToIndex = new Map(index.chunks.map((c, i) => [c.id, i]));
  const queryTokens = tokenize(question);
  const stats = buildBm25Stats(index);

  const vectorRanked = index.chunks
    .map((chunk, i) => ({ index: i, similarity: cosineSimilarity(queryVec, chunk.embedding) }))
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

  const fused = new Map();
  for (const ranks of [vectorRanked, bm25Ranked]) {
    for (let rank = 0; rank < ranks.length; rank++) {
      const idx = ranks[rank];
      fused.set(idx, (fused.get(idx) ?? 0) + 1 / (RRF_K + rank + 1));
    }
  }

  return [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([chunkIndex]) => {
      const chunk = index.chunks[chunkIndex];
      return {
        index: chunkIndex,
        similarity: cosineSimilarity(queryVec, chunk.embedding),
        section: chunk.section,
        source: chunk.source,
      };
    });
}

async function embedQuery(extractor, question) {
  const output = await extractor(question, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

function recallAtK(retrieved, expectedSections, k) {
  if (!expectedSections?.length) return null;
  const top = retrieved.slice(0, k);
  return top.some((r) => sectionMatches(r.section, expectedSections));
}

function extractSalientTerms(text) {
  const terms = new Set();
  for (const m of text.matchAll(SALIENT_TERM)) {
    if (m[1].length > 2) terms.add(m[1]);
  }
  return [...terms].slice(0, 15);
}

/** Light check: salient terms in ideal answer should appear in retrieved chunk text. */
function contextFaithfulness(idealAnswer, retrieved, index) {
  const contextText = retrieved.map((r) => index.chunks[r.index]?.text ?? "").join(" ");
  const terms = extractSalientTerms(idealAnswer);
  const missing = terms.filter((t) => !contextText.toLowerCase().includes(t.toLowerCase()));
  return { termsChecked: terms.length, missing };
}

async function main() {
  const goldenPath = resolve(root, "tests/qa/qa-golden.jsonl");
  const indexPath = resolve(root, "src/data/qa-index.json");

  if (!existsSync(goldenPath)) {
    console.error("Missing qa-golden.jsonl — run: npm run parse-golden-qa");
    process.exit(1);
  }
  if (!existsSync(indexPath)) {
    console.error("Missing qa-index.json — run: npm run build-qa-index");
    process.exit(1);
  }

  const golden = readFileSync(goldenPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  console.log(
    `Evaluating ${golden.length} golden questions against index v${index.version} (${index.chunkCount} chunks)\n`
  );

  const { pipeline } = await import("@huggingface/transformers");
  const extractor = await pipeline("feature-extraction", index.embeddingModel);

  let tagged = 0;
  let hit3 = 0;
  let hit5 = 0;
  const failures = [];
  const faithfulnessFlags = [];

  for (const row of golden) {
    const queryVec = await embedQuery(extractor, row.question);
    const retrieved = hybridRetrieve(index, queryVec, row.question, TOP_K);

    if (row.idealAnswer) {
      const faith = contextFaithfulness(row.idealAnswer, retrieved, index);
      if (faith.missing.length > 0 && faith.termsChecked > 0) {
        faithfulnessFlags.push({
          id: row.id,
          missingTerms: faith.missing,
          question: row.question.slice(0, 72),
        });
      }
    }

    if (row.expectedSections?.length) {
      tagged++;
      const r3 = recallAtK(retrieved, row.expectedSections, 3);
      const r5 = recallAtK(retrieved, row.expectedSections, 5);
      if (r3) hit3++;
      if (r5) hit5++;
      if (!r5) {
        failures.push({
          id: row.id,
          question: row.question.slice(0, 80),
          expected: row.expectedSections,
          got: retrieved.slice(0, 3).map((r) => r.section),
        });
      }
    }
  }

  const recall3Pct = tagged ? ((hit3 / tagged) * 100).toFixed(1) : "n/a";
  const recall5Pct = tagged ? ((hit5 / tagged) * 100).toFixed(1) : "n/a";

  console.log("── Retrieval (hybrid RRF) ──");
  console.log(`  recall@3: ${recall3Pct}% (${hit3}/${tagged} tagged)`);
  console.log(`  recall@5: ${recall5Pct}% (${hit5}/${tagged} tagged)`);
  console.log(`  target:   recall@5 ≥ 85% on tagged subset`);

  if (faithfulnessFlags.length > 0) {
    console.log(
      `\n── Context faithfulness (ideal vs retrieved, ${faithfulnessFlags.length} flagged) ──`
    );
    for (const f of faithfulnessFlags.slice(0, 5)) {
      console.log(`  [${f.id}] missing in top-${TOP_K} context: ${f.missingTerms.join(", ")}`);
    }
  } else {
    console.log("\n── Context faithfulness ──");
    console.log("  no salient-term gaps in top-5 retrieved text");
  }

  if (failures.length > 0) {
    console.log(`\n── Sample failures (${Math.min(5, failures.length)} of ${failures.length}) ──`);
    for (const f of failures.slice(0, 5)) {
      console.log(`  [${f.id}] ${f.question}…`);
      console.log(`    expected: ${f.expected.join(", ")}`);
      console.log(`    got:      ${f.got.join(", ")}`);
    }

    const failuresPath = resolve(root, "tests/qa/last-failures.json");
    writeFileSync(
      failuresPath,
      JSON.stringify({ at: new Date().toISOString(), failures }, null, 2) + "\n",
      "utf8"
    );
    console.log(`\n📄 Failures: tests/qa/last-failures.json`);
  }

  const reportPath = resolve(root, "tests/qa/last-eval-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        tagged,
        recallAt3: hit3 / Math.max(tagged, 1),
        recallAt5: hit5 / Math.max(tagged, 1),
        faithfulnessFlags: faithfulnessFlags.slice(0, 20),
        failures: failures.slice(0, 20),
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  console.log(`\n📄 Report: tests/qa/last-eval-report.json`);

  const strict = process.env.QA_EVAL_STRICT === "1";
  const pass = tagged > 0 && hit5 / tagged >= 0.85;
  if (!pass && tagged > 0) {
    console.log(
      `\n⚠️  recall@5 below 85% gate${strict ? "" : " (set QA_EVAL_STRICT=1 to fail CI)"}`
    );
    if (strict) process.exitCode = 1;
  } else if (tagged === 0) {
    console.log("\n⚠️  No tagged expectedSections — add heuristics in parse-golden-qa.mjs");
  } else {
    console.log("\n✅ recall@5 gate passed");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
