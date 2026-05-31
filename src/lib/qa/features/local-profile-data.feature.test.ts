import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { handleQaRequest } from "../gateway/handle-qa-request";
import { resolveAgenticRetrieval } from "../config/resolve-qa-mode";
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

describe(feature("Local profile without xAI"), () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      ENABLE_XAI_REACTOR: "true",
      USE_LOCAL_PROFILE_DATA: "true",
    };
    delete process.env.XAI_API_KEY;
    delete process.env.XAI_MANAGEMENT_API_KEY;
    mockRunProfileQA.mockReset();
  });

  afterEach(() => {
    process.env = env;
  });

  describe(scenario("S8", VISITOR_SCENARIO_IDS.S8), () => {
    it("agentic path can serve file-backed chunks without Collections keys", async () => {
      expect(resolveAgenticRetrieval()).toBe("local-profile-files");

      mockRunProfileQA.mockResolvedValue({
        answer: "Premflow matters because Dad-mode deep work windows are scarce.",
        version: "v1-2026-05",
        retrievedChunks: [
          {
            text: "Speed is a feature when time is scarce.",
            section: "ps-profile-v1",
            similarity: 0.78,
          },
        ],
      });

      const { body } = await handleQaRequest("Why does premflow still matter in 2026?", {});

      assertQaResponseForVisitor(body);
      expect(body.details.length).toBeGreaterThan(0);
      expect(body.details[0].similarity).toBeCloseTo(0.78, 2);
    });
  });
});
