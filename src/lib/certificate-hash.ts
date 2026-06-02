import { findCertificateById } from "@/lib/certificate-id";

export function findCertificateHash(certificateId: string): string | null {
  const cert = findCertificateById(certificateId);
  return cert?.sha256Hash ?? null;
}

export function deriveVerificationStatus(
  currentHash: string | null,
  expectedHash: string | null,
  fetchFailed: boolean
): "verified" | "failed" | null {
  if (fetchFailed) return "failed";
  if (!currentHash || !expectedHash) return null;
  return currentHash === expectedHash ? "verified" : "failed";
}
