/**
 * Default Grok chat model when `XAI_MODEL` is unset (local + Vercel).
 * Override in `.env.local` / Vercel — must match a model your xAI account can call.
 * @see https://docs.x.ai/docs/models
 */
export const XAI = {
  DEFAULT_CHAT_MODEL: "grok-4-1-fast-reasoning",
  /**
   * Cap Grok completion length per step (~300 words). xAI allows much higher;
   * profile QA should give essence, not essays. Override: XAI_MAX_OUTPUT_TOKENS.
   */
  DEFAULT_MAX_OUTPUT_TOKENS: 400,
  MIN_MAX_OUTPUT_TOKENS: 128,
  MAX_MAX_OUTPUT_TOKENS: 2048,
  DEFAULT_TEMPERATURE: 0.45,
  /** Maps to providerOptions.xai.reasoningEffort (low | high on chat API). */
  DEFAULT_REASONING_EFFORT: "low",
} as const;

/** Profile QA routing and matching thresholds (tune via `pnpm qa:eval`). */
export const QA_ROUTER = {
  /** Average retrieval similarity below this → prefer Ollama when available. */
  LOW_CONFIDENCE_AVG_SIM: 0.65,
  /** Question ↔ golden question cosine similarity at or above this → return curated answer. */
  GOLDEN_MATCH_THRESHOLD: 0.87,
  /** Keyword overlap fallback when embeddings unavailable (serverless). */
  GOLDEN_KEYWORD_THRESHOLD: 0.6,
  /**
   * Top retrieved chunk in "Golden Q&A" at or above this → return curated idealAnswer
   * even when question-embed match is lower (fixes intro template vs 67% panel mismatch).
   */
  GOLDEN_RETRIEVAL_MIN_SIM: 0.65,
  GOLDEN_MATCH_TUNE_MIN: 0.85,
  GOLDEN_MATCH_TUNE_MAX: 0.92,
  RETRIEVAL_TOP_K: 5,
} as const;

export const NARRATIVE_QUESTION_PATTERN =
  /\b(why|how do you think|what's your view|compare|reflect|philosophy|trade-?off|biggest lesson|walk me through|tell me about)\b/i;

export const NARRATIVE_MIN_WORDS = 18;

/** Ollama generation limits (text-only profile QA — avoid vision models like qwen3-vl). */
export const OLLAMA = {
  DEFAULT_MODEL: "qwen2.5:7b",
  REQUEST_TIMEOUT_MS: 120_000,
  /** Max tokens to generate per answer (`options.num_predict`). */
  MAX_PREDICT_TOKENS: 512,
  /** Retrieved chunks sent to Ollama (retrieval still uses {@link QA_ROUTER.RETRIEVAL_TOP_K}). */
  CONTEXT_TOP_K: 3,
  /** Cap retrieved chunk text sent in the prompt. */
  MAX_CONTEXT_CHARS_PER_CHUNK: 500,
  FEW_SHOT_COUNT: 1,
  FEW_SHOT_MAX_ANSWER_CHARS: 200,
} as const;
