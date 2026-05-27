/**
 * Abuse Defense Configuration (PR 4)
 *
 * Tunable thresholds + env overrides. Generous defaults drawn from the Phase 0 sketch
 * (12 req / 5m per IP, ~400/day) to let real users through while catching abuse early.
 * All overrides via ABUSE_* as documented in .env.example.
 *
 * Phase 1: const + env (later Edge Config / KV for runtime tunables without deploy).
 * Follows User Decisions Q3/Q4/Q6 and invariants in src/lib/qa/types.ts
 * (no cookies; headers only for L1/3; tiny models isolated to cache/MFA fallback only).
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md
 * @see src/lib/qa/abuse-defense.ts
 * @see src/lib/qa/types.ts (AbuseConfig shape + invariants)
 */

import type { AbuseConfig } from "@/lib/qa/types";

const DEFAULT_CONFIG: AbuseConfig = {
  edge: {
    ipPer5m: 12,
    sessionPer3m: 8,
  },
  semantic: {
    minRelevance: 0.2,
    useGrokProbe: false,
  },
  behavioral: {
    maxRepetition: 3,
    maxDrift: 0.6,
    windowSize: 5,
  },
  hardCaps: {
    ipPerDay: 400,
    ipPerHour: 50,
  },
};

function parseIntEnv(name: string, def: number): number {
  const v = parseInt(process.env[name] || "", 10);
  return Number.isFinite(v) && v > 0 ? v : def;
}

function parseFloatEnv(name: string, def: number): number {
  const v = parseFloat(process.env[name] || "");
  return Number.isFinite(v) && v > 0 ? v : def;
}

function parseBoolEnv(name: string, def: boolean): boolean {
  const v = (process.env[name] || "").toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return def;
}

/**
 * Returns the current (env-overridable) AbuseConfig.
 * Called on every checkAbuse (cheap; no side effects).
 */
export function getAbuseConfig(): AbuseConfig {
  return {
    edge: {
      ipPer5m: parseIntEnv("ABUSE_IP_PER_5M", DEFAULT_CONFIG.edge.ipPer5m),
      sessionPer3m: parseIntEnv("ABUSE_SESSION_PER_3M", DEFAULT_CONFIG.edge.sessionPer3m),
    },
    semantic: {
      minRelevance: parseFloatEnv("ABUSE_MIN_RELEVANCE", DEFAULT_CONFIG.semantic.minRelevance),
      useGrokProbe: parseBoolEnv("ABUSE_USE_GROK_PROBE", DEFAULT_CONFIG.semantic.useGrokProbe),
    },
    behavioral: {
      maxRepetition: parseIntEnv("ABUSE_MAX_REPETITION", DEFAULT_CONFIG.behavioral.maxRepetition),
      maxDrift: parseFloatEnv("ABUSE_MAX_DRIFT", DEFAULT_CONFIG.behavioral.maxDrift),
      windowSize: parseIntEnv("ABUSE_WINDOW_SIZE", DEFAULT_CONFIG.behavioral.windowSize),
    },
    hardCaps: {
      ipPerDay: parseIntEnv("ABUSE_IP_PER_DAY", DEFAULT_CONFIG.hardCaps.ipPerDay),
      ipPerHour: parseIntEnv("ABUSE_IP_PER_HOUR", DEFAULT_CONFIG.hardCaps.ipPerHour),
    },
  };
}

/** Stable version marker for abuse logs and results (PR4) */
export const ABUSE_CONFIG_VERSION = "pr4-2026-05-27" as const;
