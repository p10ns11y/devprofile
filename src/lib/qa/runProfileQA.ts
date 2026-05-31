/**
 * src/lib/qa/runProfileQA.ts
 *
 * Public export surface for the xAI Profile QA Reactor (PR6 complete + PR7 wiring).
 * Thin delegation to runProfileQAReactor (defense-first, durable, Collections + tools).
 *
 * PR7: this is the single call site for the reactor path. Dual-path decision + legacy
 * preservation lives in the two live surfaces (route.ts + actions.ts for the /qa page).
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

import { runProfileQAReactor } from "./persona-reactor";
import { isQARectorEnabled as isReactorEnvEnabled } from "./config/resolve-qa-mode";
import type { RetrievedChunk } from "./types";

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

export interface ProfileQAToolResult {
  toolName: string;
  result: string;
}

// Streaming-capable response (for future route that does direct streaming to client)
export interface ProfileQAResponse {
  stream?: AsyncIterable<string>;
  answer?: string;
  isGolden?: boolean;
  defense?: { blocked: boolean; reason?: string; layer?: string };
  version: string;
  /** Tool-grounded passages for the /qa UI "Retrieved information" panel */
  toolResults?: ProfileQAToolResult[];
  /** Structured chunks with similarity scores for ProfileQA panel (preferred over toolResults) */
  retrievedChunks?: RetrievedChunk[];
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
export { runProfileQAReactor } from "./persona-reactor";

/**
 * Dual-path for the /qa page (post PR #48).
 *
 * - By default: uses the simple/legacy path (byte-identical to pre-reactor behavior).
 * - When ENABLE_XAI_REACTOR=true: uses the full agentic reactor (Collections + tools + 4-layer defense + golden fallback).
 *
 * This is the simplified control mechanism after removal of src/config/feature-flags.ts.
 * The env var gives explicit, low-risk control for development and staged rollouts.
 */
export function isQARectorEnabled(): boolean {
  return isReactorEnvEnabled();
}

// Kept for backward compatibility with tests and any external references.
// No longer tied to a feature flag system (removed in PR #48).
export const QA_REACTOR_FLAG = "qaReactor" as const;

/**
 * Collects full text from either a pre-filled answer or a reactor stream (AsyncIterable).
 * Used by PR7 dual-path to produce compatible {answer, details} JSON shape for
 * existing clients (question-answer.tsx, AICHAT, askQuestion callers) when not streaming.
 * Streaming responses are only returned when explicitly requested (see route.ts).
 */
export async function collectFullText(res: ProfileQAResponse | LegacyQAResponse): Promise<string> {
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
export async function toLegacyCompatible(res: ProfileQAResponse | LegacyQAResponse): Promise<{
  answer: string;
  details: any[];
  isGolden?: boolean;
  defense?: any;
  version?: string;
}> {
  const answer = await collectFullText(res);
  // Preserve reactor observability fields for the new /qa UI (post PR #48)
  const isGolden = "isGolden" in res ? res.isGolden : undefined;
  const defense = "defense" in res ? res.defense : undefined;
  const version = "version" in res ? res.version : undefined;

  return { answer, details: [], isGolden, defense, version };
}
