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

  it("does not overwrite a complete master blurb with a GitHub-ellipsis leftover", () => {
    const { data } = applyCvOverlay(master, {
      projects_upsert: [
        {
          key: "adaptate",
          name: "Adaptate",
          description:
            "adaptate is a dynamic and adaptable model validator that leverages Zod for schema validation and is interoperable with OpenAPI. Define a single optional Zod schema for your data model, then use configuration objects to …",
          url: "https://github.com/p10ns11y/adaptate",
        },
      ],
    });
    expect(data.projects.find((p) => p.key === "adaptate")?.description).toBe("old");
  });
});
