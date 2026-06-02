import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { certificateIdFromFilename } from "@/lib/certificates";
import type { HostedVerificationResult } from "@/lib/certificates/verification/result";
import { verifyHostedCertificateOnServer } from "@/lib/certificates/verification/verify-server";

import { GET } from "./route";

vi.mock("@/lib/certificates/verification/verify-server", () => ({
  verifyHostedCertificateOnServer: vi.fn(),
}));

const mockVerify = vi.mocked(verifyHostedCertificateOnServer);

function verifyRequest(): NextRequest {
  return new Request("http://localhost/api/certificates/x/verify") as NextRequest;
}

const visiblePartial: Omit<
  HostedVerificationResult,
  "clientDigest" | "match" | "clientMatchesExpected"
> = {
  certificateId: certificateIdFromFilename("JavaScriptTestingCertificate.pdf"),
  filename: "JavaScriptTestingCertificate.pdf",
  algorithm: "sha256",
  expectedDigest: "aa".repeat(32),
  serverDigest: "aa".repeat(32),
  serverMatchesExpected: true,
  clientSupported: true,
};

describe("GET /api/certificates/[id]/verify", () => {
  beforeEach(() => {
    mockVerify.mockReset();
  });

  it("returns 404 when the certificate is hidden or unknown", async () => {
    mockVerify.mockResolvedValue(null);
    const hiddenId = certificateIdFromFilename("polaris-ht101-certificate-template.png");
    const res = await GET(verifyRequest(), {
      params: Promise.resolve({ id: hiddenId }),
    });
    expect(res.status).toBe(404);
  });

  it("returns verify payload for a visible certificate", async () => {
    mockVerify.mockResolvedValue({
      ...visiblePartial,
      clientDigest: "",
      match: false,
      clientMatchesExpected: false,
    });
    const res = await GET(verifyRequest(), {
      params: Promise.resolve({ id: visiblePartial.certificateId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.filename).toBe("JavaScriptTestingCertificate.pdf");
    expect(body.expectedDigest).toBe(visiblePartial.expectedDigest);
    expect(body.algorithm).toBe("sha256");
  });
});
