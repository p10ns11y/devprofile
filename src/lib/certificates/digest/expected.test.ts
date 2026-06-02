import { describe, expect, it } from "vitest";

import type { CvCertificateEntry } from "../identity/id";
import { getExpectedDigest } from "./expected";

const base = {
  course: "Test",
  filename: "test.pdf",
} as CvCertificateEntry;

describe("getExpectedDigest", () => {
  it("returns normalized sha256 from cvdata field", () => {
    const hex = "a".repeat(64);
    const digest = getExpectedDigest({ ...base, sha256Hash: hex.toUpperCase() });
    expect(digest).toEqual({ algorithm: "sha256", hex: hex.toLowerCase() });
  });

  it("returns null when sha256 hash missing", () => {
    expect(getExpectedDigest(base)).toBeNull();
  });

  it("reads blake3 when configured", () => {
    const hex = "b".repeat(64);
    const digest = getExpectedDigest({
      ...base,
      hashAlgorithm: "blake3",
      blake3Hash: hex,
    });
    expect(digest).toEqual({ algorithm: "blake3", hex });
  });

  it("returns null for blake3 without blake3Hash", () => {
    expect(getExpectedDigest({ ...base, hashAlgorithm: "blake3" })).toBeNull();
  });
});
