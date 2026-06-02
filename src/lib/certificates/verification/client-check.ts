import { digestCertificateBytesInBrowser } from "../hash/client";
import { finalizeHostedVerification, type HostedVerificationResult } from "./result";

export type ServerVerifyPayload = Omit<
  HostedVerificationResult,
  "clientDigest" | "match" | "clientMatchesExpected"
> & {
  algorithmLabel?: string;
  timestamp?: string;
};

export class HostedVerificationError extends Error {
  constructor(
    readonly code: "verify_failed" | "algorithm_unsupported" | "file_fetch_failed",
    message?: string
  ) {
    super(message ?? code);
    this.name = "HostedVerificationError";
  }
}

/** Fetches verify API and hosted file in parallel, then hashes bytes in the browser. */
export async function runHostedVerificationCheck(
  certificateId: string,
  documentPath: string,
  signal?: AbortSignal
): Promise<HostedVerificationResult> {
  const verifyUrl = `/api/certificates/${encodeURIComponent(certificateId)}/verify`;

  const [verifyResponse, fileResponse] = await Promise.all([
    fetch(verifyUrl, { cache: "no-store", signal }),
    fetch(documentPath, { cache: "no-store", signal }),
  ]);

  if (!verifyResponse.ok) {
    throw new HostedVerificationError("verify_failed");
  }

  const serverPayload = (await verifyResponse.json()) as ServerVerifyPayload;

  if (!serverPayload.clientSupported) {
    throw new HostedVerificationError("algorithm_unsupported");
  }

  if (!fileResponse.ok) {
    throw new HostedVerificationError("file_fetch_failed");
  }

  const bytes = await fileResponse.arrayBuffer();
  const clientDigest = await digestCertificateBytesInBrowser(serverPayload.algorithm, bytes);

  return finalizeHostedVerification(serverPayload, clientDigest);
}
