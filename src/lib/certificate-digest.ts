import {
  type CertificateHashAlgorithmId,
  resolveCertificateHashAlgorithm,
} from "@/lib/certificate-hash-algorithms";
import type { CvCertificateEntry } from "@/lib/certificate-id";
import { normalizeDigestHex } from "@/lib/bytes-to-hex";

export type CertificateExpectedDigest = {
  algorithm: CertificateHashAlgorithmId;
  hex: string;
};

/** Read expected digest from cvdata (algorithm-specific fields). */
export function getExpectedDigest(cert: CvCertificateEntry): CertificateExpectedDigest | null {
  const algorithm = resolveCertificateHashAlgorithm(cert);

  switch (algorithm) {
    case "sha256": {
      if (!cert.sha256Hash) return null;
      return { algorithm, hex: normalizeDigestHex(cert.sha256Hash) };
    }
    case "blake3": {
      const blake3Hash = (cert as CvCertificateEntry & { blake3Hash?: string }).blake3Hash;
      if (!blake3Hash) return null;
      return { algorithm, hex: normalizeDigestHex(blake3Hash) };
    }
  }
}
