import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HireProfileSummary } from "@/components/hire/hire-landing";

describe("HireProfileSummary", () => {
  it("renders visible summary text with approved titles and claims", () => {
    const html = renderToStaticMarkup(HireProfileSummary());

    expect(html).toContain('id="profile-summary"');
    expect(html).toContain("Senior Fullstack Engineer and Product Engineer");
    expect(html).toContain("Independent AI/SI product and systems engineering (agentic workflows)");
    expect(html).toContain("Much of my deep-learning and systems work is private and not public");
    expect(html).toContain("can start within two weeks of an offer");
    expect(html).toContain("no sponsorship needed");
    expect(html).toContain('href="/llms.txt"');
    expect(html).not.toContain("display:none");
    expect(html).not.toContain("sr-only");
    expect(html).not.toContain("hidden");
  });
});
