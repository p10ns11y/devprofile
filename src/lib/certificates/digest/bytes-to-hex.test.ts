import { describe, expect, it } from "vitest";

import { bytesToHex, digestsMatch, normalizeDigestHex } from "./bytes-to-hex";

describe("bytesToHex", () => {
  it("encodes bytes as lowercase hex", () => {
    expect(bytesToHex(new Uint8Array([0, 255, 171]))).toBe("00ffab");
  });
});

describe("normalizeDigestHex", () => {
  it("trims and lowercases", () => {
    expect(normalizeDigestHex("  ABCD  ")).toBe("abcd");
  });
});

describe("digestsMatch", () => {
  it("compares case-insensitively", () => {
    expect(digestsMatch("aA", "Aa")).toBe(true);
    expect(digestsMatch("aa", "bb")).toBe(false);
  });
});
