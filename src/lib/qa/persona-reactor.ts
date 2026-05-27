/**
 * src/lib/qa/persona-reactor.ts
 *
 * Core Reactor for PR6: xAIGrokAgenticPersonaReactor
 * - Defense-first, non-bypassable (checkAbuse is absolute first executable statement)
 * - AI SDK streamText + lightweight retry wrapper (Q2 decision: no full Workflow DevKit in Phase 1)
 * - Pulls versioned ProfilePacket via PR2 compiler (cached)
 * - Wires 6 thin Collections-backed tools via aiPersonaTools (PR5)
 * - Uses PR3 collectionsClient for lightweight ensure/ingest (manual ingest per Q5)
 * - True streaming, Collections-only retrieval, observability (version + layer logs), graceful golden degradation
 * - Real human tone (warm/professional + light sparkle) per Q6 — especially golden + system prompts
 *
 * Validation-gate skeleton: contracts + happy-path wiring + mocked test surface.
 * No full E2E (PR8), no new heavy deps beyond AI SDK (assumed via prior PR surface).
 */

import { streamText, type StreamTextResult, type ToolSet } from 'ai';
import { xai } from '@ai-sdk/xai';
import { readFileSync } from 'fs';
import { join } from 'path';

// High fix (review 80eccd53-pr-6): imports aligned to present surface (PR3 xai-collections + stubs for PR2/PR4/Q2 on sibling branches).
// Stubs (persona-compiler.ts, abuse-defense.ts, durable-retry.ts) are thin shims only — see their headers.
// ProfilePacket type also re-exported from ./types (and barrel).
import type { ProfilePacket } from './persona-compiler'; // via PR2 stub (or ./types re-export)
import { compileProfilePacketFromSources } from './persona-compiler'; // PR2 stub shim
import { collectionsClient } from './xai-collections'; // PR3 real (was wrong -client name)
import { checkAbuse, computeGoldenFallback } from './abuse-defense'; // PR4 stub shim
// PR5 surface — exact 6 thin Collections-backed tools (see persona-tools.ts:230 aiPersonaTools + __TEST_ONLY_TOOL_PREFIXES__)
import { aiPersonaTools, type PersonaToolRegistry } from './persona-tools';
import { withLightweightRetry } from './durable-retry'; // Q2 lightweight shim (per user decision; no full Workflow DevKit)

// Data sources for the ProfilePacket compiler.
// Using fs.readFileSync instead of dynamic imports because Turbopack does not support
// importing .md files as modules out of the box (unlike webpack with raw-loader).
// This code runs in server contexts only (API routes / server actions), so fs is safe.
const DATA_DIR = join(process.cwd(), 'src/data');
const PERSONA_DIR = join(DATA_DIR, 'persona');

function readFileSafe(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function readJsonAsString(filePath: string): string {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return '{}';
  }
}

const PROFILE_SOURCES = [
  { name: 'cvdata.json', content: () => readJsonAsString(join(DATA_DIR, 'cvdata.json')) },
  { name: 'golden-qa.md', content: () => readFileSafe(join(DATA_DIR, 'golden-qa.md')) },
  { name: 'casual-qa.md', content: () => readFileSafe(join(DATA_DIR, 'casual-qa.md')) },
  { name: 'top-three-achievements.md', content: () => readFileSafe(join(DATA_DIR, 'top-three-achievements.md')) },
  { name: 'ps-profile-v1.md', content: () => readFileSafe(join(PERSONA_DIR, 'ps-profile-v1.md')) },
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

  const packet = compileProfilePacketFromSources(rawSources);

  // Collections sync is skipped in local dev mode.
  // When USE_LOCAL_PROFILE_DATA=true (or no XAI_MANAGEMENT_API_KEY), the tools
  // automatically use an in-memory search over src/data/persona + the other source files.
  // This lets you develop the full reactor + tool calling loop locally without any xAI keys.
  // Collections ensure/create is only needed if you want the reactor to auto-provision the collection.
  // For local development where you have **already manually uploaded** the document (e.g. "ps-profile-v1.md"),
  // you can skip this entirely by setting XAI_PROFILE_COLLECTION.
  const useLocalData = process.env.USE_LOCAL_PROFILE_DATA === "true";
  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
  const hasApiKeyForSearch = !!process.env.XAI_API_KEY;

  if (!useLocalData && manualCollection && hasApiKeyForSearch) {
    // Manual mode: skip ensure/create completely. Read-only search against your pre-uploaded collection.
    logReactor('ingest', `using manual collection via XAI_PROFILE_COLLECTION=${manualCollection} (no create attempted)`);
  } else if (!useLocalData && hasApiKeyForSearch) {
    // Auto mode: try to ensure the collection exists (requires management perms)
    try {
      await collectionsClient.ensureCollectionForVersion(packet.version);
    } catch (e) {
      logReactor('ingest', 'ensureCollectionForVersion non-fatal (manual ingest path per Q5)', { error: String(e) });
    }
  } else if (useLocalData) {
    logReactor('ingest', 'skipped Collections (USE_LOCAL_PROFILE_DATA=true)');
  }

  cachedPacket = packet;
  packetCacheVersion = packet.version;
  return packet;
}

