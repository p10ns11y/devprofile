import { describe, expect, it } from "vitest";
import { getHireContent, HIRE_PROOF_CAP, HIRE_PROOF_FLOOR } from "@/lib/hire-content";

describe("getHireContent", () => {
  it("reads hire copy from cvdata.landing only", () => {
    const content = getHireContent();
    const blob = JSON.stringify(content);
    expect(content.role).toContain("AI-native");
    expect(content.place).toBe("Available now");
    expect(content.thesis).toMatch(/Scarce: shipping agentic workflows/);
    expect(blob).not.toMatch(/ReactJS/);
    expect(blob).not.toMatch(/9\+ years in scalable/);
    expect(blob).not.toMatch(/https:\/\/kanithanj\.ai/);
  });

  it("caps proofs for hire surface and keeps repo links", () => {
    const content = getHireContent();
    expect(content.proofs.length).toBeGreaterThanOrEqual(HIRE_PROOF_FLOOR);
    expect(content.proofs.length).toBeLessThanOrEqual(HIRE_PROOF_CAP);
    const collab = content.proofs.find((proof) => proof.n === 2);
    expect(collab?.href?.url).toContain("github.com/p10ns11y/collab-finder");
  });

  it("exposes Building as the only primary action and text secondaries", () => {
    const content = getHireContent();
    expect(content.heroActions).toHaveLength(1);
    expect(content.heroActions[0]?.label).toBe("Building");
    expect(content.heroActions[0]?.variant).toBe("primary");
    expect(content.heroLinks.map((link) => link.label)).toEqual(["View CV", "Q&A", "Articles"]);
  });

  it("includes evidenced systems graph nodes only", () => {
    const { systems } = getHireContent();
    expect(systems.nodes.map((node) => node.id)).toEqual([
      "cvdata",
      "devprofile",
      "collab-finder",
      "ensembly",
    ]);
    expect(systems.nodes.map((node) => node.id)).not.toContain("life-os");
    expect(systems.edges.every((edge) => edge.label.length > 0)).toBe(true);
  });
});
