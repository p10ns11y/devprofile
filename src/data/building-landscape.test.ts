import { describe, expect, it } from "vitest";
import {
  BUILDING_BLURB,
  BUILDING_CLUSTERS,
  BUILDING_FALLBACK_URL,
  BUILDING_PRIVATE,
} from "./building-landscape";
import { projectByKey } from "@/lib/homepage-from-cvdata";

describe("building landscape", () => {
  it("resolves public projects to a url and every node to a real blurb", () => {
    for (const cluster of BUILDING_CLUSTERS) {
      for (const key of cluster.keys) {
        expect(BUILDING_BLURB[key], key).toBeTruthy();
        expect(BUILDING_BLURB[key]).not.toMatch(/Public system in the life-os map/);
        if (BUILDING_PRIVATE.has(key)) {
          expect(BUILDING_FALLBACK_URL[key]).toBeUndefined();
          continue;
        }
        const href = projectByKey(key)?.url ?? BUILDING_FALLBACK_URL[key];
        expect(href, key).toMatch(/^https:\/\//);
      }
    }
  });

  it("places plugins in the reactor, ensembly as operator, systems as low-level", () => {
    const byId = Object.fromEntries(BUILDING_CLUSTERS.map((cluster) => [cluster.id, cluster]));
    expect([...byId.agentic.keys]).toContain("plugins");
    expect(byId.operator.keys).toEqual(["ensembly"]);
    expect("nearSink" in byId.operator && byId.operator.nearSink).toBe(true);
    expect([...byId.systems.keys]).toEqual(["arch-machine", "shellyxz.sh", "mesh"]);
    expect(BUILDING_FALLBACK_URL.plugins).toContain("p10ns11y/plugins");
    expect(BUILDING_PRIVATE.has("mesh")).toBe(true);
  });
});
