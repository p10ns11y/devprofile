import {
  certificateIdFromFilename,
  findCertificateByFilename,
  findCertificateById,
  type CvCertificateEntry,
} from "@/lib/certificate-id";
import cvData from "@/data/cvdata.json";

const hiddenCertificateCoursePattern = /human trafficking/i;
const hiddenCertificateFilenames = new Set([
  "polaris-ht101-certificate-template.png",
  "polaris-ht101-social-certificate-template.png",
]);

const filenamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._\-() ]*\.(pdf|png|jpe?g)$/i;

export function assertCertificateFilename(filename: string): void {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  if (base !== filename || base.includes("..") || !filenamePattern.test(base)) {
    throw new Error("Invalid certificate filename");
  }
}

export function isHiddenCertificate(filename: string): boolean {
  if (hiddenCertificateFilenames.has(filename)) {
    return true;
  }
  const meta = findCertificateByFilename(filename);
  if (!meta) {
    return false;
  }
  return hiddenCertificateCoursePattern.test(meta.course);
}

export function findVisibleCertificateById(certificateId: string): CvCertificateEntry | undefined {
  const cert = findCertificateById(certificateId);
  if (!cert || isHiddenCertificate(cert.filename)) {
    return undefined;
  }
  return cert;
}

export function listVisibleCertificates(): CvCertificateEntry[] {
  return cvData.certificates.filter((cert) => !isHiddenCertificate(cert.filename));
}

export function visibleCertificateIds(): Set<string> {
  return new Set(listVisibleCertificates().map((cert) => certificateIdFromFilename(cert.filename)));
}

export function certificateFilePath(filename: string): string {
  assertCertificateFilename(filename);
  return `public/certificates/${filename}`;
}
