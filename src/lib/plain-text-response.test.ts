import { afterEach, describe, expect, it } from "vitest";
import { GET as getAgentsMd } from "@/app/agents.md/route";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { FOCUS_ESSAYS } from "@/data/focus-essays";
import { PROJECT_WALKTHROUGHS } from "@/data/project-walkthroughs";
import { PLAIN_TEXT_CONTENT_TYPE } from "@/lib/plain-text-response";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("agent profile text routes", () => {
  it("serves /llms.txt as plain text", async () => {
    const response = await getLlmsTxt();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(PLAIN_TEXT_CONTENT_TYPE);
    expect(body).toContain("Peramanathan Sathyamoorthy");
    expect(body).toContain("https://captain.kingsparrow.space/agents.md");
    expect(body).toContain("sathyam.peram@gmail.com");
  });

  it("serves /agents.md as plain text", async () => {
    const response = await getAgentsMd();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(PLAIN_TEXT_CONTENT_TYPE);
    expect(body).toContain("Swedish citizen, based in Stockholm");
    expect(body).toContain("https://github.com/p10ns11y/adaptate");
    expect(body).toContain("Full Stack Developer");
  });
});

describe("robots and sitemap", () => {
  it("points robots.txt at the metadata origin sitemap and keeps api and dev out", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/"],
      },
      sitemap: "https://example.test/sitemap.xml",
    });
  });

  it("includes public pages, articles, and shipped walkthroughs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://example.test/");
    expect(urls).toContain("https://example.test/llms.txt");
    expect(urls).toContain("https://example.test/agents.md");
    expect(urls).toContain("https://example.test/articles");
    expect(urls).toContain("https://example.test/shipped");
    for (const essay of FOCUS_ESSAYS) {
      expect(urls).toContain(`https://example.test${essay.href}`);
    }
    for (const walkthrough of PROJECT_WALKTHROUGHS) {
      expect(urls).toContain(`https://example.test/shipped/${walkthrough.slug}`);
    }
    expect(urls).not.toContain("https://example.test/api/cv/download");
    expect(urls).not.toContain("https://example.test/dev/ghcards-preview");
  });
});
