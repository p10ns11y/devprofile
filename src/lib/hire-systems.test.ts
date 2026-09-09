import { describe, expect, it } from "vitest";
import { hireSystemEdges, hireSystemNodes } from "@/lib/hire-systems";
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
});
