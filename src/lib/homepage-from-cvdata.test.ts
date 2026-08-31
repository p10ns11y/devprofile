import { describe, expect, it } from "vitest";
import cvdata from "@/data/cvdata.json";
import { getWorkClaims } from "./homepage-from-cvdata";

describe("getWorkClaims", () => {
  it("joins claims to sourced evidence and skips empty claims", () => {
    const { claims } = getWorkClaims();
    const labels = claims.map((claim) => claim.label);
    expect(labels).toContain("Adaptable Problem Solving");
    expect(labels).toContain("End-to-End Testing");
    expect(labels).not.toContain("Behavior Driven Development");
    expect(claims.every((claim) => claim.evidence.length > 0)).toBe(true);
  });

  it("only uses evidence ids that exist in the bank", () => {
    const ids = new Set(cvdata.landing.evidence.map((row) => row.id));
    for (const claim of cvdata.landing.claims) {
      for (const id of claim.evidence) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it("keeps Oneflow metrics that exist in cvdata employment text", () => {
    const blob = cvdata.work_experience.map((row) => row.responsibilities.join(" ")).join(" ");
    expect(blob).toMatch(/70%/);
    expect(blob).toMatch(/200 hours/);
    expect(blob).toMatch(/60%/);
    const { claims } = getWorkClaims();
    const figures = claims.flatMap((claim) => claim.evidence.map((item) => item.figure));
    expect(figures).toContain("70%");
    expect(figures).toContain("200+");
    expect(figures).toContain("60%");
  });

  it("keeps the Oneflow Zod library and adaptate as separate facts", () => {
    const { claims } = getWorkClaims();
    const tdd = claims.find((claim) => claim.id === "tdd");
    const ids = tdd?.evidence.map((item) => item.id) ?? [];
    expect(ids).toContain("PP-zod-lib");
    expect(ids).toContain("PP-adaptate");
    const adaptate = tdd?.evidence.find((item) => item.id === "PP-adaptate");
    expect(adaptate?.detail).toMatch(/ground-up/i);
    expect(adaptate?.detail).toMatch(/Different architecture/);
    expect(adaptate?.detail).toMatch(/Did not port/);
    expect(adaptate?.detail).not.toMatch(/became adaptate/i);
    expect(adaptate?.href?.url).toContain("adaptate");
  });
});

