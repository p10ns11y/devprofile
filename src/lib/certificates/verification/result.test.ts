import { describe, expect, it } from "vitest";

import {
  deriveVerificationStatus,
  finalizeHostedVerification,
  hostedVerificationMatches,
} from "./result";

const basePartial = {
  certificateId: "abc",
  filename: "test.pdf",
  algorithm: "sha256" as const,
  expectedDigest: "aa".repeat(32),
  serverDigest: "aa".repeat(32),
  serverMatchesExpected: true,
  clientSupported: true,
};

describe("hostedVerificationMatches", () => {
  it("requires client and server to match expected", () => {
    const digest = "aa".repeat(32);
    expect(hostedVerificationMatches(digest, digest, digest)).toBe(true);
    expect(hostedVerificationMatches(digest, digest, "bb".repeat(32))).toBe(false);
    expect(hostedVerificationMatches(digest, "bb".repeat(32), digest)).toBe(false);
  });
});

describe("finalizeHostedVerification", () => {
  it("marks verified when client digest matches expected", () => {
    const digest = "aa".repeat(32);
    const result = finalizeHostedVerification(
      { ...basePartial, expectedDigest: digest, serverDigest: digest },
      digest
    );
    expect(result.match).toBe(true);
    expect(result.clientMatchesExpected).toBe(true);
    expect(deriveVerificationStatus(result, false)).toBe("verified");
  });

  it("fails when only client matches", () => {
    const expected = "aa".repeat(32);
    const result = finalizeHostedVerification(
      { ...basePartial, expectedDigest: expected, serverDigest: "bb".repeat(32) },
      expected
    );
    expect(result.match).toBe(false);
    expect(result.clientMatchesExpected).toBe(true);
  });
});

describe("deriveVerificationStatus", () => {
  it("returns failed on fetch error", () => {
    expect(deriveVerificationStatus(null, true)).toBe("failed");
  });

  it("returns null while idle", () => {
    expect(deriveVerificationStatus(null, false)).toBeNull();
  });

  it("returns failed when match is false", () => {
    const result = finalizeHostedVerification(
      { ...basePartial, serverDigest: "bb".repeat(32) },
      "aa".repeat(32)
    );
    expect(deriveVerificationStatus(result, false)).toBe("failed");
  });
});
