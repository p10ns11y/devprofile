/**
 * durable-retry.ts (withLightweightRetry) — Q2 lightweight wrapper STUB (validation skeleton)
 *
 * The full withLightweightRetry (3 attempts, exponential backoff, transient-only
 * retry, *never* retry on 'abuse'/'blocked', onRetry observability logging)
 * is the explicit user decision for Phase 1 (Open Question 2): AI SDK +
 * lightweight retry (no full Workflow DevKit / "use workflow" in this phase).
 *
 * This shim closes the import gap so runWithDurableExecution in persona-reactor.ts
 * can be imported + called (and overridden by test mock). The real lightweight
 * implementation (or extraction from reactor) will live in the merged PR6 surface.
 *
 * Do not duplicate full retry logic here — this is alignment shim only.
 *
 * @see persona-reactor.ts:78 (runWithDurableExecution + Q2 decision)
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR6, Q2)
 * @see src/lib/qa/index.ts (barrel)
 */

export interface LightweightRetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  retryOn?: (err: unknown) => boolean;
  onRetry?: (attempt: number, err: unknown) => void;
}

/**
 * Stub — single attempt pass-through. Sufficient for skeleton happy paths
 * and direct execution. Tests replace via (durable as any).withLightweightRetry = mockWithRetry.
 */
export async function withLightweightRetry<T>(
  fn: () => Promise<T>,
  opts: LightweightRetryOptions = {}
): Promise<T> {
  // Stub surface for PR6 skeleton import/contract alignment (High Issue 1).
  // Real retry loop + transient guard + logging lives in full tree / PR6 combined.
  // The architectural positive (Q2 choice, abuse never-retried) is enforced in the *call site* wrapper.
  return fn();
}
