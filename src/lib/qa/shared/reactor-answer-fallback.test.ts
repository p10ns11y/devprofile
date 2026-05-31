import { describe, it, expect } from "vitest";
import {
  REACTOR_EMPTY_NARRATIVE_PLACEHOLDER,
  isReactorEmptyNarrativePlaceholder,
  synthesizeAnswerFromRetrievedChunks,
} from "./reactor-answer-fallback";
import type { RetrievedChunk } from "../types";

describe("reactor-answer-fallback", () => {
  it("detects the empty narrative placeholder", () => {
    expect(isReactorEmptyNarrativePlaceholder(REACTOR_EMPTY_NARRATIVE_PLACEHOLDER)).toBe(
      true
    );
    expect(isReactorEmptyNarrativePlaceholder("Something else entirely.")).toBe(false);
  });

  it("extracts golden Answer from chunk text", () => {
    const chunks: RetrievedChunk[] = [
      {
        text: "Question: Why Oneflow?\nAnswer: Because the next chapters matter for scale.",
        section: "Golden Q&A",
        similarity: 0.7,
      },
    ];
    expect(synthesizeAnswerFromRetrievedChunks(chunks)).toBe(
      "Because the next chapters matter for scale."
    );
  });

  it("returns null when chunks are too short", () => {
    expect(synthesizeAnswerFromRetrievedChunks([{ text: "hi", section: "x", similarity: 1 }])).toBe(
      null
    );
  });
});
