import { describe, expect, it } from "vitest";
import { handleQaRequest } from "../gateway/handle-qa-request";
import { feature, scenario } from "../test/bdd";
import { assertQaResponseForVisitor, VISITOR_SCENARIO_IDS } from "../test/contracts";

describe(feature("Ask a profile question"), () => {
  describe(scenario("S1", VISITOR_SCENARIO_IDS.S1), () => {
    it("returns a non-empty answer and details the ProfileQA panel can render", async () => {
      const { body } = await handleQaRequest("What is your email?", {});
      assertQaResponseForVisitor(body);
      expect(body.answer.length).toBeGreaterThan(10);
    });
  });

  describe(scenario("S3", VISITOR_SCENARIO_IDS.S3), () => {
    it("includes retrieved chunks for grounding display", async () => {
      const { body } = await handleQaRequest("What is your professional background?", {});
      assertQaResponseForVisitor(body);
      expect(body.details.length).toBeGreaterThan(0);
    });
  });
});

describe(feature("Suggested questions"), () => {
  describe(scenario("S2", VISITOR_SCENARIO_IDS.S2), () => {
    it("answers a curated suggested question shape", async () => {
      const { body } = await handleQaRequest("Why does premflow still matter in 2026?", {});
      assertQaResponseForVisitor(body);
      expect(body.answer.length).toBeGreaterThan(20);
    });
  });
});
