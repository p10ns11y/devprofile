import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runHostedVerificationCheck } from "./client-check";
import { finalizeHostedVerification } from "./result";

vi.mock("../hash/client", () => ({
  digestCertificateBytesInBrowser: vi.fn(async () => "aa".repeat(32)),
}));

const serverPartial = {
  certificateId: "id",
  filename: "test.pdf",
  algorithm: "sha256" as const,
  expectedDigest: "aa".repeat(32),
  serverDigest: "aa".repeat(32),
  serverMatchesExpected: true,
  clientSupported: true,
};

describe("runHostedVerificationCheck", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/verify")) {
          return new Response(JSON.stringify(serverPartial), { status: 200 });
        }
        return new Response(new ArrayBuffer(8), { status: 200 });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests verify API and hosted file in one parallel step", async () => {
    const fetchMock = vi.mocked(fetch);
    await runHostedVerificationCheck("id", "/certificates/test.pdf");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls.some((url) => url.includes("/verify"))).toBe(true);
    expect(urls.some((url) => url.includes("/certificates/test.pdf"))).toBe(true);
  });

  it("returns finalized verification when both requests succeed", async () => {
    const result = await runHostedVerificationCheck("id", "/certificates/test.pdf");
    expect(result).toEqual(finalizeHostedVerification(serverPartial, "aa".repeat(32)));
  });

  it("throws when verify fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/verify")) {
          return new Response(null, { status: 404 });
        }
        return new Response(new ArrayBuffer(8), { status: 200 });
      })
    );

    await expect(runHostedVerificationCheck("id", "/certificates/test.pdf")).rejects.toMatchObject({
      code: "verify_failed",
    });
  });

  it("throws when algorithm is not supported in browser", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/verify")) {
          return new Response(
            JSON.stringify({ ...serverPartial, algorithm: "blake3", clientSupported: false }),
            { status: 200 }
          );
        }
        return new Response(new ArrayBuffer(8), { status: 200 });
      })
    );

    await expect(runHostedVerificationCheck("id", "/certificates/test.pdf")).rejects.toMatchObject({
      code: "algorithm_unsupported",
    });
  });

  it("throws when hosted file fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/verify")) {
          return new Response(JSON.stringify(serverPartial), { status: 200 });
        }
        return new Response(null, { status: 404 });
      })
    );

    await expect(runHostedVerificationCheck("id", "/certificates/test.pdf")).rejects.toMatchObject({
      code: "file_fetch_failed",
    });
  });

  it("encodes certificate id in verify URL", async () => {
    const fetchMock = vi.mocked(fetch);
    await runHostedVerificationCheck("id/with/slash", "/certificates/test.pdf");
    const verifyCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/verify"));
    expect(String(verifyCall?.[0])).toContain(encodeURIComponent("id/with/slash"));
  });
});
