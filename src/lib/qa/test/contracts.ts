import { expect } from "vitest";
import type { QAResponse } from "../types";

/** What ProfileQA needs to render answer + retrieved panel (Scenario S1, S3). */
export function assertQaResponseForVisitor(res: QAResponse): void {
  expect(typeof res.answer).toBe("string");
  expect(res.answer.length).toBeGreaterThan(0);
  expect(Array.isArray(res.details)).toBe(true);
  for (const d of res.details) {
    expect(typeof d.text).toBe("string");
    expect(typeof d.section).toBe("string");
    expect(typeof d.similarity).toBe("number");
  }
}

export const VISITOR_SCENARIO_IDS = {
  S1: "visitor submits question and receives answer",
  S2: "visitor picks suggested question",
  S3: "visitor sees retrieved information with answer",
  S4: "repeat question uses cache",
  S5: "answer when Ollama unavailable",
  S6: "reactor returns same JSON shape",
  S7: "safe refusal for abusive prompts",
  S8: "local dev without xAI keys",
} as const;
