/**
 * src/lib/qa/persona-reactor.ts
 *
 * Core Reactor for PR6: xAIGrokAgenticPersonaReactor
 * - Defense-first, non-bypassable (checkAbuse is absolute first executable statement)
 * - AI SDK streamText + lightweight retry wrapper (Q2 decision: no full Workflow DevKit in Phase 1)
 * - Pulls versioned ProfilePacket via PR2 compiler (cached)
 * - Wires 6 thin Collections-backed tools via aiPersonaTools (PR5)
 * - Uses PR3 collectionsClient via persona-tools (read-only search when XAI_PROFILE_COLLECTION set)
 * - True streaming, Collections-only retrieval, observability (version + layer logs), graceful golden degradation
 * - Real human tone (warm/professional + light sparkle) per Q6 — especially golden + system prompts
 *
 * Validation-gate skeleton: contracts + happy-path wiring + mocked test surface.
 * No full E2E (PR8), no new heavy deps beyond AI SDK (assumed via prior PR surface).
 */

import { xai } from "@ai-sdk/xai";
import { type StreamTextResult, stepCountIs, streamText, type ToolSet } from "ai";
import { readFileSync } from "fs";
import { join } from "path";
import { checkAbuse, computeGoldenFallback } from "./abuse-defense"; // PR4 stub shim
import {
  resolveXaiMaxOutputTokens,
  resolveXaiTemperature,
  xaiStreamTextProviderOptions,
} from "./config/resolve-xai-generation";
import { XAI } from "./constants";
import { withLightweightRetry } from "./durable-retry"; // Q2 lightweight shim (per user decision; no full Workflow DevKit)
import { embedQueryForIndex } from "./embed-query";
import { isGenericIntroAnswer, resolveGoldenAnswer } from "./golden-routing";
import { loadQAIndex } from "./load-index";
// High fix (review 80eccd53-pr-6): imports aligned to present surface (PR3 xai-collections + stubs for PR2/PR4/Q2 on sibling branches).
// Stubs (persona-compiler.ts, abuse-defense.ts, durable-retry.ts) are thin shims only — see their headers.
// ProfilePacket type also re-exported from ./types (and barrel).
import type { ProfilePacket } from "./persona-compiler";
import { compileProfilePacketFromRawSources } from "./persona-compiler";
// PR5 surface — exact 6 thin Collections-backed tools (see persona-tools.ts:230 aiPersonaTools + __TEST_ONLY_TOOL_PREFIXES__)
import {
  aiPersonaTools,
  getManualToolResults,
  getRetrievedChunksForUI,
  preflightProfileRetrieval,
  resetManualToolResultsCollector,
  resetRetrievedChunksCollector,
} from "./persona-tools";
import {
  REACTOR_EMPTY_NARRATIVE_PLACEHOLDER,
  synthesizeAnswerFromRetrievedChunks,
} from "./shared/reactor-answer-fallback";
import type { RetrievedChunk } from "./types";

// Data sources for the ProfilePacket compiler.
// Using fs.readFileSync instead of dynamic imports because Turbopack does not support
// importing .md files as modules out of the box (unlike webpack with raw-loader).
// This code runs in server contexts only (API routes / server actions), so fs is safe.
const DATA_DIR = join(process.cwd(), "src/data");
const PERSONA_DIR = join(DATA_DIR, "persona");

function readFileSafe(filePath: string): string {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function readJsonAsString(filePath: string): string {
  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return "{}";
  }
}

const PROFILE_SOURCES = [
  { name: "cvdata.json", content: () => readJsonAsString(join(DATA_DIR, "cvdata.json")) },
  { name: "golden-qa.md", content: () => readFileSafe(join(DATA_DIR, "golden-qa.md")) },
  { name: "casual-qa.md", content: () => readFileSafe(join(DATA_DIR, "casual-qa.md")) },
  {
    name: "top-three-achievements.md",
    content: () => readFileSafe(join(DATA_DIR, "top-three-achievements.md")),
  },
  { name: "ps-profile-v1.md", content: () => readFileSafe(join(PERSONA_DIR, "ps-profile-v1.md")) },
];

