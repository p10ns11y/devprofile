import { afterEach, describe, expect, it } from "vitest";
import {
  resolveXaiMaxOutputTokens,
  resolveXaiReasoningEffort,
  xaiStreamTextProviderOptions,
} from "./resolve-xai-generation";

describe("resolve-xai-generation", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("defaults max output tokens to 400", () => {
    delete process.env.XAI_MAX_OUTPUT_TOKENS;
    expect(resolveXaiMaxOutputTokens()).toBe(400);
  });

  it("clamps max output tokens", () => {
    process.env.XAI_MAX_OUTPUT_TOKENS = "50";
    expect(resolveXaiMaxOutputTokens()).toBe(128);
    process.env.XAI_MAX_OUTPUT_TOKENS = "99999";
    expect(resolveXaiMaxOutputTokens()).toBe(2048);
  });

  it("defaults reasoning effort to low", () => {
    delete process.env.XAI_REASONING_EFFORT;
    expect(resolveXaiReasoningEffort()).toBe("low");
    expect(xaiStreamTextProviderOptions()).toEqual({ xai: { reasoningEffort: "low" } });
  });
});
