import { describe, expect, it } from "vitest";
import { landingInvite } from "./landing-invite";

describe("landingInvite", () => {
  it("reads hire copy from cvdata.landing", () => {
    const blob = JSON.stringify(landingInvite);
    expect(landingInvite.role).toContain("AI-native");
    expect(landingInvite.place).toBe("Available now");
    expect(blob).not.toMatch(/ReactJS/);
    expect(blob).not.toMatch(/9\+ years in scalable/);
    expect(blob).not.toMatch(/Dev Profile/);
    expect(blob).not.toMatch(/https:\/\/kanithanj\.ai/);
  });

  it("keeps six numbered proofs and distilled thesis", () => {
    expect(landingInvite.proofs).toHaveLength(6);
    expect(landingInvite.proofs.map((proof) => proof.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(landingInvite.thesis).toMatch(/Scarce: shipping agentic workflows/);
    expect(landingInvite.nowDisclaimer).toMatch(/March to September 2026/);
    const collab = landingInvite.proofs.find((proof) => proof.n === 2);
    expect(collab?.href?.url).toContain("github.com/p10ns11y/collab-finder");
  });

  it("exposes quiet hero links separate from the primary Building CTA", () => {
    expect(landingInvite.heroActions).toHaveLength(1);
    expect(landingInvite.heroActions[0]?.label).toBe("Building");
    expect(landingInvite.heroLinks.map((link) => link.label)).toEqual([
      "View CV",
      "Q&A",
      "Articles",
    ]);
  });
});