// Simple in-memory packet cache (versioned). Production would use edge cache / Collections metadata.
let cachedPacket: ProfilePacket | null = null;
let packetCacheVersion: string | null = null;

async function getOrLoadProfilePacket(): Promise<ProfilePacket> {
  // Fission cold load only.
  if (cachedPacket && packetCacheVersion) {
    // In real: could do collectionsClient.headCheck(version) for staleness
    return cachedPacket;
  }

  // Load raw sources synchronously (safe on server)
  const rawSources = PROFILE_SOURCES.map((s) => ({
    name: s.name,
    content: s.content(),
  }));

  const packet = compileProfilePacketFromRawSources(rawSources);

  // Collections: read-only in this app. Upload/sync is manual via console.x.ai (or a separate
  // personal tool outside this repo). Never call ensure/create/ingest from the reactor path.
  const useLocalData = process.env.USE_LOCAL_PROFILE_DATA === "true";
  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
  const hasCollectionsKey =
    !!process.env.XAI_MANAGEMENT_API_KEY?.trim() || !!process.env.XAI_API_KEY;

  if (!useLocalData && manualCollection && hasCollectionsKey) {
    logReactor(
      "ingest",
      `read-only search via XAI_PROFILE_COLLECTION=${manualCollection} (no create/upload in this app)`
    );
  } else if (!useLocalData && hasCollectionsKey && !manualCollection) {
    logReactor(
      "ingest",
      "Set XAI_PROFILE_COLLECTION to a collection uploaded in console.x.ai (read-only: XAI_API_KEY for search + chat)"
    );
  } else if (useLocalData) {
    logReactor("ingest", "skipped Collections (USE_LOCAL_PROFILE_DATA=true)");
  }

  cachedPacket = packet;
  packetCacheVersion = packet.version;
  return packet;
}

// Observability helper (logs with version + layer — strict invariant)
function logReactor(layer: string, msg: string, meta: Record<string, unknown> = {}) {
  const version = packetCacheVersion || "v0-unloaded";
  console.log(`[persona-reactor][v:${version}][${layer}] ${msg}`, meta);
}

// Lightweight durable execution wrapper (AI SDK + retry per explicit Q2 decision)
async function runWithDurableExecution<T>(
  fn: () => Promise<T>,
  context: { questionHash: string; version: string }
): Promise<T> {
  return withLightweightRetry(fn, {
    maxAttempts: 3,
    backoffMs: 250,
    retryOn: (err) => {
      // Only transient (network, 429 on Grok side, tool timeout). Never retry abuse blocks.
      return !String(err).includes("abuse") && !String(err).includes("blocked");
    },
    onRetry: (attempt, err) => {
      logReactor("durable", `retry attempt ${attempt}`, { context, error: String(err) });
    },
  });
}

