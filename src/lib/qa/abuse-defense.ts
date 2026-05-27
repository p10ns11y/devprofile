/**
 * abuse-defense.ts (checkAbuse + computeGoldenFallback) — PR4 STUB (sibling branch / validation skeleton shim)
 *
 * Full 4-layer abuse defense (edge rate limits, semantic, behavioral, golden corpus)
 * + computeGoldenFallback (high-signal, Q6 tone, zero-cost on block, using real PR2 packet)
 * lives on the PR4 branch (b59206fbf6ebcbfc00bbffe669b5cdd023f94a30 per plan).
 *
 * This minimal shim closes the import gap (High Issue 1) for PR6 skeleton
 * so defense-first + golden zero-cost paths can be exercised (and overridden
 * by the test harness) against present PR3/PR5 modules.
 *
 * The *architectural positive* (defense literally first executable statement at
 * persona-reactor.ts:115, non-bypassable, zero Collections/Grok cost on block)
 * is preserved in the call site + test asserts. Real PR4 impl replaces this.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR4, AbuseResult, golden)
 * @see src/lib/qa/types.ts (AbuseResult, AbuseConfig)
 * @see src/lib/qa/index.ts (barrel)
 */

// Types for the surface (minimal; real in PR4 + types.ts re-exports some)
export interface AbuseResult {
  blocked: boolean;
  reason?: string;
  layer?: string; // 'edge' | 'semantic' | 'behavioral' | 'golden'
}

import type { ProfilePacket } from './types';

/**
 * Stub checkAbuse — default never blocks (happy path for unmocked direct runs).
 * Test harness (persona-reactor.test.ts:98) replaces with mockCheckAbuse that
 * triggers on "bomb"/"ignore" etc. to prove non-bypass + zero-cost golden.
 */
export async function checkAbuse(
  question: string,
  ctx: Record<string, unknown> = {}
): Promise<AbuseResult> {
  // @ts-expect-error - PR4 stub surface; real has 4 cheap-first layers + KV + headers-only (Q4)
  // In skeleton: tests mutate the module to inject real behavior.
  return { blocked: false };
}

/**
 * Stub golden fallback — Q6 tone, references packet for "real" anchors.
 * Real PR4 version uses packet.goldenExamples + principles for high-fidelity
 * zero-cost answer when abuse blocks (before any Collections or Grok spend).
 */
export function computeGoldenFallback(
  question: string,
  packet: ProfilePacket
): { answer: string; isGolden: true } {
  // @ts-expect-error - PR4 stub; real fuses packet data + Q6 voice
  return {
    answer: `Golden (Q6 tone stub from PR4): I have thought deeply about "${question}". From my experience building quiet infrastructure, respecting human attention, and Dad-mode realities, the answer is: focus on the 20% that compounds. (Full high-signal golden from real packet + golden-qa.md in combined tree.)`,
    isGolden: true,
  };
}
