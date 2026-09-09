import { describe, expect, it } from "vitest";
import { getHireContent } from "@/lib/hire-content";
import {
  deriveHireLayout,
  type HireLayoutContent,
  hireLayoutClassNames,
} from "@/lib/hire-layout-derived";

function withContent(patch: Partial<HireLayoutContent>): HireLayoutContent {
  return { ...getHireContent(), ...patch };
}

describe("deriveHireLayout", () => {
  it("reads the primary CTA from heroActions, not a hardcoded label", () => {
    const flipped = withContent({
      heroActions: [{ href: "/x", label: "Not Building", variant: "primary" }],
    });
    expect(deriveHireLayout(flipped).hero.primaryAction).toBe("Not Building");
    expect(deriveHireLayout(getHireContent()).hero.primaryAction).toBe("Building");
  });

  it("widens proof cells when fewer proofs ship", () => {
    const many = deriveHireLayout(getHireContent());
    const few = deriveHireLayout(withContent({ proofs: getHireContent().proofs.slice(0, 3) }));
    expect(many.proofs.minCell).toBe("min(100%, 20rem)");
    expect(few.proofs.minCell).toBe("min(100%, 22rem)");
    expect(few.proofs.minCell).not.toBe(many.proofs.minCell);
  });

  it("stacks systems when the legend is heavier than a short pair", () => {
    const plan = deriveHireLayout(getHireContent());
    expect(plan.systems.mode).toBe("stack");
    expect(plan.proofs.mode).toBe("auto-fit-dense");
    expect(plan.hero.peek).toBe(true);
  });

  it("pairs systems only when disclaimer is short and the legend is light", () => {
    const light = withContent({
      nowDisclaimer: "Short slice note.",
      systems: {
        nodes: getHireContent().systems.nodes.slice(0, 2),
        edges: [],
        caption: "x",
      },
    });
    expect(deriveHireLayout(light).systems.mode).toBe("stack-pair");
  });

  it("never scopes proofs as interactives even when proofs have links", () => {
    const content = getHireContent();
    expect(content.proofs.some((proof) => proof.href)).toBe(true);
    const plan = deriveHireLayout(content);
    expect(plan.interactives.scopes).toEqual(["hero-reach", "evidence-links"]);
    expect(plan.interactives.scopes).not.toContain("proofs");
  });

  it("drops evidence-links scope when no evidence hrefs exist", () => {
    const stripped = withContent({
      claims: getHireContent().claims.map((claim) => ({
        ...claim,
        evidence: claim.evidence.map((item) => ({ ...item, hrefs: [] })),
      })),
    });
    const plan = deriveHireLayout(stripped);
    expect(plan.interactives.scopes).toEqual(["hero-reach"]);
    expect(plan.interactives.scopes).not.toContain("evidence-links");
  });

  it("maps plan to CSS hooks without fixed span choreography or proofs interactives", () => {
    const classes = hireLayoutClassNames(deriveHireLayout(getHireContent()));
    expect(classes.proofs).toBe("hire-phi__proofs--auto-fit");
    expect(classes.proofs).not.toMatch(/span-/);
    expect(classes.heroReach).toBe("hire-phi__hero-reach");
    expect(classes.heroPeek).toBe("hire-phi__hero--peek");
    expect(classes.evidenceLinks).toContain("hire-phi__interactives");
    expect(classes.proofs).not.toContain("interactives");
  });

  it("throws when cvdata forgets a primary CTA", () => {
    expect(() => deriveHireLayout(withContent({ heroActions: [] }))).toThrow(/primary CTA/);
  });
});
