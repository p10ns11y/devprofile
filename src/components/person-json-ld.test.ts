import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { PersonJsonLd } from "@/components/person-json-ld";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("PersonJsonLd", () => {
  it("renders a Person record with approved titles and claims", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    const html = renderToStaticMarkup(PersonJsonLd());
    expect(html).toContain("application/ld+json");
    const match = html.match(/<script[^>]*>({[\s\S]*})<\/script>/);
    expect(match).not.toBeNull();
    const json = JSON.parse(match?.[1] ?? "{}") as {
      jobTitle: string;
      sameAs: string[];
      description: string;
      mainEntityOfPage: string;
    };

    expect(json.jobTitle).toBe("Senior Fullstack Engineer and Product Engineer");
    expect(json.sameAs).toContain("https://www.linkedin.com/in/sathyam-peram/");
    expect(json.description).toContain(
      "Independent AI/SI product and systems engineering (agentic workflows)"
    );
    expect(json.description).toContain("EU work authorised, no sponsorship needed");
    expect(json.description).toContain("can start within two weeks of an offer");
    expect(json.mainEntityOfPage).toBe("https://example.test/llms.txt");
  });
});
