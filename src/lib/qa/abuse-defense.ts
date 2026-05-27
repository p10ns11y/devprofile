/**
 * Abuse Defense Layer — 4-Layer Gate + Golden Fallback integration point (PR 4)
 *
 * Absolute first non-bypassable gate (before any Collections query or Grok call).
 * Implements the exact 4-layer design from Phase 0 sketch (ported/adapted per design):
 *   L1: Edge rate (reliable headers only for fp — Q4 decision; no cookies)
 *   L2: Cheap semantic heuristics (keyword + variance from validation cases) + optional Grok probe stub
 *   L3: Behavioral (repetition / burst on header fp window)
 *   L4: Hard caps (daily/hourly)
 *
 * On block: reason + layer populated; caller (reactor/route in PR6/7) uses golden-fallback.ts
 * with the PR2 packet to serve zero-marginal-cost high-quality answer.
 *
 * Strict isolation (Q3 + types.ts invariants):
 *   - NEVER imports or calls Collections, persona compiler retrieval, embeddings, or HF.
 *   - Any "tiny model" / probe is confined to high-freq cache or MFA fallback only (not here yet).
 *   - Grok probe (if enabled) is a no-op stub in PR4 (no network, no key, no Collections touch).
 *   - Main path (PR6+) always pure xAI Collections.
 *
 * In-mem windows for Phase 1 dev (per-process; design notes @vercel/kv / Edge Config for prod).
 * Tunables via src/config/abuse-defense.ts (env overrides).
 *
 * Logging: structured on every block (ts, ipHash, qHash, layer, reason, version).
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR4 + 4-layer bullets + Q3/Q4/Q6)
 * @see src/lib/qa/types.ts (AbuseConfig/AbuseResult + invariants)
 * @see src/config/abuse-defense.ts
 * @see src/lib/qa/golden-fallback.ts (for serving on block)
 */

import { ABUSE_CONFIG_VERSION, getAbuseConfig } from "@/config/abuse-defense";
import type { AbuseConfig, AbuseResult } from "./types";

// -----------------------------------------------------------------------------
// In-memory sliding state (Phase 1; replaceable with KV later, no API change)
// -----------------------------------------------------------------------------
const ipTimestamps = new Map<string, number[]>(); // fp -> recent ms timestamps (L1)
const sessionTimestamps = new Map<string, number[]>();
const behavioralState = new Map<string, { ts: number; questions: string[] }>(); // L3
const dailyCounters = new Map<string, { day: string; count: number }>(); // L4
const hourlyCounters = new Map<string, { hour: string; count: number }>();

/** Test-only reset (keeps prod surface minimal; called from abuse-defense.test.ts) */
export function resetAbuseStateForTests(): void {
  ipTimestamps.clear();
  sessionTimestamps.clear();
  behavioralState.clear();
  dailyCounters.clear();
  hourlyCounters.clear();
}

// -----------------------------------------------------------------------------
// Helpers (pure, deterministic where possible)
// -----------------------------------------------------------------------------

function simpleHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function pruneWindow(ts: number[], windowMs: number, now: number): number[] {
  return ts.filter((t) => now - t < windowMs);
}

function deriveFingerprint(
  ip: string,
  headers?: Headers | Record<string, string | null | undefined>
): string {
  // Q4 decision: reliable request headers ONLY for L1/3 fingerprinting. No cookies.
  const h: Record<string, string> = {};
  if (headers) {
    if (typeof (headers as Headers).get === "function") {
      const hh = headers as Headers;
      ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "user-agent", "accept-language"].forEach(
        (k) => {
          const v = hh.get(k);
          if (v) h[k] = v;
        }
      );
    } else {
      const raw = headers as Record<string, string | null | undefined>;
      for (const k of [
        "x-forwarded-for",
        "x-real-ip",
        "cf-connecting-ip",
        "user-agent",
        "accept-language",
      ]) {
        const v = raw[k] ?? raw[k.toUpperCase()];
        if (v) h[k] = String(v);
      }
    }
  }

  const realIp = (
    h["x-forwarded-for"] ||
    h["x-real-ip"] ||
    h["cf-connecting-ip"] ||
    ip ||
    "0.0.0.0"
  )
    .split(",")[0]
    .trim();

  const ua = (h["user-agent"] || "").slice(0, 64);
  const lang = (h["accept-language"] || "").slice(0, 16);

  // Stable bucket key only (not stored as PII; used for rate windows)
  return simpleHash(`${realIp}|${ua}|${lang}`);
}

