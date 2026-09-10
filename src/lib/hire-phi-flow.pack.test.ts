import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/styles/hire-phi-flow.css"), "utf8");

function block(selector: string): string {
  const match = css.match(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{[^}]+\\}`));
  return match?.[0] ?? "";
}

describe("hire-phi-flow pack rules", () => {
  it("reserves the first screen for the hero so #about is not a cut strip", () => {
    expect(block(".hire-phi__hero")).toContain("min-height: 100dvh");
    expect(block(".hire-phi__hero")).toContain("justify-content: center");
  });

  it("hugs the thesis-column end with a packed CTA cluster", () => {
    expect(css).not.toContain("@container (min-width: 28rem)");
    expect(block(".hire-phi__hero-reach")).toContain("justify-content: flex-end");
    expect(block(".hire-phi__hero-reach")).not.toContain("justify-content: center");
    expect(block(".hire-phi__hero-reach")).not.toMatch(/margin-inline:\s*auto/);
    expect(block(".hire-phi__hero-reach .hire-phi__actions")).toContain("flex-end");
    expect(block(".hire-phi__hero-reach .hire-phi__actions")).not.toMatch(/(?<!-)width:\s*100%/);
    expect(block(".hire-phi__hero-social-wrap")).toContain("flex-end");
    expect(block(".hire-phi__hero-social-wrap")).not.toMatch(/(?<!-)width:\s*100%/);
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
