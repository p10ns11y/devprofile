import { describe, expect, it, vi } from "vitest";
import { searchProfileForVoice } from "./profile-grounding";

vi.mock("@/lib/qa/gateway/handle-qa-request", () => ({
  handleQaRequest: vi.fn(async (question: string) => ({
    body: { answer: `Answer for: ${question}`, details: ["chunk-1"] },
    responseHeaders: {},
  })),
}));

describe("searchProfileForVoice", () => {
  it("wraps handleQaRequest", async () => {
    const result = await searchProfileForVoice("What is your background?");
    expect(result.answer).toContain("background");
    expect(result.details).toHaveLength(1);
  });

  it("handles empty query", async () => {
    const result = await searchProfileForVoice("  ");
    expect(result.answer).toContain("specific question");
  });
});
