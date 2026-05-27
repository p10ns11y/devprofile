/**
 * src/lib/qa/runProfileQA.ts
 *
 * Public export surface for PR6 (the one PR7 and the route will wire).
 * Thin delegation to the core reactor + legacy fallback hook (feature flag ready).
 *
 * Per design: smallest surface. The actual reactor lives in persona-reactor.ts.
 * runProfileQA is what gets imported by api/cv/qa/route.ts (or actions) when flag is on.
 *
 * Invariants honored:
 * - Defense non-bypassable inside reactor
 * - Streaming capable
 * - Graceful degradation
 * - Observability
 */

import { runProfileQAReactor } from './persona-reactor';
import type { ProfilePacket } from './persona-compiler'; // for typing only

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
 * Public API — the one PR7 will call / feature-flag route to.
 * When NEXT_PUBLIC_USE_XAI_REACTOR (or equivalent Edge Config) is true, this is the path.
 *
 * ctx is intentionally minimal (headers-only philosophy per Q4).
 */
export async function runProfileQA(
  question: string,
  ctx: {
    ip?: string;
    sessionId?: string;
    recentQuestions?: string[];
    headers?: Headers;
    // Legacy interop flag for gradual rollout
    useLegacy?: boolean;
  } = {}
): Promise<ProfileQAResponse | LegacyQAResponse> {
  // Future: const useReactor = process.env.NEXT_PUBLIC_USE_XAI_REACTOR === 'true' || await edgeConfig...
  // For skeleton we always go reactor (PR6 scope is the new path only)
  if (ctx.useLegacy) {
    // Never implement legacy here — just document the handoff point for PR7.
    throw new Error('Legacy path not in PR6 scope — delegate to existing qa-utils in PR7 wiring');
  }

  return runProfileQAReactor(question, ctx);
}

// Re-export the reactor core for direct use in tests / advanced consumers
export { runProfileQAReactor } from './persona-reactor';

// Type exports for consumers (PR7+)
export type { ProfileQAResponse, LegacyQAResponse };
