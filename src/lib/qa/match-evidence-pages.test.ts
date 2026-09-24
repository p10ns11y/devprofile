import { describe, expect, it } from "vitest";
import { matchEvidencePages } from "./match-evidence-pages";

describe("matchEvidencePages", () => {
  it("returns no links when nothing matches", () => {
    expect(matchEvidencePages("What is your favourite colour?", "Blue, mostly.")).toEqual([]);
  });

  it("ranks stronger keyword hits first and caps at three", () => {
    const links = matchEvidencePages(
      "Your 2016 thesis on Energy Efficiency as a Service — how does that inform agentic AI?",
      "The EEaaS orchestration loop still applies to agents and on-device intelligence."
    );

    expect(links.length).toBeLessThanOrEqual(3);
    expect(links[0]?.id).toBe("focus-eeaas");
    expect(links.some((link) => link.id === "profile-long-arc")).toBe(true);
  });

  it("prefers higher scores and breaks ties by id", () => {
    const links = matchEvidencePages(
      "What did you build in collab-finder?",
      "collab-finder is a desktop job-hunt app with local database and Tauri."
    );

    expect(links[0]?.id).toBe("shipped-collab-finder");
    expect(links.every((link) => link.score > 0)).toBe(true);
    expect(new Set(links.map((link) => link.id)).size).toBe(links.length);
  });

  it("builds hrefs with anchors when present", () => {
    const links = matchEvidencePages(
      "What is your target compensation range?",
      "See the pay report target range section."
    );

    expect(links[0]?.href).toBe("/pay-report#target-range");
  });

  it("does not match keywords inside other words", () => {
    const lawsLinks = matchEvidencePages(
      "Tell me about uncertainty-laws",
      "uncertainty-laws is a concept in decision theory."
    );
    expect(lawsLinks.some((link) => link.id === "certificates")).toBe(false);

    const generateLinks = matchEvidencePages(
      "How do you generate apply PDFs?",
      "We generate PDFs locally without another model call."
    );
    expect(generateLinks.some((link) => link.id === "pay-target-range")).toBe(false);
  });
});
