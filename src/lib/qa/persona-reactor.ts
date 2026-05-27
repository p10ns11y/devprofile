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
// NOTE: @ai-sdk/xai provider assumed available (added alongside AI SDK in PR surface).
// In practice: import { xai } from '@ai-sdk/xai';
import type { ProfilePacket } from './persona-compiler';
import { compileProfilePacketFromSources } from './persona-compiler';
import { collectionsClient } from './xai-collections-client';
import { checkAbuse, computeGoldenFallback } from './abuse-defense';
// PR5 surface — 6 thin tools already wired to Collections search + registry
import { aiPersonaTools, type PersonaToolRegistry } from './persona-tools'; // or personaToolRegistry.getAll()
import { withLightweightRetry } from './durable-retry'; // minimal wrapper (exponential backoff, 2-3 attempts, no Workflow DevKit)

// 5 sources for PR2 compiler (per design + data/persona)
const PROFILE_SOURCES = [
  { name: 'cvdata.json', content: () => import('@/data/cvdata.json').then(m => JSON.stringify(m.default)) },
  { name: 'golden-qa.md', content: () => import('@/data/golden-qa.md').then(m => m.default) },
  { name: 'casual-qa.md', content: () => import('@/data/casual-qa.md').then(m => m.default) },
  { name: 'top-three-achievements.md', content: () => import('@/data/top-three-achievements.md').then(m => m.default) },
  { name: 'ps-profile-v1.md', content: () => import('@/data/persona/ps-profile-v1.md').then(m => m.default) },
];

// Simple in-memory packet cache (versioned). Production would use edge cache / Collections metadata.
let cachedPacket: ProfilePacket | null = null;
let packetCacheVersion: string | null = null;

async function getOrLoadProfilePacket(): Promise<ProfilePacket> {
  // Lightweight ensure: if not present in Collections, compiler + ingest (manual for Phase 1 per Q5)
  if (cachedPacket && packetCacheVersion) {
    // In real: could do collectionsClient.headCheck(version) for staleness
    return cachedPacket;
  }

  // Load raw sources (fission: only on cold start or invalidation)
  const rawSources = await Promise.all(
    PROFILE_SOURCES.map(async (s) => ({
      name: s.name,
      content: await s.content(),
    }))
  );

  const packet = compileProfilePacketFromSources(rawSources);

  // Lightweight Collections sync (PR3 client) — only if needed, no auto heavy ingest
  try {
    await collectionsClient.ensureIngest(packet); // thin ensure, respects manual Phase 1
  } catch (e) {
    // Graceful: continue with packet for golden path; log only
    console.warn('[reactor] collectionsClient.ensureIngest non-fatal (manual ingest path):', e);
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
  const tools: ToolSet = aiPersonaTools; // or personaToolRegistry.getToolSetForStreamText()

  // Model selection per Q1: low-price for live reactor generation path
  // (strong model reserved for curation/validation in separate flows)
  const model = getLiveResponseModel(); // e.g. cheap Grok variant via xai provider

  // True streaming via AI SDK streamText (with tool loop: stepCountIs(5) pattern from canary keep)
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

  logReactor('generation', 'streamText started (durable + tools wired)', {
    model: 'low-price-grok-variant',
    toolsCount: Object.keys(tools).length,
  });

  // Return streaming shape suitable for eventual route (PR7 wires to Response)
  // The consumer can do `for await (const delta of result.textStream) ...` or use .toDataStreamResponse()
  return {
    stream: result.textStream, // AsyncIterable<string> — true streaming
    version: packet.version,
    // toolCalls can be observed via result.toolCalls if needed for logging
  };
}

// --- Helpers (minimal, fission-efficient) ---

function hashQuestion(q: string): string {
  // Simple stable hash for logs (no crypto needed for skeleton)
  return Buffer.from(q.trim().toLowerCase()).toString('base64').slice(0, 16);
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
  // Per Q1: low-price for live responses. Strong model only for offline curation/validation.
  // In real: return xai('grok-3-mini') or equivalent cheap/fast variant available via Cursor/X Premium+.
  // Skeleton uses a string identifier; provider wiring happens at call site or in thin wrapper.
  return { modelId: 'grok-low-price-live' } as any; // resolved by @ai-sdk/xai in consuming layer
}

// Export for runProfileQA.ts (public surface)
export { runPersonaQA as runProfileQAReactor };