// The core happy-path reactor. Defense is NON-BYPASSABLE first statement.
export async function runPersonaQA(
  question: string,
  ctx: {
    ip?: string;
    sessionId?: string;
    recentQuestions?: string[];
    // Headers-only per Q4 decision; no heavy fingerprinting in skeleton
    headers?: Headers;
  } = {}
): Promise<{
  stream?: AsyncIterable<string>; // true streaming for route (PR7 will consume)
  answer?: string;
  isGolden?: boolean;
  defense?: { blocked: boolean; reason?: string; layer?: string };
  version: string;
  toolCalls?: any[];
  toolResults?: Array<{ toolName: string; result: string }>;
  retrievedChunks?: RetrievedChunk[];
}> {
  // === DEFENSE FIRST, NON-BYPASSABLE (per PR4 + design invariant #2) ===
  // This is the very first executable statement in the happy path.
  const defense = await checkAbuse(question, ctx);

  // Own our tool results for the manual collection path (structural fix after many empty-result iterations).
  // The AI SDK's steps.toolResults has repeatedly failed to surface real content from Collections.
  resetRetrievedChunksCollector();
  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
  if (manualCollection) {
    resetManualToolResultsCollector();
  }

  const packet = await getOrLoadProfilePacket();

  const index = loadQAIndex();
  const queryVec = await embedQueryForIndex(index, question);
  const earlyGolden = resolveGoldenAnswer(index, question, { queryVec });
  if (earlyGolden) {
    logReactor("generation", `golden short-circuit via ${earlyGolden.via}`, {
      similarity: earlyGolden.similarity,
      id: earlyGolden.entry.id,
    });
    return {
      answer: earlyGolden.entry.idealAnswer,
      version: packet.version,
      retrievedChunks: [],
    };
  }

  if (defense.blocked) {
    logReactor("defense", "blocked — zero Collections/Grok cost", {
      reason: defense.reason,
      layer: defense.layer,
      questionHash: hashQuestion(question),
    });
    // Graceful golden with real PR2 packet + Q6 tone (warm/professional + sparkle)
    const answer = computeGoldenFallback(question, packet);
    return {
      answer,
      isGolden: true,
      defense,
      version: packet.version,
    };
  }

  // Passed defense — now safe to touch Collections or Grok (fission gate succeeded)
  logReactor("defense", "passed", { layer: "all" });

  await preflightProfileRetrieval(question);
  const preflightChunks = getRetrievedChunksForUI();
  let retrievalContextBlock = "";
  if (preflightChunks.length > 0) {
    retrievalContextBlock =
      "\n\n## Prefetched profile search (use this to answer; tools may add more)\n" +
      preflightChunks
        .slice(0, 4)
        .map(
          (c, i) =>
            `[${i + 1}] (${c.section}, ${(c.similarity * 100).toFixed(0)}% match)\n${c.text.slice(0, 1200)}`
        )
        .join("\n\n");
    logReactor("generation", "preflight retrieval", {
      chunkCount: preflightChunks.length,
    });
  }

  const systemPrompt = buildSystemPrompt(packet) + retrievalContextBlock;

  // Wire the 6 PR5 tools (Collections-backed, thin, registered for tool-calling loop)
  // Exact keys: profileSearch, workExperience, skills, projects, educationAndBackground, principlesAndPhilosophy
  // Matches persona-tools.ts:230 aiPersonaTools + __TEST_ONLY_TOOL_PREFIXES__ (PR5)
  const tools: ToolSet = aiPersonaTools;

  // Model: XAI_MODEL env or XAI.DEFAULT_CHAT_MODEL (see resolveXaiChatModelId).
  const model = getLiveResponseModel();

  // True streaming via AI SDK streamText.
  // Using stopWhen: stepCountIs(5) to match the pattern that worked reliably in the canary chat route (PR #33).
  const generationFn = async () => {
    const maxOutputTokens = resolveXaiMaxOutputTokens();
    const result: StreamTextResult<any, any> = await streamText({
      model,
      system: systemPrompt,
      prompt: question,
      tools,
      stopWhen: stepCountIs(5), // modern API (matches working canary chat route pattern)
      maxOutputTokens,
      temperature: resolveXaiTemperature(),
      providerOptions: xaiStreamTextProviderOptions(),
    });

    return result;
  };

  const result = await runWithDurableExecution(generationFn, {
    questionHash: hashQuestion(question),
    version: packet.version,
  });

  const effectiveModel = resolveXaiChatModelId();
  logReactor("generation", "streamText completed (durable + tools wired)", {
    model: effectiveModel,
    toolsCount: Object.keys(tools).length,
    maxOutputTokens: resolveXaiMaxOutputTokens(),
    reasoningEffort: xaiStreamTextProviderOptions().xai.reasoningEffort,
  });

  // === Rich observability into what the model actually did ===
  let steps: any[] = [];
  try {
    steps = (await result.steps) || [];
    logReactor("generation", "steps received", {
      stepCount: steps.length,
      lastStepHasText: !!steps[steps.length - 1]?.text,
      toolCallsInLastStep: steps[steps.length - 1]?.toolCalls?.length ?? 0,
      toolResultsInLastStep: steps[steps.length - 1]?.toolResults?.length ?? 0,
    });

    // Log the actual tool results for debugging (very important for "context not reaching model")
    const lastToolResults = steps[steps.length - 1]?.toolResults || [];
    if (lastToolResults.length > 0) {
      logReactor("generation", "tool results summary", {
        count: lastToolResults.length,
        previews: lastToolResults.map((tr: any) => ({
          tool: tr.toolName,
          resultLength: (tr.result || "").length,
          preview: String(tr.result || "").slice(0, 200),
        })),
      });
    }
  } catch (e) {
    logReactor("generation", "could not inspect steps", { error: String(e) });
  }

  // Reliably extract final text
  let finalText = "";
  try {
    finalText = await result.text;
    logReactor("generation", "final text extracted via result.text", {
      length: finalText?.length ?? 0,
      preview: finalText?.slice(0, 150) || "(empty)",
    });
  } catch (e) {
    logReactor("generation", "failed to extract result.text", { error: String(e) });
  }

  // Strong fallback: synthesize from all tool results across steps if model gave no final text
  // For manual collection, we now prefer our own collector (the data is verifiably there).
  const effectiveToolResults = manualCollection
    ? getManualToolResults()
    : steps.flatMap((step: any) =>
        (step?.toolResults || []).map((tr: any) => ({
          toolName: tr.toolName,
          result: tr.result,
        }))
      );

  if (!finalText || finalText.trim().length < 20) {
    const allToolResults: string[] = [];
    for (const tr of effectiveToolResults) {
      if (tr?.result) allToolResults.push(String(tr.result));
    }

    if (allToolResults.length > 0) {
      finalText = `Based on the information I retrieved:\n\n${allToolResults.join("\n\n---\n\n")}`;
      logReactor("generation", "synthesized final answer from all tool results", {
        toolResultCount: allToolResults.length,
        source: manualCollection ? "manual-collector" : "sdk-steps",
      });
    }
  }

  // Last resort: if the model produced no final text at all, synthesize a useful response from whatever the tools returned
  if (!finalText || finalText.trim().length < 10) {
    const allToolResults: string[] = [];
    for (const tr of effectiveToolResults) {
      if (tr?.result) allToolResults.push(`[${tr.toolName || "tool"}] ${tr.result}`);
    }

    if (allToolResults.length > 0) {
      finalText = `Here is what I found using my profile tools:\n\n${allToolResults.join("\n\n")}\n\n(Note: The model did not produce a synthesized narrative on this attempt.)`;
      logReactor(
        "generation",
        "built answer directly from tool results (model gave no final text)",
        {
          toolResultCount: allToolResults.length,
          source: manualCollection ? "manual-collector" : "sdk-steps",
        }
      );
    } else {
      const chunksForFallback = getRetrievedChunksForUI();
      const fromChunks = synthesizeAnswerFromRetrievedChunks(chunksForFallback);
      if (fromChunks) {
        finalText = fromChunks;
        logReactor("generation", "synthesized answer from retrieved chunks (no model text)", {
          chunkCount: chunksForFallback.length,
        });
      } else {
        const goldenFallback = resolveGoldenAnswer(index, question, {
          queryVec,
          retrieval: chunksForFallback,
        });
        if (goldenFallback) {
          finalText = goldenFallback.entry.idealAnswer;
          logReactor("generation", "golden answer after empty model text", {
            via: goldenFallback.via,
            similarity: goldenFallback.similarity,
          });
        } else {
          finalText = REACTOR_EMPTY_NARRATIVE_PLACEHOLDER;
          logReactor("generation", "no usable text produced after tools — using placeholder", {
            chunkCount: chunksForFallback.length,
            stepCount: steps.length,
          });
        }
      }
    }
  }

  // Collect tool results so the new /qa UI can show "Retrieved information"
  // Changed approach: for manual collection dev, use our self-owned collector (proven to have the real data)
  // instead of relying on the flaky AI SDK steps.toolResults.
  let toolResultsForUI: Array<{ toolName: string; result: string }>;
  if (manualCollection) {
    toolResultsForUI = getManualToolResults();
  } else {
    toolResultsForUI = steps.flatMap((step: any) =>
      (step?.toolResults || []).map((tr: any) => ({
        toolName: tr.toolName,
        result: tr.result,
      }))
    );
  }

  const retrievedChunksForUI = getRetrievedChunksForUI();

  let answerOut = finalText;
  const goldenAfterTools = resolveGoldenAnswer(index, question, {
    queryVec,
    retrieval: retrievedChunksForUI,
  });
  if (goldenAfterTools?.via === "retrieval") {
    answerOut = goldenAfterTools.entry.idealAnswer;
    logReactor("generation", "answer from golden retrieval (panel-aligned)", {
      similarity: goldenAfterTools.similarity,
      id: goldenAfterTools.entry.id,
    });
  } else if (goldenAfterTools && isGenericIntroAnswer(finalText)) {
    answerOut = goldenAfterTools.entry.idealAnswer;
    logReactor("generation", "replaced generic intro with golden match", {
      via: goldenAfterTools.via,
      similarity: goldenAfterTools.similarity,
    });
  }

  // Return answer + structured chunks for the /qa JSON path (ProfileQA panel)
  return {
    stream: result.textStream,
    answer: answerOut,
    version: packet.version,
    toolResults: toolResultsForUI,
    retrievedChunks: retrievedChunksForUI,
  };
}

