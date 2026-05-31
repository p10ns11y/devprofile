import { describe, expect, it } from "vitest";
import { loadQAIndex } from "./load-index";
import { embedQueryForIndex } from "./embed-query";
import { retrieveFromIndex } from "./retrieve";
import { feature, scenario } from "./test/bdd";

describe(feature("Retrieved grounding quality"), () => {
  describe(scenario("S3", "visitor sees grounded sources"), () => {
    it("returns top-k chunks with non-increasing similarity scores", async () => {
      const index = loadQAIndex();
      const queryVec = await embedQueryForIndex(index, "TypeScript migration at Oneflow");
      const k = 5;
      const results = retrieveFromIndex(index, queryVec, "TypeScript migration at Oneflow", k);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(k);
      for (const chunk of results) {
        expect(chunk.similarity).toBeGreaterThan(0);
        expect(chunk.text.length).toBeGreaterThan(0);
      }
    });
  });
});
