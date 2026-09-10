import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/styles/building.css"), "utf8");

describe("building spacemap pack rules", () => {
  it("stacks labeled rows below 48rem instead of clipping a 4-col table", () => {
    expect(css).toContain("@media (max-width: 47.99rem)");
    expect(css).toContain(".building-spacemap__label");
    expect(css).toContain("overflow-wrap: anywhere");
    const stacked = css.slice(css.indexOf("@media (max-width: 47.99rem)"));
    expect(stacked).toContain("display: block");
    expect(stacked).toContain(".building-spacemap__label");
  });
});
