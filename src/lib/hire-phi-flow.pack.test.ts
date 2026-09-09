import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/styles/hire-phi-flow.css"), "utf8");

function block(selector: string): string {
  const match = css.match(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{[^}]+\\}`));
  return match?.[0] ?? "";
}

describe("hire-phi-flow pack rules", () => {
  it("centers a packed hero CTA cluster instead of end-parking when wide", () => {
    expect(css).not.toContain("@container (min-width: 28rem)");
    expect(block(".hire-phi__hero-reach")).toContain("fit-content");
    expect(block(".hire-phi__hero-reach")).toContain("justify-content: center");
    expect(block(".hire-phi__hero-reach .hire-phi__actions")).not.toMatch(/width:\s*100%/);
    expect(block(".hire-phi__hero-social-wrap")).not.toMatch(/width:\s*100%/);
  });

  it("keeps evidence link rows packed with start-aligned prose", () => {
    expect(css).not.toContain("@container (min-width: 20rem)");
    expect(block(".hire-phi__interactives")).toMatch(/flex-start|text-align:\s*start/);
    expect(block(".hire-phi__interactives")).not.toContain("flex-end");
  });

  it("packs channel icon and text instead of stretching a canyon", () => {
    const channel = block(".hire-phi__channel");
    expect(channel).not.toContain("space-between");
    expect(channel).toContain("flex-start");
    expect(block(".hire-phi__channel-text")).toContain("flex-start");
    expect(block(".hire-phi__channel-text")).toContain("text-align: start");
  });
});