function logBlock(entry: {
  ts: number;
  ipHash: string;
  qHash: string;
  layer: string;
  reason: string;
  version: string;
}): void {
  // Structured one-liner for easy grepping in Vercel logs / observability (per design)
  // eslint-disable-next-line no-console
  console.log(
    `abuse-defense:block ${JSON.stringify({
      ...entry,
      ts: new Date(entry.ts).toISOString(),
    })}`
  );
}

// -----------------------------------------------------------------------------
// Layer implementations (cheap-first, no side effects beyond state windows)
// -----------------------------------------------------------------------------

function checkLayer1Edge(
  fp: string,
  sessionId: string | undefined,
  cfg: AbuseConfig,
  now: number
): { blocked: boolean; reason?: AbuseResult["reason"] } {
  const ipWinMs = 5 * 60 * 1000;
  const sessWinMs = 3 * 60 * 1000;

  // IP
  const ipArr = pruneWindow(ipTimestamps.get(fp) || [], ipWinMs, now);
  ipArr.push(now);
  ipTimestamps.set(fp, ipArr);
  if (ipArr.length > cfg.edge.ipPer5m) {
    return { blocked: true, reason: "rate-limit" };
  }

  // Session (if provided)
  if (sessionId) {
    const sArr = pruneWindow(sessionTimestamps.get(sessionId) || [], sessWinMs, now);
    sArr.push(now);
    sessionTimestamps.set(sessionId, sArr);
    if (sArr.length > cfg.edge.sessionPer3m) {
      return { blocked: true, reason: "rate-limit" };
    }
  }

  return { blocked: false };
}

const OFF_TOPIC_KEYWORDS = [
  // From design + validation 35-45 sketch (off-domain, prompt injection, nonsense)
  "pizza",
  "joke",
  "jokes",
  "quantum",
  "emoji",
  "emojis",
  "bomb",
  "roleplay",
  "role play",
  "ignore instructions",
  "ignore previous",
  "ignore all previous",
  "system prompt",
  "jailbreak",
  "act as",
  "you are now",
  "forget everything",
  "tell me a story",
  "write a poem",
  "current weather",
  "stock price",
  "crypto price",
  "recipe",
  "how to hack",
  "math problem",
  "solve for x",
  "2+2",
  "what is 1+1",
  "derivative of",
  "tell me about something unrelated",
];

function checkLayer2Semantic(
  question: string,
  cfg: AbuseConfig
): { blocked: boolean; reason?: AbuseResult["reason"] } {
  const q = question.toLowerCase().trim();

  // Keyword off-topic / injection (primary cheap signal from validation set)
  if (OFF_TOPIC_KEYWORDS.some((k) => q.includes(k))) {
    return { blocked: true, reason: "low-semantic-relevance" };
  }

  // Extreme repetition / low entropy (bot-like)
  if (/(.)\1{5,}/.test(question) || q.length > 600) {
    return { blocked: true, reason: "low-semantic-relevance" };
  }

  // Optional Grok probe (ultra-cheap, low-price model per Q1)
  // PR4: strict isolation — stub only (no fetch, no XAI key, no Collections, no retrieval).
  // Real probe (if useGrokProbe) wired later behind reactor (never in main Collections path).
  if (cfg.semantic.useGrokProbe) {
    // No-op: heuristics already carry the load. Relevance assumed high.
    // (Future: isolated low-temp relevance check returning score < minRelevance -> block)
  }

  // minRelevance is advisory for future probe scoring; heuristics are sufficient for PR4.
  return { blocked: false };
}

function checkLayer3Behavioral(
  fp: string,
  question: string,
  recentQuestions: string[] | undefined,
  cfg: AbuseConfig,
  now: number
): { blocked: boolean; reason?: AbuseResult["reason"] } {
  const winMs = 2 * 60 * 1000; // 2m behavioral window
  const qNorm = question.trim().toLowerCase();

  let state = behavioralState.get(fp);
  if (!state || now - state.ts > winMs) {
    state = { ts: now, questions: [] };
  }

  // Add current
  const questions = [...state.questions, qNorm].slice(-cfg.behavioral.windowSize);
  behavioralState.set(fp, { ts: now, questions });

  // Exact or near repetition burst
  const repeats = questions.filter((x) => x === qNorm).length;
  if (repeats > cfg.behavioral.maxRepetition) {
    return { blocked: true, reason: "behavioral-anomaly" };
  }

  // Also honor explicit recentQuestions passed from handler (e.g. session history)
  if (recentQuestions && recentQuestions.length > 0) {
    const recentNorm = recentQuestions.map((r) => r.trim().toLowerCase());
    const histRepeats = recentNorm.filter((r) => r === qNorm).length;
    if (histRepeats + 1 > cfg.behavioral.maxRepetition) {
      return { blocked: true, reason: "behavioral-anomaly" };
    }
  }

  // Simple "drift" proxy: wild length variance in short window (bot spray)
  if (questions.length >= 3) {
    const lens = questions.map((s) => s.length);
    const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
    const variance = lens.reduce((a, l) => a + Math.abs(l - avg), 0) / lens.length;
    if (variance > 180 && cfg.behavioral.maxDrift < 0.9) {
      // treat extreme burst variance as anomaly under current defaults
      return { blocked: true, reason: "behavioral-anomaly" };
    }
  }

  return { blocked: false };
}

