/**
 * src/lib/qa/runProfileQA.ts
 *
 * Public export surface for the xAI Profile QA Reactor (PR6 complete + PR7 wiring).
 * Thin delegation to runProfileQAReactor (defense-first, durable, Collections + tools).
 *
 * PR7: this is the single call site for the reactor path. Dual-path decision + legacy
 * preservation lives in the two live surfaces (route.ts for /api/cv/qa, actions.ts for AMA).
 * Flag hook (isQARectorEnabled) + collect/toLegacyCompatible helpers exported for them.
 *
 * When qaReactor flag (or ENABLE_XAI_REACTOR) is OFF: zero calls here, legacy executes
 * byte-for-byte in the surfaces (no behavior change, no extra logs).
 *
 * Clean, stable export for future use (direct server calls, tests, PR8 streaming UI, etc).
 *
 * Invariants (all PR6 + prior): defense first, xAI Collections sole substrate, Q1-Q6 decisions,
 * streaming + golden graceful, versioned observability.
 */

import { runProfileQAReactor } from './persona-reactor';
import { isFeatureEnabled } from '@/config/feature-flags';

// ProfilePacket type lives in ./types (re-exported via barrel + PR2 stub for consumers that need it).
// No direct use in this thin surface file.

// Legacy shape (current /api/cv/qa + qa-utils) for smooth transition
export interface LegacyQAResponse {
  answer: string;
  details?: any[];
  isGolden?: boolean;
  defense?: any;
  version?: string;
}

// Streaming-capable response (for future route that does direct streaming to client)
export interface ProfileQAResponse {
  stream?: AsyncIterable<string>;
  answer?: string;
  isGolden?: boolean;
  defense?: { blocked: boolean; reason?: string; layer?: string };
  version: string;
}

/**
 * Public API — the reactor entry point wired by PR7 dual-path (route.ts + actions.ts).
 *
 * Callers check isQARectorEnabled() (which honors qaReactor flag + ENABLE_XAI_REACTOR env).
 * When enabled: this is invoked; returns streaming shape (or golden answer) from defense-first reactor.
 * Legacy path (qa-utils + original route logic) is NEVER implemented here — it lives in callers
 * so that when flag is off the executed source is byte-for-byte identical to pre-PR7.
 *
 * ctx minimal per Q4 (headers-only for abuse + future behavioral).
 * Clean export surface for all future consumers (PR8+, direct tests, etc).
 */
export async function runProfileQA(
  question: string,
  ctx: {
    ip?: string;
    sessionId?: string;
    recentQuestions?: string[];
    headers?: Headers;
  } = {}
): Promise<ProfileQAResponse | LegacyQAResponse> {
  return runProfileQAReactor(question, ctx);
}

// Re-export the reactor core for direct use in tests / advanced consumers
export { runProfileQAReactor } from './persona-reactor';

// Type exports for consumers (PR7+)
export type { ProfileQAResponse, LegacyQAResponse };

/**
 * PR7: Dual-path feature flag + env switch (single source of truth for callers in route + actions).
 *
 * Exact per PR1 (feature-flags.ts qaReactor + lib/qa/index.ts QA_REACTOR_FLAG),
 * .env.example (ENABLE_XAI_REACTOR), and design:
 * - Off by default (qaReactor.enabled=false + env=false) → zero production risk.
 * - ENABLE_XAI_REACTOR=true is explicit dev bypass (takes precedence).
 * - When off: callers execute legacy path byte-for-byte (zero new logs, zero behavior change).
 * - When on: callers delegate to runProfileQA (reactor).
 *
 * 6 User Decisions honored (Q1 low-price live model, Q2 lightweight durable, Q3 Collections sole,
 * Q4 headers-only, Q5 manual ingest, Q6 real-human tone) via the reactor.
 */
export function isQARectorEnabled(): boolean {
  // Env override for explicit server/dev control (per .env.example)
  if (process.env.ENABLE_XAI_REACTOR === "true") {
    return true;
  }
  // The qaReactor flag (PR1). Never a magic string in decision sites.
  // Using any-cast for the key because isFeatureEnabled uses keyof typeof FEATURE_FLAGS.
  return isFeatureEnabled("qaReactor" as any);
}

// Canonical key re-export for clean consumption (future importers can use from here too)
export const QA_REACTOR_FLAG = "qaReactor" as const;

/**
 * Collects full text from either a pre-filled answer or a reactor stream (AsyncIterable).
 * Used by PR7 dual-path to produce compatible {answer, details} JSON shape for
 * existing clients (question-answer.tsx, AICHAT, askQuestion callers) when not streaming.
 * Streaming responses are only returned when explicitly requested (see route.ts).
 */
export async function collectFullText(
  res: ProfileQAResponse | LegacyQAResponse
): Promise<string> {
  if (res.answer) return res.answer;
  if ((res as ProfileQAResponse).stream) {
    let acc = "";
    for await (const chunk of (res as ProfileQAResponse).stream!) {
      acc += typeof chunk === "string" ? chunk : "";
    }
    return acc;
  }
  return "";
}

/**
 * Produces the exact legacy-compatible response shape for current UI/clients.
 * details: [] (reactor uses tool-grounded retrieval, not legacy cosine chunks).
 * Callers (route/actions) use this for the non-streaming path.
 */
export async function toLegacyCompatible(
  res: ProfileQAResponse | LegacyQAResponse
): Promise<{ answer: string; details: any[] }> {
  const answer = await collectFullText(res);
  return { answer, details: [] };
}
