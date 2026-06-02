import { describe, expect, it } from "vitest";
import {
  certificateIdFromFilename,
  filenameFromCertificateId,
  findCertificateById,
} from "./certificate-id";

describe("certificateIdFromFilename", () => {
  it("round-trips filename via base64url id", () => {
    const filename = "JavaScriptTestingCertificate.pdf";
    const id = certificateIdFromFilename(filename);
    expect(id).not.toMatch(/^cert-/);
    expect(filenameFromCertificateId(id)).toBe(filename);
    expect(findCertificateById(id)?.filename).toBe(filename);
  });

  it("returns undefined for unknown ids", () => {
    expect(findCertificateById("not-a-valid-base64url-certificate-id")).toBeUndefined();
  });
});
