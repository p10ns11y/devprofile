import { describe, expect, it } from "vitest";
import { qaCache } from "../qa-cache";
import { handleQaRequest } from "../gateway/handle-qa-request";
import { feature, scenario } from "../test/bdd";
import { VISITOR_SCENARIO_IDS } from "../test/contracts";

describe(feature("Fast repeat answers"), () => {
  describe(scenario("S4", VISITOR_SCENARIO_IDS.S4), () => {
    it("returns cached response on identical question", async () => {
      qaCache.clear();
      const q = "What technologies do you use for testing?";
      const first = await handleQaRequest(q, {});
      const second = await handleQaRequest(q, {});
      expect(second.body.answer).toBe(first.body.answer);
      expect(second.body.details).toEqual(first.body.details);
    });
  });
});
