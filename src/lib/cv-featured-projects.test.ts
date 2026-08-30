import { describe, expect, it } from "vitest";
import {
  getCvFeaturedProjects,
  isUpdatedSince,
  projectPublicHostLabel,
  selectMasterCvProjects,
} from "./cv-featured-projects";

function project(
  key: string,
  updated: string,
  extras: { created?: string; public_url?: string } = {},
) {
  return {
    key,
    name: key,
    url: `https://example.com/${key}`,
    description: key,
    created: extras.created ?? updated,
    updated,
    public_url: extras.public_url,
  };
}

describe("March–now window", () => {
  it("includes updated on/after 2026-03-01", () => {
    expect(isUpdatedSince(project("a", "2026-03-01"), "2026-03-01")).toBe(true);
    expect(isUpdatedSince(project("b", "2026-02-28"), "2026-03-01")).toBe(false);
  });
});

describe("master CV pick", () => {
  const projects = [
    project("adaptate", "2026-07-15"),
    project("collab-finder", "2026-08-25", {
      created: "2026-06-04",
      public_url: "https://kanithanj.ai",
    }),
    project("agent-prompt-tuning-lab", "2026-08-17"),
    project("thepulimaangani", "2026-08-02", { created: "2020-04-09" }),
    project("devprofile", "2026-08-28", { created: "2025-09-08" }),
    project("old", "2025-01-01"),
  ];

  it("pins the three quality keys in order, eligible since March", () => {
    expect(selectMasterCvProjects(projects).map((item) => item.key)).toEqual([
      "collab-finder",
      "thepulimaangani",
      "devprofile",
    ]);
  });

  it("shows the live host, not a reach badge", () => {
    const featured = getCvFeaturedProjects(projects);
    expect(projectPublicHostLabel(featured[0]!)).toBe("kanithanj.ai");
    expect(projectPublicHostLabel(featured[1]!)).toBeUndefined();
  });

  it("overlay keys still pin order", () => {
    const featured = getCvFeaturedProjects(projects, ["devprofile", "adaptate"]);
    expect(featured.map((item) => item.key)).toEqual(["devprofile", "adaptate"]);
  });
});
