import { describe, expect, it } from "vitest";
import { certificateIdFromFilename, findCertificateById } from "./certificate-id";

describe("certificateIdFromFilename", () => {
  it("is stable regardless of array position", () => {
    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    expect(id).toBe("cert-javascripttestingcertificate");
    expect(findCertificateById(id)?.filename).toBe("JavaScriptTestingCertificate.pdf");
  });

  it("returns undefined for unknown ids", () => {
    expect(findCertificateById("cert-does-not-exist")).toBeUndefined();
  });
});
