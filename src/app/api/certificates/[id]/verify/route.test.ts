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
    expect(body.algorithmLabel).toBe("SHA-256");
    expect(typeof body.timestamp).toBe("string");
  });

  it("returns 400 for invalid certificate id", async () => {
    const res = await GET(verifyRequest(), {
      params: Promise.resolve({ id: "" }),
    });
    expect(res.status).toBe(400);
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("returns 501 when hash algorithm is not configured", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    mockVerify.mockRejectedValue(
      new Error('Hash algorithm "blake3" is not configured on the server')
    );
    const res = await GET(verifyRequest(), {
      params: Promise.resolve({ id: visiblePartial.certificateId }),
    });

    expect(res.status).toBe(501);
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("returns 500 and logs unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    mockVerify.mockRejectedValue(new Error("disk read failed"));
    const res = await GET(verifyRequest(), {
      params: Promise.resolve({ id: visiblePartial.certificateId }),
    });

    expect(res.status).toBe(500);
    expect(consoleError).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
