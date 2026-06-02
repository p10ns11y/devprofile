import cvData from "@/data/cvdata.json";

import { base64UrlToUtf8, utf8ToBase64Url } from "./base64url";

export type CvCertificateEntry = (typeof cvData.certificates)[number] & {
  hashAlgorithm?: string | null;
  sha256Hash?: string;
  blake3Hash?: string;
  fileSize?: number;
  lastVerified?: string;
};

const allowlistedFilenames = new Set(cvData.certificates.map((cert) => cert.filename));

/** Bijective id from exact filename (base64url UTF-8). */
export function certificateIdFromFilename(filename: string): string {
  return utf8ToBase64Url(filename);
}

export function filenameFromCertificateId(certificateId: string): string | undefined {
  try {
    const filename = base64UrlToUtf8(certificateId);
    if (!allowlistedFilenames.has(filename)) {
      return undefined;
    }
    if (certificateIdFromFilename(filename) !== certificateId) {
      return undefined;
    }
    return filename;
  } catch {
    return undefined;
  }
}

export function findCertificateByFilename(filename: string): CvCertificateEntry | undefined {
  return (cvData.certificates as CvCertificateEntry[]).find((cert) => cert.filename === filename);
}

export function findCertificateById(certificateId: string): CvCertificateEntry | undefined {
  const filename = filenameFromCertificateId(certificateId);
  if (!filename) {
    return undefined;
  }
  return findCertificateByFilename(filename);
}
