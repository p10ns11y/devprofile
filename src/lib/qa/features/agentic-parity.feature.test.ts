import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { handleQaRequest } from "../gateway/handle-qa-request";
import { assertQaResponseForVisitor, VISITOR_SCENARIO_IDS } from "../test/contracts";
import { feature, scenario } from "../test/bdd";

const mockRunProfileQA = vi.fn();

vi.mock("../runProfileQA", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../runProfileQA")>();
  return {
    ...actual,
    runProfileQA: (...args: Parameters<typeof actual.runProfileQA>) =>
      mockRunProfileQA(...args),
  };
});

describe(feature("Agentic parity"), () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, ENABLE_XAI_REACTOR: "true", XAI_API_KEY: "sk-test" };
    mockRunProfileQA.mockReset();
  });

  afterEach(() => {
    process.env = env;
  });

  describe(scenario("S6", VISITOR_SCENARIO_IDS.S6), () => {
    it("returns same JSON shape as default path with retrieved chunks", async () => {
      mockRunProfileQA.mockResolvedValue({
        answer: "Premflow still matters because speed is a feature in Dad mode.",
        version: "v1-2026-05",
        retrievedChunks: [
          {
            text: "Notes, tasks, pomodoros — all in one binary under 300 lines.",
            section: "Profile",
            similarity: 0.91,
          },
        ],
      });

      const { body, responseHeaders } = await handleQaRequest(
        "Why does premflow still matter in 2026?",
        {}
      );

      assertQaResponseForVisitor(body);
      expect(body.strategy).toBe("reactor");
      expect(body.details.length).toBeGreaterThan(0);
      expect(body.details[0].similarity).toBeGreaterThan(0);
      expect(body.details[0].similarity).toBeLessThanOrEqual(1);
      expect(responseHeaders["X-QA-Reactor"]).toBe("1");
    });
  });
});