function checkLayer4HardCaps(
  fp: string,
  cfg: AbuseConfig,
  now: number
): { blocked: boolean; reason?: AbuseResult["reason"] } {
  const day = new Date(now).toISOString().slice(0, 10);
  const hour = new Date(now).toISOString().slice(0, 13);

  // Daily
  let d = dailyCounters.get(fp);
  if (!d || d.day !== day) {
    d = { day, count: 0 };
  }
  d.count += 1;
  dailyCounters.set(fp, d);
  if (d.count > cfg.hardCaps.ipPerDay) {
    return { blocked: true, reason: "daily-cap" };
  }

  // Hourly
  let h = hourlyCounters.get(fp);
  if (!h || h.hour !== hour) {
    h = { hour, count: 0 };
  }
  h.count += 1;
  hourlyCounters.set(fp, h);
  if (h.count > cfg.hardCaps.ipPerHour) {
    return { blocked: true, reason: "rate-limit" }; // or introduce "hourly-cap" but keep to type literals + string
  }

  return { blocked: false };
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export interface CheckAbuseContext {
  ip: string;
  sessionId?: string;
  recentQuestions?: string[];
  /** Reliable headers only (Q4). No cookies. */
  headers?: Headers | Record<string, string | null | undefined>;
}

/**
 * 4-layer abuse check. Absolute first executable gate.
 * Returns AbuseResult (blocked + reason/layer on hit). Never throws.
 * goldenAnswer left for caller + golden-fallback.ts (decouples packet from gate).
 */
export async function checkAbuse(question: string, ctx: CheckAbuseContext): Promise<AbuseResult> {
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return { blocked: true, reason: "low-semantic-relevance", layer: "semantic" };
  }

  const cfg = getAbuseConfig();
  const now = Date.now();
  const fp = deriveFingerprint(ctx.ip, ctx.headers);
  const qHash = simpleHash(question.trim().toLowerCase().slice(0, 120));
  const ipHash = simpleHash(ctx.ip || "unknown").slice(0, 8);

  // L1 edge rate (headers fp)
  let res = checkLayer1Edge(fp, ctx.sessionId, cfg, now);
  if (res.blocked) {
    const reason = res.reason || "rate-limit";
    logBlock({ ts: now, ipHash, qHash, layer: "edge", reason, version: ABUSE_CONFIG_VERSION });
    return { blocked: true, reason, layer: "edge" };
  }

  // L2 semantic (cheap JS first)
  res = checkLayer2Semantic(question, cfg);
  if (res.blocked) {
    const reason = res.reason || "low-semantic-relevance";
    logBlock({ ts: now, ipHash, qHash, layer: "semantic", reason, version: ABUSE_CONFIG_VERSION });
    return { blocked: true, reason, layer: "semantic" };
  }

  // L3 behavioral
  res = checkLayer3Behavioral(fp, question, ctx.recentQuestions, cfg, now);
  if (res.blocked) {
    const reason = res.reason || "behavioral-anomaly";
    logBlock({
      ts: now,
      ipHash,
      qHash,
      layer: "behavioral",
      reason,
      version: ABUSE_CONFIG_VERSION,
    });
    return { blocked: true, reason, layer: "behavioral" };
  }

  // L4 hard caps
  res = checkLayer4HardCaps(fp, cfg, now);
  if (res.blocked) {
    const reason = res.reason || "daily-cap";
    logBlock({ ts: now, ipHash, qHash, layer: "hard-cap", reason, version: ABUSE_CONFIG_VERSION });
    return { blocked: true, reason, layer: "hard-cap" };
  }

  // Allowed
  return { blocked: false };
}
