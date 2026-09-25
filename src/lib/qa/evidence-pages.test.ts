import { describe, expect, it } from "vitest";
import { evidencePageHref, QA_EVIDENCE_PAGES } from "./evidence-pages";
import { validateEvidencePageLink, validateEvidencePageMap } from "./evidence-pages-validate";

describe("QA evidence page map", () => {
  it("keeps every mapped route and anchor valid", () => {
    expect(() => validateEvidencePageMap()).not.toThrow();
  });

  it("uses unique link ids", () => {
    const ids = QA_EVIDENCE_PAGES.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("fails fast when an anchor disappears from source", () => {
    const broken = QA_EVIDENCE_PAGES.find((link) => link.id === "pay-target-range");
    expect(broken).toBeDefined();

    const message = validateEvidencePageLink({
      ...broken!,
      anchor: "this-anchor-does-not-exist",
    });

    expect(message).toMatch(/Anchor "#this-anchor-does-not-exist"/);
  });

  it("fails fast when a route file is missing", () => {
    const message = validateEvidencePageLink({
      id: "missing-route",
      path: "/definitely-not-a-route",
      label: "Missing",
      keywords: ["missing"],
    });

    expect(message).toMatch(/Route file missing/);
  });

  it("requires scroll mode for every /profile entry", () => {
    const profileLinks = QA_EVIDENCE_PAGES.filter((link) => link.path === "/profile");
    expect(profileLinks.length).toBeGreaterThan(0);
    expect(profileLinks.every((link) => link.search === "view=scroll")).toBe(true);
  });

  it("builds profile hrefs with view=scroll before the anchor", () => {
    const profileLongArc = QA_EVIDENCE_PAGES.find((link) => link.id === "profile-long-arc");
    expect(profileLongArc).toBeDefined();
    expect(evidencePageHref(profileLongArc!)).toBe("/profile?view=scroll#long-arc");
  });
});
