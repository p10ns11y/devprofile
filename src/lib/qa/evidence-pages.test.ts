import { describe, expect, it } from "vitest";
import { profileDeckNav, resolveSlideIndex, slideIndexById } from "@/data/profile-deck";
import { evidencePageHref, QA_EVIDENCE_PAGES } from "./evidence-pages";
import { validateEvidencePageLink, validateEvidencePageMap } from "./evidence-pages-validate";

function profileSlideParam(link: (typeof QA_EVIDENCE_PAGES)[number]): string {
  const prefix = "slide=";
  if (!link.search?.startsWith(prefix)) {
    throw new Error(`Expected ${link.id} search to start with ${prefix}`);
  }
  return link.search.slice(prefix.length);
}

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

  it("requires every /profile entry to use a real chapter slide param", () => {
    const profileLinks = QA_EVIDENCE_PAGES.filter((link) => link.path === "/profile");
    expect(profileLinks.length).toBe(4);

    for (const link of profileLinks) {
      const slideParam = profileSlideParam(link);
      const chapter = profileDeckNav.find((entry) => entry.id === slideParam);
      expect(chapter, `${link.id} slide=${slideParam}`).toBeDefined();

      const resolved = resolveSlideIndex(slideParam);
      const chapterStart = slideIndexById(chapter!.firstSlideId);
      expect(resolved, `${link.id} resolved index`).toBe(chapterStart);
      expect(resolved, `${link.id} slide-0 fallback`).toBeGreaterThan(0);
    }
  });

  it("builds profile hrefs with chapter slide params", () => {
    const profileLongArc = QA_EVIDENCE_PAGES.find((link) => link.id === "profile-long-arc");
    expect(profileLongArc).toBeDefined();
    expect(evidencePageHref(profileLongArc!)).toBe("/profile?slide=long-arc");
  });
});
