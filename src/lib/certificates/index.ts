/**
 * Client-safe barrel — no `server-only` modules.
 * API routes and scripts: use `@/lib/certificates/server` or subpaths.
 */

export {
  CERTIFICATE_HASH_ALGORITHM_IDS,
  type CertificateHashAlgorithmId,
  CLIENT_HASH_ALGORITHM_IDS,
  DEFAULT_CERTIFICATE_HASH_ALGORITHM,
  hashAlgorithmLabel,
  isCertificateHashAlgorithmId,
  isClientHashAlgorithmSupported,
  resolveCertificateHashAlgorithm,
} from "./digest/algorithms";
export { bytesToHex, digestsMatch, normalizeDigestHex } from "./digest/bytes-to-hex";
export {
  type ClientHashProvider,
  digestCertificateBytesInBrowser,
  registerClientHashProvider,
} from "./hash/client";
export { base64UrlToUtf8, utf8ToBase64Url } from "./identity/base64url";
export {
  type CvCertificateEntry,
  certificateIdFromFilename,
  filenameFromCertificateId,
  findCertificateByFilename,
  findCertificateById,
} from "./identity/id";
export {
  assertCertificateFilename,
  certificateFilePath,
  findVisibleCertificateById,
  isHiddenCertificate,
  listVisibleCertificates,
  visibleCertificateIds,
} from "./registry/registry";
export {
  HostedVerificationError,
  runHostedVerificationCheck,
  type ServerVerifyPayload,
} from "./verification/client-check";
export {
  deriveVerificationStatus,
  finalizeHostedVerification,
  type HostedVerificationResult,
  hostedVerificationMatches,
} from "./verification/result";
