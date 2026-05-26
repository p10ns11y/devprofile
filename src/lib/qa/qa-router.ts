import { NARRATIVE_MIN_WORDS, NARRATIVE_QUESTION_PATTERN, OLLAMA, QA_ROUTER } from "./constants";
import type { GenerationStrategy, RetrievedChunk } from "./types";

/** Normalized Ollama base URL from `OLLAMA_BASE_URL` (server-only; set in `.env.local`). */
export function getOllamaBaseUrl(): string | undefined {
  const url = process.env.OLLAMA_BASE_URL?.trim();
  return url ? url.replace(/\/$/, "") : undefined;
}

/** Text chat model from `OLLAMA_MODEL` (default `qwen2.5:7b`). Avoid vision `-vl` models for this endpoint. */
export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || OLLAMA.DEFAULT_MODEL;
}

/** Request timeout from `OLLAMA_TIMEOUT_MS` or {@link OLLAMA.REQUEST_TIMEOUT_MS}. */
export function getOllamaTimeoutMs(): number {
  const raw = process.env.OLLAMA_TIMEOUT_MS?.trim();
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return OLLAMA.REQUEST_TIMEOUT_MS;
}

export function isOllamaAvailable(): boolean {
  return Boolean(getOllamaBaseUrl());
}

export function isNarrativeQuestion(question: string): boolean {
  const wordCount = question.trim().split(/\s+/).length;
  return NARRATIVE_QUESTION_PATTERN.test(question) || wordCount > NARRATIVE_MIN_WORDS;
}

export function chooseStrategy(
  question: string,
  context: RetrievedChunk[],
  opts: { ollamaAvailable: boolean }
): GenerationStrategy {
  if (!opts.ollamaAvailable) return "template";

  const avgSim = context.reduce((s, c) => s + c.similarity, 0) / Math.max(context.length, 1);

  if (avgSim < QA_ROUTER.LOW_CONFIDENCE_AVG_SIM || isNarrativeQuestion(question)) {
    return "ollama";
  }

  return "template";
}
