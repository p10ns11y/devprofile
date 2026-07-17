import { describe, expect, it } from "vitest";
import { applyCvOverlay } from "./cv-overlay";

describe("applyCvOverlay", () => {
  const master = {
    profile: "Master profile",
    projects: [
      {
        key: "adaptate",
        name: "Adaptate",
        description: "old",
        url: "https://example.com/adaptate",
      },
    ],
  };

  it("returns master unchanged when overlay is null", () => {
    const { data, featuredKeys } = applyCvOverlay(master, null);
    expect(data).toEqual(master);
    expect(featuredKeys).toBeUndefined();
  });

  it("upserts projects by key and applies featured_keys + overrides", () => {
    const { data, featuredKeys } = applyCvOverlay(master, {
      schema: "cv_overlay_v1",
      featured_keys: ["collab-finder", "adaptate"],
      overrides: { profile: "Apply profile" },
      projects_upsert: [
        {
          key: "collab-finder",
          name: "collab-finder",
          description: "agentic desktop",
          url: "https://github.com/p10ns11y/collab-finder",
        },
        {
          key: "adaptate",
          name: "Adaptate",
          description: "updated",
          url: "https://example.com/adaptate",
        },
      ],
    });

    expect(data.profile).toBe("Apply profile");
    expect(featuredKeys).toEqual(["collab-finder", "adaptate"]);
    expect(data.projects).toHaveLength(2);
    expect(data.projects[0].key).toBe("collab-finder");
    expect(data.projects.find((p) => p.key === "adaptate")?.description).toBe("updated");
  });
});
