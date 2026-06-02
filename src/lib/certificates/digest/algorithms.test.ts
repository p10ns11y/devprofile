import { describe, expect, it } from "vitest";

import {
  CLIENT_HASH_ALGORITHM_IDS,
  DEFAULT_CERTIFICATE_HASH_ALGORITHM,
  hashAlgorithmLabel,
  isCertificateHashAlgorithmId,
  isClientHashAlgorithmSupported,
  resolveCertificateHashAlgorithm,
} from "./algorithms";

describe("resolveCertificateHashAlgorithm", () => {
  it("defaults to sha256", () => {
    expect(resolveCertificateHashAlgorithm({})).toBe("sha256");
  });

  it("uses hashAlgorithm when valid", () => {
    expect(resolveCertificateHashAlgorithm({ hashAlgorithm: "blake3" })).toBe("blake3");
  });

  it("falls back for unknown algorithm", () => {
    expect(resolveCertificateHashAlgorithm({ hashAlgorithm: "md5" })).toBe(
      DEFAULT_CERTIFICATE_HASH_ALGORITHM
    );
  });
});

describe("isCertificateHashAlgorithmId", () => {
  it("narrows known ids", () => {
    expect(isCertificateHashAlgorithmId("sha256")).toBe(true);
    expect(isCertificateHashAlgorithmId("nope")).toBe(false);
  });
});

describe("isClientHashAlgorithmSupported", () => {
  it("lists browser-supported algorithms", () => {
    expect(isClientHashAlgorithmSupported("sha256")).toBe(true);
    expect(isClientHashAlgorithmSupported("blake3")).toBe(false);
    expect(CLIENT_HASH_ALGORITHM_IDS).toContain("sha256");
  });
});

describe("hashAlgorithmLabel", () => {
  it("returns human labels", () => {
    expect(hashAlgorithmLabel("sha256")).toBe("SHA-256");
    expect(hashAlgorithmLabel("blake3")).toBe("BLAKE3");
  });
});
