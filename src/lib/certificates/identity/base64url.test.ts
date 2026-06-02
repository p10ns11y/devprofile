import { describe, expect, it } from "vitest";

import { base64UrlToUtf8, utf8ToBase64Url } from "./base64url";

describe("base64url", () => {
  it("round-trips UTF-8 filenames", () => {
    const filename = "JavaScriptTestingCertificate.pdf";
    expect(base64UrlToUtf8(utf8ToBase64Url(filename))).toBe(filename);
    expect(utf8ToBase64Url(filename)).toBe("SmF2YVNjcmlwdFRlc3RpbmdDZXJ0aWZpY2F0ZS5wZGY");
  });

  it("matches Node Buffer base64url when available", () => {
    const filename = "Coursera 0UXP2OPIYHPS.pdf";
    const encoded = utf8ToBase64Url(filename);
    const nodeEncoded = Buffer.from(filename, "utf8").toString("base64url");
    expect(encoded).toBe(nodeEncoded);
  });
});
