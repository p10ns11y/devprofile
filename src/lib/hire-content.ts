import cvdata from "@/data/cvdata.json";
import { getLanding, getWorkClaims } from "@/lib/homepage-from-cvdata";
import { operatorEdges, operatorNodes } from "@/lib/lab-operator-system";

/** Hire surface proof cap — full list remains on CV / articles. */
export const HIRE_PROOF_CAP = 6;
export const HIRE_PROOF_FLOOR = 4;

export type HireProof = ReturnType<typeof getLanding>["proofs"][number];

export type HireContent = ReturnType<typeof getHireContent>;

/** Single production content body — all hire surfaces read this, not divergent prose. */
export function getHireContent() {
  const landing = getLanding();
  const work = getWorkClaims();
  const proofs = landing.proofs.slice(0, HIRE_PROOF_CAP);

  return {
    name: cvdata.name,
    role: landing.role,
    place: landing.place,
    location: landing.location,
    seat: landing.seat,
    thesis: landing.thesis,
    summary: landing.summary,
    nowDisclaimer: landing.nowDisclaimer,
    proofs,
    arcHref: landing.arcHref,
    heroActions: landing.heroActions,
    heroLinks: landing.heroLinks,
    contactLead: landing.contactLead,
    contactAside: landing.contactAside,
    formPlaceholder: landing.formPlaceholder,
    workLead: landing.workLead,
    credentialsQuote: landing.credentialsQuote,
    metaDescription: landing.metaDescription,
    families: work.families,
    claims: work.claims,
    systems: {
      nodes: operatorNodes,
      edges: operatorEdges,
      caption: "One operator system — connections a stranger cannot see from repo names alone.",
    },
  };
}
