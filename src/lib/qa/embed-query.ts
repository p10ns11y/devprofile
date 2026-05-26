import type { QAIndex } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: transformers pipeline typing
type Extractor = any;

let extractor: Extractor | null = null;
let loadedModel: string | null = null;

/** Lazy-load MiniLM (or index model) for query embeddings only. */
export async function embedQuery(text: string, model: string): Promise<number[]> {
  if (!extractor || loadedModel !== model) {
    const { pipeline } = await import("@huggingface/transformers");
    extractor = await pipeline("feature-extraction", model);
    loadedModel = model;
  }

  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as number[]);
}

export async function embedQueryForIndex(index: QAIndex, question: string): Promise<number[]> {
  return embedQuery(question, index.embeddingModel);
}
