import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collectionsClient, XaiCollectionsConfigError } from "./xai-collections";

const originalFetch = globalThis.fetch;

describe("xAI Collections client", () => {
  beforeEach(() => {
    process.env.XAI_API_KEY = "sk-test-key";
    process.env.XAI_MANAGEMENT_API_KEY = "sk-mgmt-test";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.XAI_API_KEY;
    delete process.env.XAI_MANAGEMENT_API_KEY;
  });

  it("search returns chunks on happy path", async () => {
    globalThis.fetch = vi.fn(async (_url, init) => {
      const parsed = JSON.parse(String(init?.body));
      expect(parsed.limit).toBe(3);
      expect(parsed).not.toHaveProperty("max_num_results");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          matches: [{ content: "Oneflow TypeScript migration impact", score: 0.9 }],
        }),
        text: async () => "",
        headers: { get: () => null },
      };
    }) as unknown as typeof fetch;

    const result = await collectionsClient.search("Oneflow TypeScript", { k: 3 });
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks[0].text).toMatch(/Oneflow|TypeScript/i);
  });

  it("throws config error when API key missing", async () => {
    delete process.env.XAI_API_KEY;
    delete process.env.XAI_MANAGEMENT_API_KEY;
    await expect(collectionsClient.search("test")).rejects.toBeInstanceOf(
      XaiCollectionsConfigError
    );
  });
});
