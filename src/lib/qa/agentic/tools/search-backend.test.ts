import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { searchProfile } from "./search-backend";
import { resolveAgenticRetrieval } from "@/lib/qa/config/resolve-qa-mode";
import { feature, scenario } from "@/lib/qa/test/bdd";
import { VISITOR_SCENARIO_IDS } from "@/lib/qa/test/contracts";

describe(feature("Local developer workflow"), () => {
  describe(scenario("S8", VISITOR_SCENARIO_IDS.S8), () => {
    const env = process.env;

    beforeEach(() => {
      process.env = { ...env };
      process.env.USE_LOCAL_PROFILE_DATA = "true";
      delete process.env.XAI_API_KEY;
      delete process.env.XAI_MANAGEMENT_API_KEY;
    });

    afterEach(() => {
      process.env = env;
    });

    it("searches profile files without xAI keys", async () => {
      expect(resolveAgenticRetrieval()).toBe("local-profile-files");
      const result = await searchProfile("premflow thesis Dad mode", { k: 3 });
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.chunks[0].text.length).toBeGreaterThan(50);
    });
  });
});
