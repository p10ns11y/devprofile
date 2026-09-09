import type { HireContent } from "@/lib/hire-content";
import { getHireContent } from "@/lib/hire-content";

/**
 * LCV stress overlays — long must-show strings for geometry probes.
 * Never production facts; clearly synthetic padding text.
 */
export type HireStressFixture = "long-thesis" | "long-proofs" | "long-contact";

const STRESS_PAD =
  " LCV stress padding only — not a production claim. Must remain visible without horizontal scroll.";

export function applyHireStressFixture(base: HireContent, fixture: HireStressFixture): HireContent {
  switch (fixture) {
    case "long-thesis":
      return {
        ...base,
        thesis: `${base.thesis}${STRESS_PAD.repeat(3)}`,
      };
    case "long-proofs":
      return {
        ...base,
        proofs: base.proofs.map((proof, i) => ({
          ...proof,
          line: `${proof.line}${STRESS_PAD.repeat(i + 1)}`,
        })),
      };
    case "long-contact":
      return {
        ...base,
        contactLead: `${base.contactLead}${STRESS_PAD.repeat(2)}`,
      };
    default:
      return base;
  }
}

export function getHireStressContent(fixture: HireStressFixture): HireContent {
  return applyHireStressFixture(getHireContent(), fixture);
}

export const hireStressFixtures: { slug: HireStressFixture; label: string }[] = [
  { slug: "long-thesis", label: "Long thesis must-show" },
  { slug: "long-proofs", label: "Long proof lines" },
  { slug: "long-contact", label: "Long contact heading" },
];
