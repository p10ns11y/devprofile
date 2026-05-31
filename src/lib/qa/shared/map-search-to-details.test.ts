import { describe, expect, it } from "vitest";
import {
  mergeRetrievedChunks,
  normalizeScoresToSimilarity,
  searchResultToDetails,
} from "./map-search-to-details";

describe("map-search-to-details (Scenario S3 agentic)", () => {
  it("normalizes xAI scores to 0–1 for percentage display", () => {
    const sims = normalizeScoresToSimilarity([
      { score: 1.14 },
      { score: 0.57 },
      { score: undefined },
    ]);
    expect(sims[0]).toBe(1);
    expect(sims[1]).toBeCloseTo(0.5, 2);
    expect(sims[2]).toBeGreaterThan(0);
    expect(sims[2]).toBeLessThan(1);
  });

  it("maps SearchResult chunks to RetrievedChunk with section labels", () => {
    const details = searchResultToDetails(
      {
        chunks: [
          {
            text: "Premflow is a 300-line Dad-mode productivity binary.",
            score: 0.92,
            metadata: { section: "golden-qa" },
          },
        ],
        citations: [],
      },
      "profileSearch"
    );
    expect(details).toHaveLength(1);
    expect(details[0].section).toBe("golden-qa");
    expect(details[0].similarity).toBe(1);
    expect(details[0].source).toBe("profileSearch");
  });

  it("mergeRetrievedChunks dedupes and sorts by similarity", () => {
    const merged = mergeRetrievedChunks([
      { text: "Same chunk text here for dedupe test", section: "A", similarity: 0.6 },
      { text: "Same chunk text here for dedupe test", section: "B", similarity: 0.9 },
      { text: "Different chunk", section: "C", similarity: 0.7 },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0].similarity).toBe(0.9);
    expect(merged[0].section).toBe("B");
  });
});
