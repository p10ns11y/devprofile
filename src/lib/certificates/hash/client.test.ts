import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  digestCertificateBytesInBrowser,
  isClientHashAlgorithmSupported,
  registerClientHashProvider,
} from "./client";

describe("digestCertificateBytesInBrowser", () => {
  it("hashes bytes with Web Crypto SHA-256 in Node", async () => {
    const data = new TextEncoder().encode("certificate-bytes").buffer;
    const expected = createHash("sha256").update(Buffer.from("certificate-bytes")).digest("hex");

    const digest = await digestCertificateBytesInBrowser("sha256", data);
    expect(digest).toBe(expected);
  });

  it("throws when algorithm has no browser provider", async () => {
    await expect(digestCertificateBytesInBrowser("blake3", new ArrayBuffer(1))).rejects.toThrow(
      /not available in the browser/
    );
  });
});

describe("registerClientHashProvider", () => {
  it("registers providers visible to isClientHashAlgorithmSupported", async () => {
    registerClientHashProvider({
      id: "blake3",
      label: "BLAKE3",
      digest: async () => "dd".repeat(32),
    });
    expect(isClientHashAlgorithmSupported("blake3")).toBe(true);
    expect(await digestCertificateBytesInBrowser("blake3", new ArrayBuffer(0))).toBe(
      "dd".repeat(32)
    );
  });
});
