import { XAI } from "../constants";

export type XaiReasoningEffort = "low" | "high";

/** Parsed `XAI_MAX_OUTPUT_TOKENS` (completion cap per streamText step). */
export function resolveXaiMaxOutputTokens(): number {
  const raw = process.env.XAI_MAX_OUTPUT_TOKENS?.trim();
  if (!raw) return XAI.DEFAULT_MAX_OUTPUT_TOKENS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return XAI.DEFAULT_MAX_OUTPUT_TOKENS;
  return Math.min(XAI.MAX_MAX_OUTPUT_TOKENS, Math.max(XAI.MIN_MAX_OUTPUT_TOKENS, n));
}

/** Parsed `XAI_REASONING_EFFORT` — maps to xAI `reasoning_effort` via AI SDK. */
export function resolveXaiReasoningEffort(): XaiReasoningEffort {
  const v = process.env.XAI_REASONING_EFFORT?.trim().toLowerCase();
  return v === "high" ? "high" : "low";
}

export function resolveXaiTemperature(): number {
  const raw = process.env.XAI_TEMPERATURE?.trim();
  if (!raw) return XAI.DEFAULT_TEMPERATURE;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return XAI.DEFAULT_TEMPERATURE;
  return Math.min(1, Math.max(0, n));
}

export function xaiStreamTextProviderOptions(): {
  xai: { reasoningEffort: XaiReasoningEffort };
} {
  return { xai: { reasoningEffort: resolveXaiReasoningEffort() } };
}
