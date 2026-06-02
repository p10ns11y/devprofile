import { describe, expect, it } from "vitest";
import {
  deriveVerificationStatus,
  finalizeHostedVerification,
  hostedVerificationMatches,
} from "./certificate-verification";

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
    expect(deriveVerificationStatus(result, false)).toBe("verified");
  });
});
