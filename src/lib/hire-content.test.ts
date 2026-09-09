import { describe, expect, it } from "vitest";
import { getHireContent } from "@/lib/hire-content";
import { getHireStressContent } from "@/lib/hire-stress-fixtures";

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
    expect(content.proofs.length).toBeGreaterThanOrEqual(4);
    expect(content.proofs.length).toBeLessThanOrEqual(6);
    const collab = content.proofs.find((proof) => proof.n === 2);
    expect(collab?.href?.url).toContain("github.com/p10ns11y/collab-finder");
  });

  it("exposes quiet hero links from cvdata", () => {
    const content = getHireContent();
    expect(content.heroActions).toHaveLength(1);
    expect(content.heroLinks.length).toBeGreaterThanOrEqual(3);
  });

  it("includes evidenced systems graph nodes only", () => {
    const { systems } = getHireContent();
    expect(systems.nodes.map((n) => n.id)).toContain("cvdata");
    expect(systems.edges.every((e) => e.label.length > 0)).toBe(true);
  });
});

describe("hire stress fixtures", () => {
  it("extends copy without inventing new claims", () => {
    const base = getHireContent();
    const stressed = getHireStressContent("long-thesis");
    expect(stressed.thesis.length).toBeGreaterThan(base.thesis.length);
    expect(stressed.thesis).toContain("LCV stress padding");
    expect(stressed.thesis).toContain(base.thesis);
  });
});
