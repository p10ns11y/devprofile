import { describe, expect, it } from "vitest";

import { certificateIdFromFilename } from "../identity/id";
import { findVisibleCertificateById } from "./registry";

describe("findVisibleCertificateById", () => {
  it("returns undefined for hidden certificates", () => {
    const hiddenId = certificateIdFromFilename("polaris-ht101-certificate-template.png");
    expect(findVisibleCertificateById(hiddenId)).toBeUndefined();
  });

  it("returns metadata for visible certificates", () => {
    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    expect(findVisibleCertificateById(id)?.filename).toBe("JavaScriptTestingCertificate.pdf");
  });
});
