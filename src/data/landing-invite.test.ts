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

  it("keeps six numbered proofs and the 2026 slice disclaimer", () => {
    expect(landingInvite.proofs).toHaveLength(6);
    expect(landingInvite.proofs.map((proof) => proof.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(landingInvite.nowDisclaimer).toMatch(/March to August 2026/);
    const collab = landingInvite.proofs.find((proof) => proof.n === 2);
    expect(collab?.href?.url).toContain("github.com/p10ns11y/collab-finder");
  });
});
