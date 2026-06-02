import cvData from "@/data/cvdata.json";

export type CvCertificateEntry = (typeof cvData.certificates)[number];

/** Stable id from filename — safe across filter, sort, and cvdata.json reorder. */
export function certificateIdFromFilename(filename: string): string {
  const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const sanitizedName = filenameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  return `cert-${sanitizedName}`;
}

export function findCertificateById(certificateId: string): CvCertificateEntry | undefined {
  return cvData.certificates.find(
    (cert) => certificateIdFromFilename(cert.filename) === certificateId
  );
}