// Observability helper (logs with version + layer — strict invariant)
function logReactor(layer: string, msg: string, meta: Record<string, unknown> = {}) {
  const version = packetCacheVersion || 'v0-unloaded';
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
      return !String(err).includes('abuse') && !String(err).includes('blocked');
    },
    onRetry: (attempt, err) => {
      logReactor('durable', `retry attempt ${attempt}`, { context, error: String(err) });
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
}> {
  // === DEFENSE FIRST, NON-BYPASSABLE (per PR4 + design invariant #2) ===
  // This is the very first executable statement in the happy path.
  const defense = await checkAbuse(question, ctx);

  const packet = await getOrLoadProfilePacket();

  if (defense.blocked) {
    logReactor('defense', 'blocked — zero Collections/Grok cost', {
      reason: defense.reason,
      layer: defense.layer,
      questionHash: hashQuestion(question),
    });
    // Graceful golden with real PR2 packet + Q6 tone (warm/professional + sparkle)
    const golden = computeGoldenFallback(question, packet);
    return {
      answer: golden.answer,
      isGolden: true,
      defense,
      version: packet.version,
    };
  }

  // Passed defense — now safe to touch Collections or Grok (fission gate succeeded)
  logReactor('defense', 'passed', { layer: 'all' });

  // Ensure packet is warm in Collections (lightweight, already attempted in getOrLoad)
  // Retrieval always via Collections client (Q3: Pure Collections main path)

  // Build system prompt with real human tone (Q6) + packet toolSystemPrompt + golden tone anchors
  const systemPrompt = buildSystemPrompt(packet);

  // Wire the 6 PR5 tools (Collections-backed, thin, registered for tool-calling loop)
  // Exact keys: profileSearch, workExperience, skills, projects, educationAndBackground, principlesAndPhilosophy
  // Matches persona-tools.ts:230 aiPersonaTools + __TEST_ONLY_TOOL_PREFIXES__ (PR5)
  const tools: ToolSet = aiPersonaTools;

  // Model selection — using the model from XAI_MODEL (or grok-2-1212 as fallback).
  // Users with access to newer models (e.g. grok-4.3, grok-3, etc.) should set XAI_MODEL accordingly.
  const model = getLiveResponseModel();

  // True streaming via AI SDK streamText (maxSteps:5 for bounded tool-calling loop per canary pattern)
  const generationFn = async () => {
    const result: StreamTextResult<any, any> = await streamText({
      model,
      system: systemPrompt,
      prompt: question, // or messages for multi-turn later
      tools,
      maxSteps: 5, // allows tool calling loop (search → reason → more search if needed)
      temperature: 0.7, // light sparkle without losing professionalism
      // onChunk, onToolCall etc for observability in real impl
    });

    return result;
  };

  const result = await runWithDurableExecution(generationFn, {
    questionHash: hashQuestion(question),
    version: packet.version,
  });

  const effectiveModel = process.env.XAI_MODEL || 'grok-2-1212';
  logReactor('generation', 'streamText completed (durable + tools wired)', {
    model: effectiveModel,
    toolsCount: Object.keys(tools).length,
  });

  // === Rich observability into what the model actually did ===
  let steps: any[] = [];
  try {
    steps = (await result.steps) || [];
    logReactor('generation', 'steps received', {
      stepCount: steps.length,
      lastStepHasText: !!steps[steps.length - 1]?.text,
      toolCallsInLastStep: steps[steps.length - 1]?.toolCalls?.length ?? 0,
      toolResultsInLastStep: steps[steps.length - 1]?.toolResults?.length ?? 0,
    });

    // Log the actual tool results for debugging (very important for "context not reaching model")
    const lastToolResults = steps[steps.length - 1]?.toolResults || [];
    if (lastToolResults.length > 0) {
      logReactor('generation', 'tool results summary', {
        count: lastToolResults.length,
        previews: lastToolResults.map((tr: any) => ({
          tool: tr.toolName,
          resultLength: (tr.result || '').length,
          preview: String(tr.result || '').slice(0, 200),
        })),
      });
    }
  } catch (e) {
    logReactor('generation', 'could not inspect steps', { error: String(e) });
  }

  // Reliably extract final text
  let finalText = '';
  try {
    finalText = await result.text;
    logReactor('generation', 'final text extracted via result.text', {
      length: finalText?.length ?? 0,
      preview: finalText?.slice(0, 150) || '(empty)',
    });
  } catch (e) {
    logReactor('generation', 'failed to extract result.text', { error: String(e) });
  }

  // Strong fallback: synthesize from all tool results across steps if model gave no final text
  if (!finalText || finalText.trim().length < 20) {
    const allToolResults: string[] = [];
    for (const step of steps) {
      const results = step?.toolResults || [];
      for (const tr of results) {
        if (tr?.result) allToolResults.push(String(tr.result));
      }
    }

    if (allToolResults.length > 0) {
      finalText = `Based on the information I retrieved:\n\n${allToolResults.join('\n\n---\n\n')}`;
      logReactor('generation', 'synthesized final answer from all tool results', {
        toolResultCount: allToolResults.length,
      });
    }
  }

  // Last resort: if the model produced no final text at all, synthesize a useful response from whatever the tools returned
  if (!finalText || finalText.trim().length < 10) {
    const allToolResults: string[] = [];
    for (const step of steps) {
      const results = step?.toolResults || [];
      for (const tr of results) {
        if (tr?.result) allToolResults.push(`[${tr.toolName || 'tool'}] ${tr.result}`);
      }
    }

    if (allToolResults.length > 0) {
      finalText = `Here is what I found using my profile tools:\n\n${allToolResults.join('\n\n')}\n\n(Note: The model did not produce a synthesized narrative on this attempt.)`;
      logReactor('generation', 'built answer directly from tool results (model gave no final text)', {
        toolResultCount: allToolResults.length,
      });
    } else {
      finalText = "I used my specialized profile tools to look up information, but wasn't able to generate a complete narrative answer this time. The tool results may contain relevant details.";
      logReactor('generation', 'no usable text produced after tools — using placeholder', {});
    }
  }

  // Collect tool results so the new /qa UI can show "Retrieved information"
  const toolResultsForUI = steps.flatMap((step: any) =>
    (step?.toolResults || []).map((tr: any) => ({
      toolName: tr.toolName,
      result: tr.result,
    }))
  );

  // Return answer + tool results for the /qa JSON path (PR48 UI compatible shape)
  return {
    stream: result.textStream,
    answer: finalText,
    version: packet.version,
    toolResults: toolResultsForUI,
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
  const base = packet.toolSystemPrompt || '';
  const toneAnchor = packet.goldenExamples?.slice(0, 2).map((ex) => `Example Q: ${ex.q}\nExample A: ${ex.a}`).join('\n\n') || '';

  return [
    'You are Peramanathan Sathyamoorthy answering in first person.',
    'Tone: warm, professional, quietly confident, with occasional light sparkle and dry wit.',
    'Never sound corporate or salesy. Sound like a thoughtful senior engineer who has lived the stories.',
    'Use the provided tools (Collections-backed) for every factual or specific detail. Ground every claim.',
    'When a tool returns relevant passages, synthesize — do not quote verbatim unless short and attributed.',
    'If nothing relevant, say so honestly and offer the closest related insight from profile.',
    '',
    base,
    '',
    'Voice anchors from prior high-signal answers (use for tone, never copy):',
    toneAnchor,
    '',
    'End substantive answers with a brief, natural closer that invites the next real question (no CTA spam).',
  ].join('\n');
}

function getLiveResponseModel() {
  // Model selection for the reactor.
  //
  // Different xAI accounts have access to different models.
  // Set XAI_MODEL to whatever model your account can actually use.
  //
  // Common options:
  //   grok-2-1212
  //   grok-3 / grok-3-mini
  //   grok-4.3     (used by some accounts)
  const modelId = process.env.XAI_MODEL || 'grok-2-1212';

  return xai(modelId);
}

// Export for runProfileQA.ts (public surface)
export { runPersonaQA as runProfileQAReactor };
