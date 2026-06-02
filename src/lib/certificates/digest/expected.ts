import type { CvCertificateEntry } from "../identity/id";
import { type CertificateHashAlgorithmId, resolveCertificateHashAlgorithm } from "./algorithms";
import { normalizeDigestHex } from "./bytes-to-hex";

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
      if (!cert.blake3Hash) return null;
      return { algorithm, hex: normalizeDigestHex(cert.blake3Hash) };
    }
  }
}
