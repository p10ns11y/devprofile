import { describe, expect, it } from "vitest";
import cvdata from "./cvdata.json";
import {
  getProjectWalkthrough,
  listProjectWalkthroughs,
  PROJECT_WALKTHROUGHS,
  projectWalkthroughSlugs,
} from "./project-walkthroughs";

const REQUIRED_SECTION_IDS = [
  "problem",
  "architecture",
  "components",
  "data-flow",
  "tradeoffs",
  "testing-ops",
] as const;

describe("project-walkthroughs", () => {
  it("lists four substantive walkthroughs with unique slugs", () => {
    const projects = listProjectWalkthroughs();
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(4);
    expect(new Set(projectWalkthroughSlugs()).size).toBe(projects.length);
  });

  it("ties every walkthrough to a cvdata project key", () => {
    for (const project of PROJECT_WALKTHROUGHS) {
      const cvProject = cvdata.projects.find((row) => row.key === project.cvdataKey);
      expect(cvProject, project.cvdataKey).toBeDefined();
      expect(project.repoUrl).toMatch(/^https:\/\//);
      expect(project.lede.length).toBeGreaterThan(40);
      expect(project.sections.map((section) => section.id)).toEqual([...REQUIRED_SECTION_IDS]);
      for (const section of project.sections) {
        expect(section.paragraphs.length).toBeGreaterThanOrEqual(2);
        for (const paragraph of section.paragraphs) {
          expect(paragraph.toLowerCase()).not.toContain("lorem");
          expect(paragraph.length).toBeGreaterThan(40);
        }
      }
    }
  });

  it("resolves known slugs and rejects unknown", () => {
    expect(getProjectWalkthrough("collab-finder")?.cvdataKey).toBe("collab-finder");
    expect(getProjectWalkthrough("missing-project")).toBeUndefined();
  });
});
