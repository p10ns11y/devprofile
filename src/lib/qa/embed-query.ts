import type { QAIndex } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: transformers pipeline typing
type Extractor = any;

let extractor: Extractor | null = null;
let loadedModel: string | null = null;
let embedUnavailable = false;

/** Lazy-load MiniLM (or index model) for query embeddings only. */
export async function embedQuery(text: string, model: string): Promise<number[]> {
  if (embedUnavailable) {
    throw new Error("embeddings unavailable");
  }

  try {
    if (!extractor || loadedModel !== model) {
      const { pipeline } = await import("@huggingface/transformers");
      extractor = await pipeline("feature-extraction", model);
      loadedModel = model;
    }

    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as number[]);
  } catch (error) {
    embedUnavailable = true;
    extractor = null;
    loadedModel = null;
    throw error;
  }
}

/**
 * Embed the question for hybrid retrieval. Returns null when @huggingface/transformers
 * cannot load (e.g. missing libonnxruntime in serverless production) so callers can
 * fall back to BM25-only retrieval without crashing the route.
 */
export async function embedQueryForIndex(
  index: QAIndex,
  question: string
): Promise<number[] | null> {
  try {
    return await embedQuery(question, index.embeddingModel);
  } catch (error) {
    console.warn(
      "[profile-qa] @huggingface/transformers unavailable; using BM25-only retrieval",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/** Reset embed state (tests). */
export function resetEmbedQueryState(): void {
  embedUnavailable = false;
  extractor = null;
  loadedModel = null;
}
