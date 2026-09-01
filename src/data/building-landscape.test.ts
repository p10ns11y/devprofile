import { describe, expect, it } from "vitest";
import { layoutAtlas } from "@/components/building/atlas-layout";
import { projectByKey } from "@/lib/homepage-from-cvdata";
import {
  type AreaId,
  BUILDING_AREAS,
  BUILDING_BLURB,
  BUILDING_CLUSTERS,
  BUILDING_FALLBACK_URL,
  BUILDING_PRIVATE,
  BUILDING_PROJECTS,
  BUILDING_SINGULARITY,
} from "./building-landscape";

describe("building landscape", () => {
  it("encodes Graph.md as two disjoint axes", () => {
    const clusterIds = new Set(BUILDING_CLUSTERS.map((clusterRecord) => clusterRecord.id));
    const areaIds = new Set<string>(BUILDING_AREAS.map((areaRecord) => areaRecord.id));
    expect(BUILDING_CLUSTERS.every((clusterRecord) => !areaIds.has(clusterRecord.id))).toBe(true);

    for (const project of BUILDING_PROJECTS) {
      expect(clusterIds.has(project.cluster), project.key).toBe(true);
      expect(areaIds.has(project.area), project.key).toBe(true);
    }
  });

  it("treats shelf-life as writing in Creative, not a cultural twin of metre", () => {
    const shelf = BUILDING_PROJECTS.find((project) => project.key === "shelf-life");
    const metre = BUILDING_PROJECTS.find((project) => project.key === "thepulimaangani");
    expect(shelf?.cluster).toBe("cultural-creative");
    expect(metre?.cluster).toBe("cultural-creative");
    expect(shelf?.area).toBe("creative");
    expect(metre?.area).toBe("creative");
    expect(shelf?.epithet).toBe("writing");
    expect(metre?.epithet).toBe("metre");
  });

  it("resolves public projects to a url and every node to a real blurb", () => {
    for (const project of BUILDING_PROJECTS) {
      expect(BUILDING_BLURB[project.key], project.key).toBeTruthy();
      expect(BUILDING_BLURB[project.key]).not.toMatch(/Public system in the life-os map/);
      if (BUILDING_PRIVATE.has(project.key)) {
        expect(BUILDING_FALLBACK_URL[project.key]).toBeUndefined();
        continue;
      }
      const href = projectByKey(project.key)?.url ?? BUILDING_FALLBACK_URL[project.key];
      expect(href, project.key).toMatch(/^https:\/\//);
    }
    expect(BUILDING_PRIVATE.has("mesh")).toBe(true);
  });

  it("keeps plugins in the reactor, ensembly as operator, foundations-infra as merged systems", () => {
    const plugins = BUILDING_PROJECTS.find((project) => project.key === "plugins");
    const ensembly = BUILDING_PROJECTS.find((project) => project.key === "ensembly");
    const foundationsKeys = BUILDING_PROJECTS.filter(
      (project) => project.cluster === "foundations-infra"
    ).map((project) => project.key);

    expect(plugins?.cluster).toBe("agentic-reactor");
    expect(ensembly?.role).toBe("operator");
    expect(ensembly?.cluster).toBe("agentic-reactor");
    expect(foundationsKeys).toEqual(
      expect.arrayContaining(["arch-machine", "shellyxz.sh", "mesh"])
    );
    expect(BUILDING_FALLBACK_URL.plugins).toContain("p10ns11y/plugins");
  });

  it("keeps hop curves, trunks, and grid out of label ink", () => {
    const scene = layoutAtlas();
    expect(scene.collisions).toEqual([]);
    expect(scene.bands).toHaveLength(5);
    expect(scene.docks).toHaveLength(4);
    expect(scene.operator?.key).toBe("ensembly");
    expect(scene.stars.some((placedStar) => placedStar.role === "operator")).toBe(false);
    expect(scene.hops).toHaveLength(scene.stars.length);
    expect(scene.trunks).toHaveLength(scene.docks.length);
    expect(scene.stars[0]?.x).toBeGreaterThan(280);
  });

  it("states the white hole as emit, not capture", () => {
    expect(BUILDING_SINGULARITY.tooltip).toMatch(/other side of a black hole/i);
    expect(BUILDING_SINGULARITY.tooltip).toMatch(/Penrose white hole/);
    expect(BUILDING_SINGULARITY.tooltip).toMatch(/white hole emits/i);
    expect(BUILDING_SINGULARITY.sublabel).toBe("white hole");
  });

  it("does not reuse systems as a cluster id", () => {
    const clusterIds = BUILDING_CLUSTERS.map((clusterRecord) => clusterRecord.id);
    expect(clusterIds).not.toContain("systems");
    expect(
      BUILDING_AREAS.some((areaRecord) => areaRecord.id === ("systems" satisfies AreaId))
    ).toBe(true);
  });
});
