import { afterEach, describe, expect, it } from "vitest";
import { GET as getAgentsMd } from "@/app/agents.md/route";
import { GET as getIdeasMd } from "@/app/ideas.md/route";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getLlmsFullTxt } from "@/app/llms-full.txt/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { FOCUS_ESSAYS } from "@/data/focus-essays";
import { PROJECT_WALKTHROUGHS } from "@/data/project-walkthroughs";
import { PLAIN_TEXT_CONTENT_TYPE } from "@/lib/plain-text-response";
import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

const requiredClaims = [
  "https://www.linkedin.com/in/sathyam-peram/",
  "can start within two weeks of an offer",
  "EU work authorised, no sponsorship needed",
  "Senior Product and Systems Engineer · AI/SI agentic workflows",
  "System and Full Stack Developer",
];

const banned = [
  "root of adaptate",
  "Bumbee",
  "Family care",
  "family-care",
  "Hard problems solved",
  "ran the public API",
  "Rust in production and",
];

async function readRoute(get: () => Promise<Response>) {
  const response = await get();
  const body = await response.text();
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe(PLAIN_TEXT_CONTENT_TYPE);
  return body;
}

describe("agent profile text routes", () => {
  it("serves a short /llms.txt index as plain text", async () => {
    const body = await readRoute(getLlmsTxt);
    expect(body).toContain("Peramanathan Sathyamoorthy");
    expect(body).toContain("https://captain.kingsparrow.space/llms-full.txt");
    expect(body).toContain("https://captain.kingsparrow.space/ideas.md");
    expect(body).toContain("https://captain.kingsparrow.space/agents.md");
    expect(body).toContain("sathyam.peram@gmail.com");
    expect(body).toContain("Citizenship: Swedish");
    expect(body).toContain("AI/SI assistants");
    expect(body).toContain("Most of his deep-learning and systems work is private");
    expect(body).toContain("saving network energy");
    expect(body.split(/\s+/).length).toBeGreaterThanOrEqual(300);
    expect(body.split(/\s+/).length).toBeLessThanOrEqual(600);
    for (const claim of requiredClaims) {
      expect(body).toContain(claim);
    }
    for (const phrase of banned) {
      expect(body).not.toContain(phrase);
    }
  });

  it("serves /llms-full.txt as plain text under the word limit", async () => {
    const body = await readRoute(getLlmsFullTxt);
    expect(body).toContain("Citizenship: Swedish");
    expect(body).toContain("The precursor idea first appeared");
    expect(body).toContain("built from scratch");
    expect(body).toContain("Most of his deep-learning and systems work is private");
    expect(body).toContain("https://github.com/p10ns11y/collab-finder");
    expect(body).toContain("saving network energy");
    expect(body).toContain(
      "Energy Efficiency as an Orchestration Service for Mobile Internet of Things"
    );
    expect(body.split(/\s+/).length).toBeLessThanOrEqual(2500);
    for (const claim of requiredClaims) {
      expect(body).toContain(claim);
    }
    for (const phrase of banned) {
      expect(body).not.toContain(phrase);
    }
  });

  it("serves /ideas.md and /agents.md as plain text", async () => {
    const ideas = await readRoute(getIdeasMd);
    const agents = await readRoute(getAgentsMd);

    expect(ideas).toContain("Ideas and working notes");
    expect(ideas).not.toContain("Bumbee");
    expect(ideas).not.toContain("Family care");
    expect(agents).toContain("Swedish citizen, based in Stockholm");
    expect(agents).toContain("https://github.com/p10ns11y/adaptate");
    expect(agents).toContain("https://github.com/p10ns11y/collab-finder");
    expect(agents).toContain("saving network energy");
    for (const claim of requiredClaims) {
      expect(agents).toContain(claim);
    }
    for (const phrase of banned) {
      expect(agents).not.toContain(phrase);
    }
  });
});

describe("robots and sitemap", () => {
  it("points robots.txt at the production sitemap and keeps api and dev out", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/"],
      },
      sitemap: `${PRODUCTION_SITE_ORIGIN}/sitemap.xml`,
    });
  });

  it("includes public pages, profile files, articles, and shipped walkthroughs on the production origin", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/llms.txt`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/llms-full.txt`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/ideas.md`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/agents.md`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/articles`);
    expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/shipped`);
    for (const essay of FOCUS_ESSAYS) {
      expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}${essay.href}`);
    }
    for (const walkthrough of PROJECT_WALKTHROUGHS) {
      expect(urls).toContain(`${PRODUCTION_SITE_ORIGIN}/shipped/${walkthrough.slug}`);
    }
    expect(urls).not.toContain(`${PRODUCTION_SITE_ORIGIN}/pay-report`);
    expect(urls).not.toContain(`${PRODUCTION_SITE_ORIGIN}/api/cv/download`);
    expect(urls).not.toContain(`${PRODUCTION_SITE_ORIGIN}/dev/ghcards-preview`);
  });
});
