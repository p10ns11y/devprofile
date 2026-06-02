import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { getExpectedDigest } from "@/lib/certificate-digest";
import { digestCertificateFileOnServer } from "@/lib/certificate-hash-server";
import { isClientHashAlgorithmSupported } from "@/lib/certificate-hash-algorithms";
import {
  assertCertificateFilename,
  certificateFilePath,
  findVisibleCertificateById,
} from "@/lib/certificate-registry";
import type { HostedVerificationResult } from "@/lib/certificate-verification";

export async function verifyHostedCertificateOnServer(
  certificateId: string
): Promise<HostedVerificationResult | null> {
  const cert = findVisibleCertificateById(certificateId);
  if (!cert) {
    return null;
  }

  const expected = getExpectedDigest(cert);
  if (!expected) {
    return null;
  }

  assertCertificateFilename(cert.filename);
  const relativePath = certificateFilePath(cert.filename);
  const filePath = path.join(process.cwd(), relativePath);
  const certificatesDir = path.resolve(process.cwd(), "public", "certificates");
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(certificatesDir + path.sep)) {
    throw new Error("Invalid certificate path");
  }

  const fileBuffer = await fs.readFile(resolvedPath);
  const serverDigest = await digestCertificateFileOnServer(expected.algorithm, fileBuffer);

  const serverMatchesExpected = serverDigest === expected.hex;
  const clientSupported = isClientHashAlgorithmSupported(expected.algorithm);

  return {
    certificateId,
    filename: cert.filename,
    algorithm: expected.algorithm,
    expectedDigest: expected.hex,
    serverDigest,
    clientDigest: "",
    match: false,
    serverMatchesExpected,
    clientMatchesExpected: false,
    clientSupported,
  };
}
