import { describe, expect, it } from "vitest";
import { getHireContent } from "@/lib/hire-content";
import { deriveHireLayout, hireLayoutClassNames } from "@/lib/hire-layout-derived";

describe("deriveHireLayout", () => {
  it("prefers stacked systems when legend is heavy", () => {
    const content = getHireContent();
    const plan = deriveHireLayout(content);
    expect(plan.systems.mode).toBe("stack");
    expect(plan.proofs.mode).toBe("auto-fit-dense");
  });

  it("maps plan to CSS class hooks without fixed span choreography", () => {
    const plan = deriveHireLayout(getHireContent());
    const classes = hireLayoutClassNames(plan);
    expect(classes.proofs).toBe("hire-phi__proofs--auto-fit");
    expect(classes.proofs).not.toMatch(/span-/);
  });

  it("derives Building as primary CTA and hero peek + scoped reach", () => {
    const content = getHireContent();
    const plan = deriveHireLayout(content);
    expect(plan.hero.primaryAction).toBe("Building");
    expect(plan.hero.peek).toBe(true);
    expect(plan.hero.reach).toBe("center-then-end");
    expect(plan.interactives.scopes).toEqual(["hero-reach", "evidence-links"]);
    expect(plan.interactives.scopes).not.toContain("proofs");
  });

  it("exposes hero reach and peek hooks without proofs interactives", () => {
    const classes = hireLayoutClassNames(deriveHireLayout(getHireContent()));
    expect(classes.heroReach).toBe("hire-phi__hero-reach");
    expect(classes.heroPeek).toBe("hire-phi__hero--peek");
    expect(classes).not.toHaveProperty("interactives");
  });
});
