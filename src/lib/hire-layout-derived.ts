import type { HireContent } from "@/lib/hire-content";

/** Web-only layout plan — derived from content shape, never forks cvdata facts. */
export type HirePackMode = "stack" | "stack-pair" | "auto-fit-dense" | "columns" | "contact-split";

/** Pack the action group, then edge-hug the right cell. Primary is rightmost in the pack. */
export type HireReachZone = "edge-hug";

export type HireInteractiveScope = "hero-reach" | "evidence-links";

export type HireLayoutPlan = {
  hero: {
    mode: "stack-pair";
    peek: false;
    reach: HireReachZone;
    primaryAction: string;
  };
  proofs: { mode: "auto-fit-dense"; minCell: string };
  systems: { mode: "stack" | "stack-pair" };
  evidence: { mode: "columns"; counts: readonly number[] };
  contact: { mode: "contact-split" };
  interactives: {
    reach: HireReachZone;
    scopes: readonly HireInteractiveScope[];
  };
};

const SYSTEMS_PAIR_MAX_DISCLAIMER = 96;
const SYSTEMS_PAIR_MAX_NODES = 3;

export type HireLayoutContent = Pick<
  HireContent,
  "nowDisclaimer" | "systems" | "heroActions" | "heroLinks" | "proofs" | "claims"
>;

function evidenceCardCount(content: Pick<HireContent, "claims">): number {
  return content.claims.length;
}

function hasEvidenceLinks(content: Pick<HireContent, "claims">): boolean {
  return content.claims.some((claim) => claim.evidence.some((item) => item.hrefs.length > 0));
}

function evidenceColumnCounts(cardCount: number): readonly number[] {
  if (cardCount >= 8) {
    return [1, 2, 3];
  }
  if (cardCount >= 4) {
    return [1, 2];
  }
  return [1];
}

function proofMinCell(proofCount: number): string {
  if (proofCount <= 3) {
    return "min(100%, 22rem)";
  }
  return "min(100%, 20rem)";
}

function systemsMode(content: HireLayoutContent): "stack" | "stack-pair" {
  const disclaimerLen = content.nowDisclaimer.trim().length;
  const lightLegend = content.systems.nodes.length <= SYSTEMS_PAIR_MAX_NODES;
  const shortDisclaimer = disclaimerLen > 0 && disclaimerLen <= SYSTEMS_PAIR_MAX_DISCLAIMER;
  return lightLegend && shortDisclaimer ? "stack-pair" : "stack";
}

function interactiveScopes(content: HireLayoutContent): HireInteractiveScope[] {
  const scopes: HireInteractiveScope[] = [];
  if (content.heroActions.length + content.heroLinks.length > 0) {
    scopes.push("hero-reach");
  }
  if (hasEvidenceLinks(content)) {
    scopes.push("evidence-links");
  }
  return scopes;
}

/** Pure layout derivation: cvdata-backed content → CSS pack modes (no JSX span choreography). */
export function deriveHireLayout(content: HireLayoutContent): HireLayoutPlan {
  const primaryAction = content.heroActions.find((action) => action.variant === "primary")?.label;
  if (!primaryAction) {
    throw new Error("deriveHireLayout: cvdata.landing.hero_actions must include a primary CTA");
  }

  return {
    hero: {
      mode: "stack-pair",
      peek: false,
      reach: "edge-hug",
      primaryAction,
    },
    proofs: { mode: "auto-fit-dense", minCell: proofMinCell(content.proofs.length) },
    systems: { mode: systemsMode(content) },
    evidence: { mode: "columns", counts: evidenceColumnCounts(evidenceCardCount(content)) },
    contact: { mode: "contact-split" },
    interactives: {
      reach: "edge-hug",
      scopes: interactiveScopes(content),
    },
  };
}

export type HireLayoutHooks = {
  hero: string;
  heroPeek: string;
  heroReach: string;
  proofs: string;
  systems: string;
  evidence: string;
  contact: string;
  evidenceLinks: string;
  textLinks: string;
  proofMinCell: string;
  evidenceCols: string;
};

/** Maps derived plan → stable CSS hooks (layout authority lives in CSS + plan, not JSX spans). */
export function hireLayoutClassNames(plan: HireLayoutPlan): HireLayoutHooks {
  return {
    hero: "hire-phi__hero-pack--stack-pair",
    heroPeek: plan.hero.peek ? "hire-phi__hero--peek" : "",
    heroReach: plan.interactives.scopes.includes("hero-reach") ? "hire-phi__hero-reach" : "",
    proofs: "hire-phi__proofs--auto-fit",
    systems:
      plan.systems.mode === "stack-pair"
        ? "hire-phi__systems--stack-pair"
        : "hire-phi__systems--stack",
    evidence: "hire-phi__evidence-pack",
    contact: "hire-phi__contact-grid",
    evidenceLinks: plan.interactives.scopes.includes("evidence-links")
      ? "hire-phi__evidence-links hire-phi__interactives"
      : "hire-phi__evidence-links",
    textLinks: "hire-phi__text-links",
    proofMinCell: plan.proofs.minCell,
    evidenceCols: plan.evidence.counts.join(" "),
  };
}

export function deriveHireLayoutClasses(content: HireLayoutContent): HireLayoutHooks {
  return hireLayoutClassNames(deriveHireLayout(content));
}
