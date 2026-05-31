import { getAbuseConfig } from "@/config/abuse-defense";
import { computeGoldenFallback, getGoldenFallbackDetails } from "./golden-fallback";
import type { AbuseResult } from "./types";

export type { AbuseResult } from "./types";

export interface CheckAbuseContext {
  ip?: string;
  sessionId?: string;
  recentQuestions?: string[];
  headers?: Record<string, string> | Headers;
}

const edgeBuckets = new Map<string, number[]>();
const behavioralWindows = new Map<string, string[]>();

const SEMANTIC_BLOCK_PATTERNS = [
  /pizza\s+recipe/i,
  /ignore\s+all\s+previous\s+instructions/i,
  /jailbreak/i,
  /forget\s+system\s+prompt/i,
  /\bbomb\b/i,
  /roleplay.*(?:weather|pirate)/i,
  /quantum\s+emojis/i,
  /stock\s+prices.*math\s+derivative/i,
];

const ON_TOPIC_HINTS =
  /thesis|premflow|oneflow|typescript|playwright|dad\s*mode|professional|career|engineering|zod|cv|profile/i;

export function resetAbuseStateForTests(): void {
  edgeBuckets.clear();
  behavioralWindows.clear();
}

function fingerprint(ctx: CheckAbuseContext): string {
  const ip =
    ctx.ip ||
    (ctx.headers instanceof Headers
      ? ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      : ctx.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()) ||
    "unknown";
  const ua =
    ctx.headers instanceof Headers
      ? ctx.headers.get("user-agent") || ""
      : ctx.headers?.["user-agent"] || "";
  return `${ip}|${ua}`;
}

function checkEdgeRateLimit(fp: string, config: ReturnType<typeof getAbuseConfig>): AbuseResult | null {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const hits = (edgeBuckets.get(fp) || []).filter((t) => now - t < windowMs);
  if (hits.length >= config.edge.ipPer5m) {
    return { blocked: true, reason: "rate-limit", layer: "edge" };
  }
  hits.push(now);
  edgeBuckets.set(fp, hits);
  return null;
}

function checkSemantic(question: string): AbuseResult | null {
  const q = question.trim();
  if (!q) {
    return { blocked: true, reason: "off-topic", layer: "semantic" };
  }
  for (const pat of SEMANTIC_BLOCK_PATTERNS) {
    if (pat.test(q)) {
      return { blocked: true, reason: "prompt-injection", layer: "semantic" };
    }
  }
  return null;
}

function checkBehavioral(fp: string, question: string, config: ReturnType<typeof getAbuseConfig>): AbuseResult | null {
  const window = behavioralWindows.get(fp) || [];
  const normalized = question.trim().toLowerCase();
  window.push(normalized);
  if (window.length > config.behavioral.windowSize) {
    window.shift();
  }
  behavioralWindows.set(fp, window);

  const repeats = window.filter((q) => q === normalized).length;
  if (repeats > config.behavioral.maxRepetition) {
    return { blocked: true, reason: "behavioral-anomaly", layer: "behavioral" };
  }
  return null;
}

export async function checkAbuse(
  question: string,
  ctx: CheckAbuseContext = {}
): Promise<AbuseResult> {
  const config = getAbuseConfig();
  const fp = fingerprint(ctx);

  const edge = checkEdgeRateLimit(fp, config);
  if (edge) return edge;

  const semantic = checkSemantic(question);
  if (semantic) return semantic;

  if (!ON_TOPIC_HINTS.test(question) && question.length > 40) {
    const looksOffTopic =
      /pizza|joke|weather|roleplay|quantum|emoji|bomb|ignore|jailbreak/i.test(question);
    if (looksOffTopic) {
      return { blocked: true, reason: "low-semantic-relevance", layer: "semantic" };
    }
  }

  const behavioral = checkBehavioral(fp, question, config);
  if (behavioral) return behavioral;

  return { blocked: false };
}

export { computeGoldenFallback, getGoldenFallbackDetails };
