import { readFileSync } from "fs";
import { join } from "path";
import { generateAnswer } from "@/utils/qa-utils";
import { OLLAMA, QA_ROUTER } from "./constants";
import { embedQueryForIndex } from "./embed-query";
import { loadQAIndex } from "./load-index";
import { buildOllamaUserPrompt, PROFILE_QA_SYSTEM } from "./qa-prompts";
import {
  chooseStrategy,
  getOllamaBaseUrl,
  getOllamaModel,
  getOllamaTimeoutMs,
  isNarrativeQuestion,
  isOllamaAvailable,
} from "./qa-router";
import { retrieveFromIndex } from "./retrieve";
import { getAchievementsAnswer, isAchievementsQuestion } from "./top-achievements";
import type {
  GenerationStrategy,
  GoldenFewShot,
  GoldenQuestionEntry,
  QAIndex,
  QAResponse,
  RetrievedChunk,
} from "./types";

const FEW_SHOT_COUNT = OLLAMA.FEW_SHOT_COUNT;

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

export function findGoldenMatch(
  index: QAIndex,
  queryVec: number[] | null,
  question?: string
): { entry: GoldenQuestionEntry; similarity: number } | null {
  if (queryVec) {
    let best: { entry: GoldenQuestionEntry; similarity: number } | null = null;

    for (const entry of index.goldenQuestions) {
      const sim = cosineSimilarity(queryVec, entry.questionEmbedding);
      if (sim >= QA_ROUTER.GOLDEN_MATCH_THRESHOLD && (!best || sim > best.similarity)) {
        best = { entry, similarity: sim };
      }
    }

    if (best) return best;
  }

  if (!question) return null;
  return findGoldenMatchByKeyword(index, question);
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

/** Keyword fallback when query embeddings are unavailable (serverless prod). */
function findGoldenMatchByKeyword(
  index: QAIndex,
  question: string
): { entry: GoldenQuestionEntry; similarity: number } | null {
  let best: { entry: GoldenQuestionEntry; similarity: number } | null = null;

  for (const entry of index.goldenQuestions) {
    const sim = tokenOverlapScore(question, entry.question);
    if (sim >= 0.6 && (!best || sim > best.similarity)) {
      best = { entry, similarity: sim };
    }
  }

  return best;
}

function loadGoldenFewShots(): GoldenFewShot[] {
  const path = join(process.cwd(), "tests/qa/qa-golden.jsonl");
  try {
    return readFileSync(path, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as GoldenFewShot)
      .filter((row) => row.tier === "golden" || row.category);
  } catch {
    return [];
  }
}

function pickFewShots(question: string, pool: GoldenFewShot[]): GoldenFewShot[] {
  if (pool.length === 0) return [];

  const q = question.toLowerCase();
  const scored = pool.map((row) => {
    const overlap = q
      .split(/\W+/)
      .filter((w) => w.length > 3 && row.question.toLowerCase().includes(w)).length;
    return { row, overlap };
  });

  scored.sort((a, b) => b.overlap - a.overlap);
  const picked = scored.slice(0, FEW_SHOT_COUNT).map((s) => s.row);
  if (picked.length >= 2) return picked;

  return pool.slice(0, FEW_SHOT_COUNT);
}

async function generateTemplateAnswer(
  question: string,
  context: RetrievedChunk[]
): Promise<string> {
  if (isAchievementsQuestion(question)) {
    return getAchievementsAnswer();
  }

  return generateAnswer(
    question,
    context.map((c) => ({
      text: c.text,
      section: c.section,
      similarity: c.similarity,
    }))
  );
}

type OllamaAnswerResult = { answer: string; ollamaError?: string };

function formatOllamaTimeoutReason(timeoutMs: number, model: string): string {
  return (
    `Ollama request timed out after ${timeoutMs}ms (model=${model}). ` +
    "Check Ollama is running, try a smaller model, increase OLLAMA_TIMEOUT_MS, " +
    "or use template-only (unset OLLAMA_BASE_URL)."
  );
}

async function generateOllamaAnswer(
  question: string,
  context: RetrievedChunk[],
  fewShots: GoldenFewShot[]
): Promise<OllamaAnswerResult> {
  const baseUrl = getOllamaBaseUrl();
  if (!baseUrl) {
    const reason = "OLLAMA_BASE_URL is not set (add to .env.local and restart pnpm dev)";
    console.warn(`[profile-qa] Ollama skipped: ${reason}`);
    return {
      answer: await generateTemplateAnswer(question, context),
      ollamaError: reason,
    };
  }

  const model = getOllamaModel();
  const timeoutMs = getOllamaTimeoutMs();
  const ollamaContext = context.slice(0, OLLAMA.CONTEXT_TOP_K);
  const userContent = buildOllamaUserPrompt(
    question,
    ollamaContext.map((c) => ({
      section: c.section,
      text: c.text.slice(0, OLLAMA.MAX_CONTEXT_CHARS_PER_CHUNK),
    })),
    fewShots.map((f) => ({ question: f.question, idealAnswer: f.idealAnswer })),
    { fewShotMaxAnswerChars: OLLAMA.FEW_SHOT_MAX_ANSWER_CHARS }
  );

  if (process.env.OLLAMA_DEBUG === "1") {
    console.info(
      `[profile-qa] Ollama prompt chars=${userContent.length} chunks=${ollamaContext.length} model=${model}`
    );
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        stream: false,
        think: false,
        messages: [
          { role: "system", content: PROFILE_QA_SYSTEM },
          { role: "user", content: userContent },
        ],
        options: {
          num_predict: OLLAMA.MAX_PREDICT_TOKENS,
        },
      }),
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? formatOllamaTimeoutReason(timeoutMs, model)
        : error instanceof Error && error.name === "AbortError"
          ? formatOllamaTimeoutReason(timeoutMs, model)
          : error instanceof Error
            ? `Ollama request failed: ${error.message}`
            : "Ollama request failed";
    console.error(`[profile-qa] ${reason} (url=${baseUrl})`);
    return {
      answer: await generateTemplateAnswer(question, context),
      ollamaError: reason,
    };
  }

  if (!response.ok) {
    const body = await response.text();
    const reason = `Ollama HTTP ${response.status}: ${body.slice(0, 200)}`;
    console.error(`[profile-qa] ${reason} (url=${baseUrl}, model=${model})`);
    return {
      answer: await generateTemplateAnswer(question, context),
      ollamaError: reason,
    };
  }

  const data = (await response.json()) as {
    message?: { content?: string; thinking?: string };
  };
  const content = data.message?.content?.trim() || data.message?.thinking?.trim() || "";
  if (!content) {
    const reason = "Ollama returned empty content";
    console.warn(`[profile-qa] ${reason} (url=${baseUrl}, model=${model})`);
    return {
      answer: await generateTemplateAnswer(question, context),
      ollamaError: reason,
    };
  }

  return { answer: content };
}

