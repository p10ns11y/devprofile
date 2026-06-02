import { describe, expect, it } from "vitest";

import { certificateIdFromFilename } from "../identity/id";
import {
  assertCertificateFilename,
  certificateFilePath,
  findVisibleCertificateById,
  isHiddenCertificate,
  listVisibleCertificates,
  visibleCertificateIds,
} from "./registry";

describe("findVisibleCertificateById", () => {
  it("returns undefined for hidden certificates", () => {
    const hiddenId = certificateIdFromFilename("polaris-ht101-certificate-template.png");
    expect(findVisibleCertificateById(hiddenId)).toBeUndefined();
  });

  it("returns metadata for visible certificates", () => {
    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    expect(findVisibleCertificateById(id)?.filename).toBe("JavaScriptTestingCertificate.pdf");
  });

  it("returns undefined for unknown ids", () => {
    expect(findVisibleCertificateById("not-a-real-id")).toBeUndefined();
  });
});

describe("isHiddenCertificate", () => {
  it("hides blocklisted filenames", () => {
    expect(isHiddenCertificate("polaris-ht101-certificate-template.png")).toBe(true);
  });

  it("hides human trafficking course by title", () => {
    expect(isHiddenCertificate("polaris-ht101-certificate-template.png")).toBe(true);
  });

  it("does not hide visible certs", () => {
    expect(isHiddenCertificate("JavaScriptTestingCertificate.pdf")).toBe(false);
  });

  it("returns false for filenames not in cvdata", () => {
    expect(isHiddenCertificate("not-in-cvdata.pdf")).toBe(false);
  });
});

describe("assertCertificateFilename", () => {
  it("accepts valid basenames", () => {
    expect(() => assertCertificateFilename("JavaScriptTestingCertificate.pdf")).not.toThrow();
  });

  it("rejects path traversal", () => {
    expect(() => assertCertificateFilename("../evil.pdf")).toThrow(/Invalid certificate filename/);
    expect(() => assertCertificateFilename("sub/file.pdf")).toThrow(/Invalid certificate filename/);
  });
});

describe("certificateFilePath", () => {
  it("returns public path for valid filename", () => {
    expect(certificateFilePath("test.pdf")).toBe("public/certificates/test.pdf");
  });
});

describe("listVisibleCertificates", () => {
  it("excludes hidden entries", () => {
    const filenames = listVisibleCertificates().map((c) => c.filename);
    expect(filenames).not.toContain("polaris-ht101-certificate-template.png");
    expect(filenames).toContain("JavaScriptTestingCertificate.pdf");
  });
});

describe("visibleCertificateIds", () => {
  it("contains id for a visible cert", () => {
    const id = certificateIdFromFilename("JavaScriptTestingCertificate.pdf");
    expect(visibleCertificateIds().has(id)).toBe(true);
  });
});
