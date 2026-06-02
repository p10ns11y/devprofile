import { describe, expect, it } from "vitest";

import { certificateIdFromFilename, filenameFromCertificateId, findCertificateById } from "./id";

describe("certificateIdFromFilename", () => {
  it("round-trips JavaScriptTestingCertificate.pdf", () => {
    const filename = "JavaScriptTestingCertificate.pdf";
    const id = certificateIdFromFilename(filename);
    expect(id).toBe("SmF2YVNjcmlwdFRlc3RpbmdDZXJ0aWZpY2F0ZS5wZGY");
    expect(filenameFromCertificateId(id)).toBe(filename);
    expect(findCertificateById(id)?.filename).toBe(filename);
  });

  it("does not collide filenames that shared the old sanitized id", () => {
    const a = certificateIdFromFilename("file one.pdf");
    const b = certificateIdFromFilename("file-one.pdf");
    expect(a).not.toBe(b);
  });

  it("returns undefined for unknown ids", () => {
    expect(findCertificateById("cert-does-not-exist")).toBeUndefined();
    expect(filenameFromCertificateId("not-valid-base64url!!!")).toBeUndefined();
  });

  it("rejects ids that fail round-trip guard", () => {
    const filename = "JavaScriptTestingCertificate.pdf";
    const tampered = `${certificateIdFromFilename(filename)}x`;
    expect(filenameFromCertificateId(tampered)).toBeUndefined();
  });
});
