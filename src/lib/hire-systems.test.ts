import { describe, expect, it } from "vitest";
import { BUILDING_PROJECTS } from "@/data/building-landscape";
import {
  hireLandscapeDocks,
  hireLandscapeRows,
  hireOperatorKey,
  hireSystemEdges,
  hireSystemNodes,
} from "@/lib/hire-systems";
import { projectByKey } from "@/lib/homepage-from-cvdata";

describe("hireSystemNodes", () => {
  it("only names projects that exist in cvdata", () => {
    for (const node of hireSystemNodes) {
      if (node.id === "cvdata") {
        continue;
      }
      expect(projectByKey(node.id), node.id).toBeDefined();
    }
  });

  it("only draws edges between declared nodes", () => {
    const ids = new Set(hireSystemNodes.map((node) => node.id));
    for (const edge of hireSystemEdges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }
  });

  it("puts participatory-mesh on the ensembly dispatch edge", () => {
    expect(hireSystemNodes.some((node) => node.id === "participatory-mesh")).toBe(true);
    expect(hireSystemEdges).toContainEqual({
      from: "ensembly",
      to: "participatory-mesh",
      label: "authorize, then dispatch",
    });
  });

  it("does not draw ensembly as a source into career products", () => {
    const toCareer = hireSystemEdges.filter((edge) => edge.from === "ensembly");
    expect(toCareer.map((edge) => edge.to)).toEqual(["participatory-mesh"]);
  });
});

describe("hire landscape cut of /building", () => {
  it("takes left-band rows from BUILDING_PROJECTS and parks ensembly at the sink", () => {
    const rows = hireLandscapeRows();
    expect(rows.map((row) => row.key)).toEqual([
      "collab-finder",
      "devprofile",
      "participatory-mesh",
    ]);
    expect(rows.map((row) => row.areaTitle)).toEqual(["Career", "Career", "Systems"]);
    expect(rows.some((row) => row.key === hireOperatorKey)).toBe(false);
    expect(BUILDING_PROJECTS.find((project) => project.key === hireOperatorKey)?.role).toBe(
      "operator"
    );
  });

  it("spans Career across the two career stars and Systems on the mesh row", () => {
    const docks = hireLandscapeDocks(hireLandscapeRows());
    expect(docks).toEqual([
      { area: "career", title: "Career", start: 1, end: 3 },
      { area: "systems", title: "Systems", start: 3, end: 4 },
    ]);
  });
});
