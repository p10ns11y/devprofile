import { digestsMatch } from "@/lib/bytes-to-hex";
import type { CertificateHashAlgorithmId } from "@/lib/certificate-hash-algorithms";

export type HostedVerificationResult = {
  certificateId: string;
  filename: string;
  algorithm: CertificateHashAlgorithmId;
  expectedDigest: string;
  serverDigest: string;
  clientDigest: string;
  match: boolean;
  serverMatchesExpected: boolean;
  clientMatchesExpected: boolean;
  clientSupported: boolean;
};

export function deriveVerificationStatus(
  result: Pick<HostedVerificationResult, "match"> | null,
  fetchFailed: boolean
): "verified" | "failed" | null {
  if (fetchFailed) return "failed";
  if (!result) return null;
  return result.match ? "verified" : "failed";
}

export function hostedVerificationMatches(
  expectedDigest: string,
  serverDigest: string,
  clientDigest: string
): HostedVerificationResult["match"] {
  return (
    digestsMatch(clientDigest, expectedDigest) && digestsMatch(serverDigest, expectedDigest)
  );
}

export function finalizeHostedVerification(
  serverPartial: Omit<HostedVerificationResult, "clientDigest" | "match" | "clientMatchesExpected">,
  clientDigest: string
): HostedVerificationResult {
  const clientMatchesExpected = digestsMatch(clientDigest, serverPartial.expectedDigest);
  const match = hostedVerificationMatches(
    serverPartial.expectedDigest,
    serverPartial.serverDigest,
    clientDigest
  );

  return {
    ...serverPartial,
    clientDigest,
    clientMatchesExpected,
    match,
  };
}
