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
});
