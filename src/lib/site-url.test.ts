import { afterEach, describe, expect, it } from "vitest";
import { getMetadataBase } from "./site-url";

describe("getMetadataBase", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(getMetadataBase().href).toBe("https://example.test/");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL on Vercel production", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "peramanathan-sathyamoorthy-cv.vercel.app";
    delete process.env.VERCEL_URL;

    expect(getMetadataBase().href).toBe("https://peramanathan-sathyamoorthy-cv.vercel.app/");
  });

  it("falls back to VERCEL_URL for previews", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "captain.kingsparrow.space";

    expect(getMetadataBase().href).toBe("https://captain.kingsparrow.space/");
  });
});
