import { describe, expect, it } from "vitest";
import cvdata from "./cvdata.json";
import {
  getArchitectureDiagram,
  getProjectWalkthrough,
  listProjectWalkthroughs,
  PROJECT_WALKTHROUGHS,
  projectWalkthroughSlugs,
  SHIPPED_WALKTHROUGH_SLUGS,
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

function blockPlainText(
  block: (typeof PROJECT_WALKTHROUGHS)[number]["sections"][number]["blocks"][number]
): string {
  switch (block.type) {
    case "paragraph":
    case "callout":
      return block.text;
    case "bullets":
      return block.items.join(" ");
    case "flow":
      return block.steps.join(" ");
    case "mermaid":
      return block.code;
    case "cards":
      return block.items
        .map((item) => `${item.title} ${item.kicker} ${item.body} ${item.sample ?? ""}`)
        .join(" ");
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

function blockTextLength(
  block: (typeof PROJECT_WALKTHROUGHS)[number]["sections"][number]["blocks"][number]
): number {
  return blockPlainText(block).length;
}

describe("shipped walkthroughs", () => {
  it("lists exactly four walkthroughs with the expected slugs", () => {
    const projects = listProjectWalkthroughs();
    expect(projects).toHaveLength(4);
    expect(projectWalkthroughSlugs()).toEqual([...SHIPPED_WALKTHROUGH_SLUGS]);
    expect(new Set(projectWalkthroughSlugs()).size).toBe(4);
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
          if (block.type === "cards") {
            expect(block.items.length).toBeGreaterThanOrEqual(2);
            for (const item of block.items) {
              expect(item.title.length).toBeGreaterThan(2);
              expect(item.body.length).toBeGreaterThan(20);
              expect(`${item.title} ${item.body}`.toLowerCase()).not.toContain("lorem");
            }
          }
        }
      }
    }
  });

  it("resolves known slugs and rejects unknown", () => {
    expect(getProjectWalkthrough("ensembly")?.cvdataKey).toBe("ensembly");
    expect(getProjectWalkthrough("collab-finder")?.cvdataKey).toBe("collab-finder");
    expect(getProjectWalkthrough("thepulimaangani")?.cvdataKey).toBe("thepulimaangani");
    expect(getProjectWalkthrough("adaptate")?.cvdataKey).toBe("adaptate");
    expect(getProjectWalkthrough("agent-prompt-tuning-lab")).toBeUndefined();
    expect(getProjectWalkthrough("missing-project")).toBeUndefined();
  });

  it("places a leading architecture mermaid diagram before tech prose in every walkthrough", () => {
    for (const project of PROJECT_WALKTHROUGHS) {
      const architecture = project.sections.find((section) => section.id === "architecture");
      expect(architecture?.blocks[0]?.type, project.slug).toBe("mermaid");

      const diagram = getArchitectureDiagram(project);
      expect(diagram, project.slug).toBeDefined();
      expect(diagram?.code.length).toBeGreaterThan(30);
      expect(diagram?.code).toMatch(/graph\s+(TB|LR|BT|RL)/);
    }
  });

  it("places thepulimaangani classical ML in the product band", () => {
    const project = getProjectWalkthrough("thepulimaangani");
    expect(project).toBeDefined();
    const product = walkthroughSectionsByBand(project!, "product");
    const blocks = product.flatMap((section) => section.blocks);
    const text = blocks.map(blockPlainText).join(" ").toLowerCase();

    expect(blocks.some((block) => block.type === "callout")).toBe(true);
    expect(blocks.some((block) => block.type === "bullets")).toBe(true);
    expect(text).toContain("dense[51]");
    expect(text).toContain("engineered features");
    expect(text).toContain("heuristic");
    expect(text).toMatch(/hybrid|logistic/);
    expect(text).toContain("pca");
    expect(text).toContain("monte carlo");
    expect(text).toMatch(/dual-truth|classical checker/);
    expect(text).toContain("wasm");
    expect(text).toContain("tf-idf");
    expect(text).not.toMatch(/transformer/);
  });

  it("places collab-finder hunt loop, pack health, pipeline, and ledger in the product band", () => {
    const project = getProjectWalkthrough("collab-finder");
    expect(project).toBeDefined();
    const product = walkthroughSectionsByBand(project!, "product");
    const blocks = product.flatMap((section) => section.blocks);
    const text = blocks.map(blockPlainText).join(" ").toLowerCase();
    const cards = blocks.find((block) => block.type === "cards");

    expect(blocks.some((block) => block.type === "callout")).toBe(true);
    expect(cards?.type).toBe("cards");
    if (cards?.type === "cards") {
      expect(cards.items.map((item) => item.title)).toEqual([
        "Hunt loop",
        "Preferences pack health",
        "Pipeline",
        "Local SQLite ledger",
      ]);
      const samples = cards.items.filter((item) => Boolean(item.sample));
      expect(samples.length).toBeGreaterThanOrEqual(2);
      expect(samples.map((item) => item.sample?.toLowerCase()).join(" ")).toMatch(
        /not a live machine|enums only/
      );
    }

    expect(text).toMatch(/heading cockpit|satellite/);
    expect(text).toContain("not a second chat");
    expect(text).toContain("evaluate");
    expect(text).toContain("prepare");
    expect(text).toMatch(/pack health|seeded/);
    expect(text).toContain("stub");
    expect(text).toContain("pipeline");
    expect(text).toContain("applied");
    expect(text).toContain("sqlite");
    expect(text).toContain("kanithanj.cv");
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/this week|applications this month/);

    const diagram = getArchitectureDiagram(project!);
    expect(diagram?.code).toMatch(/Preferences pack health|Pipeline|kanithanj\.cv/);
    expect(diagram?.code.split("\n").length).toBeLessThan(28);
  });

  it("places ensembly operator loop, HITL/HOOTL, pulse-pack, and ledger in the product band", () => {
    const project = getProjectWalkthrough("ensembly");
    expect(project).toBeDefined();
    const product = walkthroughSectionsByBand(project!, "product");
    const blocks = product.flatMap((section) => section.blocks);
    const text = blocks.map(blockPlainText).join(" ").toLowerCase();
    const cards = blocks.find((block) => block.type === "cards");

    expect(blocks.some((block) => block.type === "callout")).toBe(true);
    expect(cards?.type).toBe("cards");
    if (cards?.type === "cards") {
      expect(cards.items.map((item) => item.title)).toEqual([
        "Operator loop",
        "HITL / HOOTL runtime",
        "Pulse-pack",
        "T1 SQLite ledger",
      ]);
      const samples = cards.items.filter((item) => Boolean(item.sample));
      expect(samples.length).toBeGreaterThanOrEqual(2);
      expect(samples.map((item) => item.sample?.toLowerCase()).join(" ")).toMatch(
        /not a live|no live session counts/
      );
    }

    expect(text).toMatch(/complementary|white hole/);
    expect(text).toContain("not a second chat");
    expect(text).toContain("peram-kernel");
    expect(text).toContain("peram-memory");
    expect(text).toContain("pulse-pack");
    expect(text).toMatch(/hitl|hootl/);
    expect(text).toContain("prototype");
    expect(text).toMatch(/game of peram/);
    expect(text).toMatch(/parked/);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/this week|gates this month/);

    const diagram = getArchitectureDiagram(project!);
    expect(diagram?.code).toMatch(/peram-kernel|pulse-pack|peram-memory|peram-mcp/);
    expect(diagram?.code.split("\n").length).toBeLessThan(28);
  });
});
