import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { handleQaRequest } from "../gateway/handle-qa-request";
import * as qaRouter from "../qa-router";
import { feature, scenario } from "../test/bdd";
import { assertQaResponseForVisitor, VISITOR_SCENARIO_IDS } from "../test/contracts";

describe(feature("Resilient local path"), () => {
  describe(scenario("S5", VISITOR_SCENARIO_IDS.S5), () => {
    beforeEach(() => {
      vi.spyOn(qaRouter, "isOllamaAvailable").mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("still returns an answer when Ollama generation fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Ollama down"));
      const { body } = await handleQaRequest(
        "Tell me about your experience with TypeScript migration at Oneflow.",
        {}
      );
      assertQaResponseForVisitor(body);
    });
  });
});