/** Routed profile QA: golden-match → router (ollama | template). */
export async function runProfileQA(question: string): Promise<QAResponse> {
  const index = loadQAIndex();
  const queryVec = await embedQueryForIndex(index, question);
  const context = retrieveFromIndex(index, queryVec, question);

  const golden = findGoldenMatch(index, queryVec, question);
  if (golden) {
    return {
      answer: golden.entry.idealAnswer,
      details: context,
      strategy: "golden-match",
    };
  }

  const fewShotPool = loadGoldenFewShots();
  const fewShots = pickFewShots(question, fewShotPool);
  const ollamaAvailable = isOllamaAvailable();
  let strategy: GenerationStrategy = chooseStrategy(question, context, {
    ollamaAvailable,
  });

  if (strategy === "template" && !ollamaAvailable && isNarrativeQuestion(question)) {
    console.warn(
      "[profile-qa] Narrative question routed to template: OLLAMA_BASE_URL is not set. " +
        "Add OLLAMA_BASE_URL=http://127.0.0.1:11434 to .env.local and restart pnpm dev."
    );
  }

  let answer: string;
  let ollamaError: string | undefined;
  if (strategy === "ollama") {
    const ollamaResult = await generateOllamaAnswer(question, context, fewShots);
    answer = ollamaResult.answer;
    ollamaError = ollamaResult.ollamaError;
    if (ollamaError) {
      strategy = "template";
    }
  } else {
    answer = await generateTemplateAnswer(question, context);
  }

  return { answer, details: context, strategy, ...(ollamaError ? { ollamaError } : {}) };
}
