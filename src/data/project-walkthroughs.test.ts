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

function sectionText(
  sections: readonly (typeof PROJECT_WALKTHROUGHS)[number]["sections"][number][]
): string {
  return sections.flatMap((section) => section.blocks.map(blockPlainText)).join(" ").toLowerCase();
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

  it("keeps thepulimaangani plain in the product band, classical path in tech", () => {
    const project = getProjectWalkthrough("thepulimaangani");
    expect(project).toBeDefined();
    const product = walkthroughSectionsByBand(project!, "product");
    const tech = walkthroughSectionsByBand(project!, "tech");
    const productText = sectionText(product);
    const techText = sectionText(tech);

    expect(product.some((section) => section.blocks.some((block) => block.type === "callout"))).toBe(
      true
    );
    expect(product.some((section) => section.blocks.some((block) => block.type === "bullets"))).toBe(
      true
    );
    expect(productText).toContain("paste tamil verse");
    expect(productText).toMatch(/classical rules|classical rule/);
    expect(productText).toContain("yāppu");
    expect(productText).not.toContain("dense[51]");
    expect(productText).not.toMatch(/tier b|pca|monte carlo|hmm|crf|gbdt|neural net|nlp api/);

    expect(techText).toContain("webassembly");
    expect(techText).toMatch(/offline ml|classical rules/);
    expect(techText).not.toContain("dense[51]");
    expect(techText).not.toMatch(/tier b|pca|monte carlo|tf-idf/);
    expect(techText).not.toMatch(/transformer/);
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
        "Pack file checks",
        "Pipeline",
        "Local database",
      ]);
      const samples = cards.items.filter((item) => Boolean(item.sample));
      expect(samples.length).toBeGreaterThanOrEqual(2);
      expect(samples.map((item) => item.sample?.toLowerCase()).join(" ")).toMatch(
        /not a live machine|no live counts/
      );
    }

    expect(text).toMatch(/desktop app|kanithanj/);
    expect(text).toMatch(/not a chat app|not a chat replacement/);
    expect(text).toContain("evaluate");
    expect(text).toContain("prepare");
    expect(text).toMatch(/pack file|pack files/);
    expect(text).toMatch(/demo badges for pack status/);
    expect(text).toContain("pipeline");
    expect(text).toContain("applied");
    expect(text).toMatch(/local database|stores opportunities/);
    expect(text).toMatch(/cv generate cli|kanithanj\.cv/);
    expect(text).toMatch(/master cv on the public portfolio|master cv/);
    expect(text).not.toMatch(/master cvdata|seeded|missing badge|stub cv/);
    expect(text).not.toMatch(/\bsqlite\b|\bwal\b|xdg|mvu/);
    expect(text).not.toMatch(/issue #\d+/);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/this week|applications this month/);

    const diagram = getArchitectureDiagram(project!);
    expect(diagram?.code).toMatch(/Preferences pack health|Pipeline|kanithanj\.cv|Packs folder/);
    expect(diagram?.code.split("\n").length).toBeLessThan(28);
  });

  it("keeps adaptate product copy plain before Zod and OpenAPI names", () => {
    const project = getProjectWalkthrough("adaptate");
    expect(project).toBeDefined();
    const product = walkthroughSectionsByBand(project!, "product");
    const tech = walkthroughSectionsByBand(project!, "tech");
    const productText = sectionText(product);
    const techText = sectionText(tech);

    expect(productText).toMatch(/optional by default|per-consumer rules/);
    expect(productText).toMatch(/no second schema|same model/);
    expect(productText).not.toMatch(/multi-tenant edge|overlays|second source of truth/);
    expect(productText).not.toContain("zod");
    expect(techText).toContain("zod");
    expect(techText).toMatch(/openapi|json schema/);
  });

  it("places ensembly daily workflow, human approval, memory sync, and ledger in the product band", () => {
    const project = getProjectWalkthrough("ensembly");
    expect(project).toBeDefined();
    expect(project!.lede).toMatch(/^Grok Bot/);
    expect(project!.lede).not.toMatch(/\(HITL\).*\(HOOTL\)/);
    const product = walkthroughSectionsByBand(project!, "product");
    const tech = walkthroughSectionsByBand(project!, "tech");
    const blocks = product.flatMap((section) => section.blocks);
    const text = blocks.map(blockPlainText).join(" ").toLowerCase();
    const techText = sectionText(tech);
    const cards = blocks.find((block) => block.type === "cards");

    expect(blocks.some((block) => block.type === "callout")).toBe(true);
    expect(cards?.type).toBe("cards");
    if (cards?.type === "cards") {
      expect(cards.items.map((item) => item.title)).toEqual([
        "Daily workflow",
        "Human approval / automated work",
        "Portable memory sync",
        "Ops ledger",
      ]);
      const samples = cards.items.filter((item) => Boolean(item.sample));
      expect(samples.length).toBeGreaterThanOrEqual(2);
      expect(samples.map((item) => item.sample?.toLowerCase()).join(" ")).toMatch(
        /not this person's live machine|no live session counts/
      );
      expect(samples.map((item) => item.sample?.toLowerCase()).join(" ")).toMatch(
        /demo dataset|household tasks/
      );
    }

    expect(text).toMatch(/grok bot|ledger|approve/);
    expect(text).toMatch(/not a second chat/);
    expect(text).toContain("ensembly-kernel");
    expect(text).toContain("ensembly-ops.sqlite");
    expect(text).toMatch(/human approval|approve or deny/);
    expect(text).toMatch(/memory sync|portable memory sync/);
    expect(text).toMatch(/hitl|hootl/);
    expect(text).toMatch(/old installs keep working|one-shot copy/);
    expect(text).not.toMatch(/episodic|game of peram/);
    expect(text).not.toMatch(/issue #\d+/);
    expect(text).not.toMatch(/pay-rent|grocery-errand|hitlwait|hootl regime/);
    expect(text).not.toMatch(/migrate-local-paths/);
    expect(text).not.toMatch(/\bt1\b/);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/this week|gates this month/);

    expect(techText).toContain("ensembly-memory");
    expect(techText).toContain("ensembly-mcp");
    expect(techText).toMatch(/ensembly-pulse-pack-v1|pulse-pack/);
    expect(techText).toMatch(/prototype/);

    const diagram = getArchitectureDiagram(project!);
    expect(diagram?.code).toMatch(/ensembly-kernel/);
    expect(diagram?.code).toMatch(/ensembly-memory/);
    expect(diagram?.code).toMatch(/ensembly-mcp/);
    expect(diagram?.code).not.toMatch(/peram-kernel|peram-memory|peram-mcp/);
    expect(diagram?.code.split("\n").length).toBeLessThan(28);
  });
});
