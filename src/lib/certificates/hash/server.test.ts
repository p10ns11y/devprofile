import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  digestCertificateFileOnServer,
  getServerHashProvider,
  listConfiguredServerAlgorithms,
  registerServerHashProvider,
} from "./server";

describe("digestCertificateFileOnServer", () => {
  it("hashes a real certificate file with sha256", async () => {
    const filePath = path.join(
      process.cwd(),
      "public/certificates/JavaScriptTestingCertificate.pdf"
    );
    const buffer = await readFile(filePath);
    const expected = createHash("sha256").update(buffer).digest("hex");

    const digest = await digestCertificateFileOnServer("sha256", buffer);
    expect(digest).toBe(expected);
  });

  it("throws when algorithm is not registered", async () => {
    await expect(digestCertificateFileOnServer("blake3", Buffer.from("x"))).rejects.toThrow(
      /not configured/
    );
  });
});

describe("listConfiguredServerAlgorithms", () => {
  it("includes sha256 by default", () => {
    expect(listConfiguredServerAlgorithms()).toContain("sha256");
  });
});

describe("registerServerHashProvider", () => {
  it("registers custom providers for digest", async () => {
    registerServerHashProvider({
      id: "blake3",
      label: "BLAKE3",
      digest: () => "cc".repeat(32),
    });
    expect(getServerHashProvider("blake3")?.id).toBe("blake3");
    expect(await digestCertificateFileOnServer("blake3", Buffer.from("x"))).toBe("cc".repeat(32));
  });
});
