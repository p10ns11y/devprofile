/**
 * Supported certificate content digests.
 *
 * To add BLAKE3 (or another id):
 * 1. Extend `CertificateHashAlgorithmId` and `getExpectedDigest` field mapping.
 * 2. `registerServerHashProvider` in `certificate-hash-server.ts` (Node).
 * 3. `registerClientHashProvider` in `certificate-hash-client.ts` (browser/WASM).
 * 4. Append the id to `CLIENT_HASH_ALGORITHM_IDS` when the browser provider exists.
 */
export type CertificateHashAlgorithmId = "sha256" | "blake3";

export const DEFAULT_CERTIFICATE_HASH_ALGORITHM: CertificateHashAlgorithmId = "sha256";

export const CERTIFICATE_HASH_ALGORITHM_IDS: CertificateHashAlgorithmId[] = ["sha256", "blake3"];

/** Algorithms with a registered browser provider (extend when adding BLAKE3 WASM, etc.). */
export const CLIENT_HASH_ALGORITHM_IDS: CertificateHashAlgorithmId[] = ["sha256"];

export function isClientHashAlgorithmSupported(algorithm: CertificateHashAlgorithmId): boolean {
  return CLIENT_HASH_ALGORITHM_IDS.includes(algorithm);
}

export function isCertificateHashAlgorithmId(value: string): value is CertificateHashAlgorithmId {
  return (CERTIFICATE_HASH_ALGORITHM_IDS as string[]).includes(value);
}

export function hashAlgorithmLabel(id: CertificateHashAlgorithmId): string {
  switch (id) {
    case "sha256":
      return "SHA-256";
    case "blake3":
      return "BLAKE3";
  }
}

export function resolveCertificateHashAlgorithm(cert: {
  hashAlgorithm?: string | null;
}): CertificateHashAlgorithmId {
  const raw = cert.hashAlgorithm ?? DEFAULT_CERTIFICATE_HASH_ALGORITHM;
  return isCertificateHashAlgorithmId(raw) ? raw : DEFAULT_CERTIFICATE_HASH_ALGORITHM;
}
