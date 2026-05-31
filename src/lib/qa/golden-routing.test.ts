import { describe, expect, it } from "vitest";
import { QA_ROUTER } from "./constants";
import {
  findGoldenFromRetrieval,
  isGenericIntroAnswer,
  parseIdealAnswerFromGoldenChunk,
  shouldPreferGoldenAnswer,
} from "./golden-routing";
import { loadQAIndex } from "./load-index";
import type { RetrievedChunk } from "./types";

describe("golden-routing", () => {
  const index = loadQAIndex();

  const nextChaptersEntry = index.goldenQuestions.find((e) =>
    e.question.includes("next chapters")
  );

  it("parses ideal answer from golden chunk text", () => {
    const text =
      "Question: You recently posted about next chapters?\nAnswer: ** Dad mode in Tamil Nadu.";
    expect(parseIdealAnswerFromGoldenChunk(text)).toContain("Dad mode");
  });

  it("findGoldenFromRetrieval when top chunk is Golden Q&A above threshold", () => {
    if (!nextChaptersEntry) return;

    const context: RetrievedChunk[] = [
      {
        id: nextChaptersEntry.id,
        section: "Golden Q&A",
        text: `Question: ${nextChaptersEntry.question}\nAnswer: ${nextChaptersEntry.idealAnswer}`,
        similarity: 0.679,
      },
      {
        id: "cv-0",
        section: "Introduction",
        text: "My name is Peramanathan...",
        similarity: 0.9,
      },
    ];

    const res = findGoldenFromRetrieval(index, "next chapters at Oneflow", context);
    expect(res).not.toBeNull();
    expect(res?.via).toBe("retrieval");
    expect(res?.entry.idealAnswer).toContain("Dad mode");
    expect(res?.similarity).toBeGreaterThanOrEqual(QA_ROUTER.GOLDEN_RETRIEVAL_MIN_SIM);
  });

  it("detects generic intro template", () => {
    expect(
      isGenericIntroAnswer(
        "Hello! I'm Peramanathan Sathyamoorthy, a Senior Software Engineer. What would you like to know more about my experience, skills, or specific projects?"
      )
    ).toBe(true);
  });

  it("shouldPreferGoldenAnswer for retrieval-backed resolution", () => {
    if (!nextChaptersEntry) return;
    const golden = {
      entry: nextChaptersEntry,
      similarity: 0.679,
      via: "retrieval" as const,
    };
    expect(
      shouldPreferGoldenAnswer(
        "Hello! I'm Peramanathan. What would you like to know more about my experience, skills, or specific projects?",
        golden
      )
    ).toBe(true);
  });
});
