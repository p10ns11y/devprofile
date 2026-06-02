import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HostedVerificationError, runHostedVerificationCheck } from "./client-check";
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

    await expect(runHostedVerificationCheck("id", "/certificates/test.pdf")).rejects.toThrow(
      HostedVerificationError
    );
  });
});
