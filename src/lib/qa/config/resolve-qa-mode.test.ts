import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isQARectorEnabled, resolveAgenticRetrieval, resolveQaMode } from "./resolve-qa-mode";

describe("Scenario: env selects visitor backend", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.ENABLE_XAI_REACTOR;
    delete process.env.USE_LOCAL_PROFILE_DATA;
    delete process.env.XAI_API_KEY;
    delete process.env.XAI_MANAGEMENT_API_KEY;
    delete process.env.XAI_PROFILE_COLLECTION;
  });

  afterEach(() => {
    process.env = env;
  });

  it("defaults to local-index for typical visitor deploy", () => {
    expect(resolveQaMode()).toBe("local-index");
    expect(isQARectorEnabled()).toBe(false);
  });

  it("selects agentic when reactor flag is on", () => {
    process.env.ENABLE_XAI_REACTOR = "true";
    expect(resolveQaMode()).toBe("agentic");
  });

  it("S8: uses local profile files without xAI keys", () => {
    process.env.USE_LOCAL_PROFILE_DATA = "true";
    expect(resolveAgenticRetrieval()).toBe("local-profile-files");
  });
});
