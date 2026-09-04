import { describe, expect, it } from "vitest";
import cvdata from "./cvdata.json";
import {
  getProjectWalkthrough,
  listProjectWalkthroughs,
  PROJECT_WALKTHROUGHS,
  projectWalkthroughSlugs,
  walkthroughSectionsByBand,
} from "./project-walkthroughs";

const REQUIRED_SECTION_IDS = [
  "product",
  "architecture",
  "components",
  "data-flow",
  "tradeoffs",
  "testing-ops",
] as const;

function blockTextLength(block: (typeof PROJECT_WALKTHROUGHS)[number]["sections"][number]["blocks"][number]): number {
  switch (block.type) {
    case "paragraph":
    case "callout":
      return block.text.length;
    case "bullets":
      return block.items.join(" ").length;
    case "flow":
      return block.steps.join(" ").length;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

describe("project-walkthroughs", () => {
  it("lists four substantive walkthroughs with unique slugs", () => {
    const projects = listProjectWalkthroughs();
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(4);
    expect(new Set(projectWalkthroughSlugs()).size).toBe(projects.length);
  });

  it("ties every walkthrough to a cvdata project key with product-led structure", () => {
    for (const project of PROJECT_WALKTHROUGHS) {
      const cvProject = cvdata.projects.find((row) => row.key === project.cvdataKey);
      expect(cvProject, project.cvdataKey).toBeDefined();
      expect(project.repoUrl).toMatch(/^https:\/\//);
      expect(project.lede.length).toBeGreaterThan(40);
      expect(project.audience.length).toBeGreaterThan(20);
      expect(project.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(project.surfaces.length).toBeGreaterThanOrEqual(2);
      expect(project.sections.map((section) => section.id)).toEqual([...REQUIRED_SECTION_IDS]);
      expect(walkthroughSectionsByBand(project, "product").length).toBeGreaterThanOrEqual(1);
      expect(walkthroughSectionsByBand(project, "tech").length).toBeGreaterThanOrEqual(4);

      for (const section of project.sections) {
        expect(section.blocks.length).toBeGreaterThanOrEqual(1);
        for (const block of section.blocks) {
          expect(blockTextLength(block)).toBeGreaterThan(20);
          if (block.type === "paragraph" || block.type === "callout") {
            expect(block.text.toLowerCase()).not.toContain("lorem");
          }
          if (block.type === "bullets") {
            expect(block.items.length).toBeGreaterThanOrEqual(2);
            for (const item of block.items) {
              expect(item.toLowerCase()).not.toContain("lorem");
            }
          }
          if (block.type === "flow") {
            expect(block.steps.length).toBeGreaterThanOrEqual(3);
          }
        }
      }
    }
  });

  it("resolves known slugs and rejects unknown", () => {
    expect(getProjectWalkthrough("collab-finder")?.cvdataKey).toBe("collab-finder");
    expect(getProjectWalkthrough("missing-project")).toBeUndefined();
  });
});
