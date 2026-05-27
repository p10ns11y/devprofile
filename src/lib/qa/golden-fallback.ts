/**
 * Golden Fallback (PR 4)
 *
 * High-quality, zero-marginal-cost answer served on ANY block from the 4-layer gate.
 * Selects the best-matching example from the PR2 ProfilePacket.goldenExamples (8-12 tone anchors)
 * using cheap keyword overlap (no embeddings — isolation).
 *
 * Tone: warm, professional, light subtle humor / sparkle where natural (exact Q6 user decision).
 * "Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind."
 * Never heavy, never jokey. Pulled directly from packet + compiler's tone guidance.
 *
 * Callable from:
 *   - Future reactor (PR6) after checkAbuse returns blocked
 *   - Route handler (PR7) for immediate 200 { answer: golden, isGolden: true, defense: {...} }
 *   - Tests (integration with compileProfilePacketFromSources)
 *
 * Does not perform retrieval, Collections calls, or any paid work. Pure.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (Q6 + on-block golden)
 * @see src/lib/qa/types.ts (ProfilePacket.goldenExamples + tone comment)
 * @see src/lib/qa/persona-compiler.ts (extractGoldenExamples + buildToolSystemPrompt tone)
 */

import type { ProfilePacket } from "./types";

/** Warm, human note (Q6 voice). Slight sparkle only where it fits naturally. */
const HUMAN_NOTE =
  "That's a thoughtful question, but it sits a little outside the professional topics I usually cover here. It does remind me of a principle I care about deeply — here's a real example from my own path that shows how I think about these things:";

/**
 * Pick best golden example via simple stable overlap (word intersection, normalized).
 * Deterministic tie-break: first in packet order (ps-curated first per compiler).
 */
function pickBestExample(
  question: string,
  examples: Array<{ q: string; a: string }>
): { q: string; a: string } {
  if (examples.length === 0) {
    return {
      q: "General professional background",
      a: "I focus on turning personal friction into quiet, compounding infrastructure — from my 2016 thesis work through Oneflow transformations, premflow, and tools like Grok Dia. Everything I build respects human attention and time.",
    };
  }

  const qWords = new Set(
    question
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  let best = examples[0];
  let bestScore = -1;

  for (const ex of examples) {
    const exWords = ex.q
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    let score = 0;
    for (const w of exWords) if (qWords.has(w)) score++;
    // slight boost from answer keywords too (helps reflective tone matches)
    const aWords = ex.a
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/);
    for (const w of aWords) if (qWords.has(w)) score += 0.2;

    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }
  return best;
}

/**
 * Compute the golden fallback answer for a blocked question.
 * Returns a complete, human-feeling response ready to send to the client (no extra wrapper needed).
 */
export function computeGoldenFallback(question: string, packet: ProfilePacket): string {
  const best = pickBestExample(question || "", packet.goldenExamples || []);

  // Keep the note short, warm, professional with one natural human touch (no forced joke).
  // The golden a already carries the real voice from golden-qa + ps-profile curation.
  return `${HUMAN_NOTE}\n\n${best.a}`;
}

/**
 * Lower-level helper (for tests / advanced callers): returns the matched example + the full served text.
 */
export function getGoldenFallbackDetails(
  question: string,
  packet: ProfilePacket
): {
  answer: string;
  matched: { q: string; a: string };
} {
  const matched = pickBestExample(question || "", packet.goldenExamples || []);
  return {
    answer: computeGoldenFallback(question, packet),
    matched,
  };
}
