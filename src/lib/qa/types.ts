/** Profile QA index and runtime types. */

export type GenerationStrategy = "golden-match" | "template" | "ollama";

export interface RetrievedChunk {
  id?: string;
  text: string;
  section: string;
  similarity: number;
  source?: string;
}

export interface QAResponse {
  answer: string;
  details: RetrievedChunk[];
  strategy?: GenerationStrategy;
  /** Present when Ollama was selected but failed; answer came from template fallback. */
  ollamaError?: string;
}

export interface IndexChunk {
  id: string;
  text: string;
  contextualText: string;
  embedding: number[];
  section: string;
  source: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface GoldenQuestionEntry {
  id: string;
  question: string;
  idealAnswer: string;
  questionEmbedding: number[];
  tier?: string;
}

export interface Bm25Doc {
  id: string;
  tokens: string[];
}

export interface QAIndex {
  version: number;
  builtAt?: string;
  embeddingModel: string;
  chunkCount: number;
  chunks: IndexChunk[];
  goldenQuestions: GoldenQuestionEntry[];
  bm25: Bm25Doc[];
}

export interface GoldenFewShot {
  question: string;
  idealAnswer: string;
  tier?: string;
  category?: string;
}