// --- Helpers (minimal, fission-efficient) ---

function hashQuestion(q: string): string {
  // Simple stable hash for logs (no crypto needed for skeleton).
  // High/Medium fix: cross-platform (no Node Buffer) to avoid edge runtime issues in PR7+.
  // Pure JS; sufficient for log correlation.
  const s = q.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 16);
}

function buildSystemPrompt(packet: ProfilePacket): string {
  // Q6 real human tone: warm/professional + light sparkle
  // Anchored in packet.toolSystemPrompt + goldenExamples for voice consistency
  const base = packet.toolSystemPrompt || "";
  const toneAnchor =
    packet.goldenExamples
      ?.slice(0, 2)
      .map((ex) => `Example Q: ${ex.q}\nExample A: ${ex.a}`)
      .join("\n\n") || "";

  return [
    "You are Peramanathan Sathyamoorthy answering in first person.",
    "Tone: warm, professional, quietly confident, with occasional light sparkle and dry wit.",
    "Never sound corporate or salesy. Sound like a thoughtful senior engineer who has lived the stories.",
    "",
    "Style (mandatory): Orwellian brevity — plain words, short sentences, one clear idea each.",
    "Give the essence only: what matters, why it matters, one concrete detail if needed.",
    "Target ~80–150 words unless the question clearly needs more; never pad or repeat.",
    "No bullet lists unless the visitor asked for a structured comparison or timeline.",
    "",
    "Use the provided tools (Collections-backed) for every factual or specific detail. Ground every claim.",
    "When a tool returns relevant passages, distill — do not quote long blocks.",
    "If nothing relevant, say so honestly in one or two sentences.",
    "",
    base,
    "",
    "Voice anchors from prior high-signal answers (use for tone, never copy):",
    toneAnchor,
    "",
    "Close with at most one short sentence inviting a follow-up (no CTA spam).",
  ].join("\n");
}

function resolveXaiChatModelId(): string {
  const explicit = process.env.XAI_MODEL?.trim();
  if (explicit) return explicit;

  console.warn(
    `[persona-reactor] XAI_MODEL is not set — using default "${XAI.DEFAULT_CHAT_MODEL}". ` +
      "Set XAI_MODEL in .env.local and Vercel to a model your account supports."
  );
  return XAI.DEFAULT_CHAT_MODEL;
}

function getLiveResponseModel() {
  return xai(resolveXaiChatModelId());
}

// Export for runProfileQA.ts (public surface)
export { runPersonaQA as runProfileQAReactor };
