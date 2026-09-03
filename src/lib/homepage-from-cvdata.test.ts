import { describe, expect, it } from "vitest";
import cvdata from "@/data/cvdata.json";
import { getWorkClaims, recentCourses } from "./homepage-from-cvdata";

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

  it("points Innovative Adjacent Thinking at IEEE, Wiley, and the thesis PDF", () => {
    const { claims } = getWorkClaims();
    const adjacent = claims.find((claim) => claim.id === "adjacent");
    const ieee = adjacent?.evidence.find((item) => item.id === "PP-ieee");
    expect(ieee?.hrefs.map((link) => link.label)).toEqual(["IEEE", "Wiley", "Thesis"]);
    expect(ieee?.hrefs.map((link) => link.url)).toEqual([
      "https://ieeexplore.ieee.org/document/7396150",
      "https://onlinelibrary.wiley.com/doi/10.1155/2017/6562915",
      "/pdfs/master-thesis.pdf",
    ]);
    expect(ieee?.hrefs.some((link) => link.url === "/articles")).toBe(false);
  });

  it("points the Weavler Babel plugin Source at the npm package", () => {
    const { claims } = getWorkClaims();
    const creative = claims.find((claim) => claim.id === "creative");
    const babel = creative?.evidence.find((item) => item.id === "PP-babel-i18n");
    expect(babel?.href?.label).toBe("Source");
    expect(babel?.href?.url).toBe(
      "https://www.npmjs.com/package/babel-plugin-react-intl-messages-generator"
    );
  });
});

describe("recentCourses", () => {
  it("keeps proof URLs on Cilium and the two LangChain courses", () => {
    const byName = new Map(recentCourses().map((course) => [course.name, course.url]));
    expect(byName.get("Cilium AI/ML Security")).toContain("credly.com/badges");
    expect(byName.get("LangChain Chat with Your Data")).toContain("learn.deeplearning.ai");
    expect(byName.get("Build LLM Apps with LangChain.js")).toContain("learn.deeplearning.ai");
  });
});
