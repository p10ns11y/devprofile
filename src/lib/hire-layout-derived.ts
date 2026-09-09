import type { HireContent } from "@/lib/hire-content";

/** Web-only layout plan — derived from content shape, never forks cvdata facts. */
export type HirePackMode = "stack" | "stack-pair" | "auto-fit-dense" | "columns" | "contact-split";

export type HireReachZone = "center-then-end";

export type HireInteractiveScope = "hero-reach" | "evidence-links";

export type HireLayoutPlan = {
  hero: {
    mode: "stack-pair";
    peek: true;
    reach: HireReachZone;
    primaryAction: string;
  };
  proofs: { mode: "auto-fit-dense"; minCell: string };
  systems: { mode: "stack" | "stack-pair" };
  evidence: { mode: "columns"; counts: readonly [1, 2, 3] };
  contact: { mode: "contact-split" };
  interactives: {
    reach: HireReachZone;
    scopes: readonly HireInteractiveScope[];
  };
};

const SYSTEMS_PAIR_MAX_DISCLAIMER = 96;
const HERO_PRIMARY_LABEL = "Building";

/** Pure layout derivation: cvdata-backed content → CSS pack modes (no JSX span choreography). */
export function deriveHireLayout(
  content: Pick<HireContent, "nowDisclaimer" | "systems" | "heroActions">
): HireLayoutPlan {
  const disclaimerLen = content.nowDisclaimer.trim().length;
  const legendHeavy = content.systems.nodes.length >= 5;
  const systemsMode =
    !legendHeavy && disclaimerLen > 0 && disclaimerLen <= SYSTEMS_PAIR_MAX_DISCLAIMER
      ? "stack-pair"
      : "stack";

  const primaryAction =
    content.heroActions.find((action) => action.variant === "primary")?.label ?? HERO_PRIMARY_LABEL;

  return {
    hero: {
      mode: "stack-pair",
      peek: true,
      reach: "center-then-end",
      primaryAction,
    },
    proofs: { mode: "auto-fit-dense", minCell: "min(100%, 18rem)" },
    systems: { mode: systemsMode },
    evidence: { mode: "columns", counts: [1, 2, 3] },
    contact: { mode: "contact-split" },
    interactives: {
      reach: "center-then-end",
      scopes: ["hero-reach", "evidence-links"],
    },
  };
}

/** Maps derived plan → stable CSS hooks (layout authority lives in CSS + plan, not JSX spans). */
export function hireLayoutClassNames(plan: HireLayoutPlan) {
  return {
    hero: "hire-phi__hero-pack--stack-pair",
    heroPeek: "hire-phi__hero--peek",
    heroReach: "hire-phi__hero-reach",
    proofs: "hire-phi__proofs--auto-fit",
    systems:
      plan.systems.mode === "stack-pair"
        ? "hire-phi__systems--stack-pair"
        : "hire-phi__systems--stack",
    evidence: "hire-phi__evidence-pack",
    contact: "hire-phi__contact-grid",
    evidenceLinks: "hire-phi__evidence-links hire-phi__interactives",
    textLinks: "hire-phi__text-links",
  };
}

export function deriveHireLayoutClasses(
  content: Pick<HireContent, "nowDisclaimer" | "systems" | "heroActions">
) {
  return hireLayoutClassNames(deriveHireLayout(content));
}
