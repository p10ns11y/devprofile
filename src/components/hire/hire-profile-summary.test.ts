import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HireProfileSummary } from "@/components/hire/hire-landing";

function visibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

describe("HireProfileSummary", () => {
  it("renders a short visible summary with the current headline and claims", () => {
    const html = renderToStaticMarkup(HireProfileSummary());
    const text = visibleText(html);

    expect(html).toContain('id="profile-summary"');
    expect(html).toContain("Senior Product and Systems Engineer");
    expect(html).toContain("AI/SI agentic workflows");
    expect(html).toContain("can start within two weeks of an offer");
    expect(html).toContain("no sponsorship needed");
    expect(html).toContain("https://github.com/p10ns11y/adaptate");
    expect(html).toContain("https://kanithanj-ai.vercel.app");
    expect(html).not.toContain("kanithanj.ai");
    expect(html).not.toContain("ran the public API");
    expect(html).not.toContain("Family care");
    expect(html).not.toContain("family-care");
    expect(html).not.toContain("85k");
    expect(html).not.toContain("display:none");
    expect(html).not.toContain("sr-only");
    expect(html).not.toContain("hidden");
    const words = text.split(" ").length;
    expect(words).toBeGreaterThan(90);
    expect(words).toBeLessThanOrEqual(140);
  });
});
