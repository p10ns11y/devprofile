import cvData from "@/data/cvdata.json";

function certificateIdFromEntry(cert: (typeof cvData.certificates)[number], index: number): string {
  const filenameWithoutExt = cert.filename.replace(/\.[^/.]+$/, "");
  const sanitizedName = filenameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  return `cert-${sanitizedName}-${index}`;
}

export function findCertificateHash(certificateId: string): string | null {
  for (let index = 0; index < cvData.certificates.length; index++) {
    const cert = cvData.certificates[index];
    if (certificateIdFromEntry(cert, index) === certificateId && cert.sha256Hash) {
      return cert.sha256Hash;
    }
  }
  return null;
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
