import { describe, expect, it, vi } from "vitest";

import { certificateIdFromFilename } from "../identity/id";
import * as registry from "../registry/registry";
import { verifyHostedCertificateOnServer } from "./verify-server";

describe("verifyHostedCertificateOnServer", () => {
  it("returns null for unknown certificate id", async () => {
    expect(await verifyHostedCertificateOnServer("unknown-id")).toBeNull();
  });

  it("returns null for hidden certificate id", async () => {
    const hiddenId = certificateIdFromFilename("polaris-ht101-certificate-template.png");
    expect(await verifyHostedCertificateOnServer(hiddenId)).toBeNull();
  });

  it("returns null when published digest is missing", async () => {
    vi.spyOn(registry, "findVisibleCertificateById").mockReturnValue({
      course: "No hash",
      filename: "JavaScriptTestingCertificate.pdf",
    } as never);

    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    expect(await verifyHostedCertificateOnServer(id)).toBeNull();

    vi.restoreAllMocks();
  });

  it("verifies a visible on-disk certificate against cvdata", async () => {
    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    const result = await verifyHostedCertificateOnServer(id);

    expect(result).not.toBeNull();
    expect(result?.filename).toBe("JavaScriptTestingCertificate.pdf");
    expect(result?.algorithm).toBe("sha256");
    expect(result?.expectedDigest).toBe(
      "1da0d9c0f8f6726a20cbbd52c1aede5b0d28362342ebad2d0c78813d40c22864"
    );
    expect(result?.serverDigest).toBe(result?.expectedDigest);
    expect(result?.serverMatchesExpected).toBe(true);
    expect(result?.clientSupported).toBe(true);
    expect(result?.match).toBe(false);
    expect(result?.clientDigest).toBe("");
  });
});
