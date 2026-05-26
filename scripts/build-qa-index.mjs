/**
 * Build qa-index.json: contextual chunks + embeddings (local MiniLM).
 * Run after parse-golden-qa: pnpm build-qa-index
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { loadAllChunks } from "./build-qa-chunks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function buildBm25Docs(chunks) {
  return chunks.map((c) => ({
    id: c.id,
    tokens: tokenize(c.contextualText),
  }));
}

async function main() {
  const goldenJsonl = resolve(root, "tests/qa/qa-golden.jsonl");
  const outPath = resolve(root, "src/data/qa-index.json");

  console.log("Loading chunks…");
  const chunks = loadAllChunks(goldenJsonl);
  console.log(`  ${chunks.length} chunks (cvdata + golden + curated)`);

  console.log(`Loading embedding model ${EMBEDDING_MODEL}…`);
  const { pipeline } = await import("@huggingface/transformers");
  const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);

  const indexed = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const output = await extractor(c.contextualText, { pooling: "mean", normalize: true });
    const embedding = Array.from(output.data);

    let questionEmbedding = null;
    if (c.goldenQuestion) {
      const qOut = await extractor(c.goldenQuestion, { pooling: "mean", normalize: true });
      questionEmbedding = Array.from(qOut.data);
    }

    indexed.push({
      id: c.id,
      text: c.text,
      contextualText: c.contextualText,
      embedding,
      section: c.section,
      source: c.source,
      category: c.category,
      metadata: c.metadata,
      goldenQuestion: c.goldenQuestion ?? null,
      questionEmbedding,
      idealAnswer: c.idealAnswer ?? null,
    });

    if ((i + 1) % 20 === 0 || i === chunks.length - 1) {
      console.log(`  embedded ${i + 1}/${chunks.length}`);
    }
  }

  const goldenQuestions = indexed
    .filter((c) => c.goldenQuestion && c.questionEmbedding)
    .map((c) => ({
      id: c.metadata?.goldenId ?? c.id,
      question: c.goldenQuestion,
      idealAnswer: c.idealAnswer,
      questionEmbedding: c.questionEmbedding,
      tier: c.source,
    }));

  const index = {
    version: 1,
    builtAt: new Date().toISOString(),
    embeddingModel: EMBEDDING_MODEL,
    chunkCount: indexed.length,
    chunks: indexed.map(({ questionEmbedding, idealAnswer, goldenQuestion, ...rest }) => rest),
    goldenQuestions,
    bm25: buildBm25Docs(chunks),
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(index), "utf8");
  console.log(
    `✅ Wrote ${outPath} (${(JSON.stringify(index).length / 1024 / 1024).toFixed(2)} MB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
