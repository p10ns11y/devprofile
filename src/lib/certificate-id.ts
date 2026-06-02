import cvData from "@/data/cvdata.json";

export type CvCertificateEntry = (typeof cvData.certificates)[number] & {
  hashAlgorithm?: string | null;
  blake3Hash?: string | null;
};

/** URL-safe base64 without Node's `base64url` (unsupported in browser Buffer polyfills). */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const padded = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** URL-safe id from exact filename (bijective; no sanitization collisions). */
export function certificateIdFromFilename(filename: string): string {
  return bytesToBase64Url(new TextEncoder().encode(filename));
}

export function filenameFromCertificateId(certificateId: string): string | null {
  try {
    const filename = new TextDecoder().decode(base64UrlToBytes(certificateId));
    const known = cvData.certificates.some((cert) => cert.filename === filename);
    return known ? filename : null;
  } catch {
    return null;
  }
}

export function findCertificateByFilename(filename: string): CvCertificateEntry | undefined {
  return cvData.certificates.find((cert) => cert.filename === filename);
}

export function findCertificateById(certificateId: string): CvCertificateEntry | undefined {
  const filename = filenameFromCertificateId(certificateId);
  return filename ? findCertificateByFilename(filename) : undefined;
}
