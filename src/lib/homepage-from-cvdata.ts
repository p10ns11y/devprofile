import cvdata from "@/data/cvdata.json";

type WorkRow = (typeof cvdata.work_experience)[number];

export function isIndependentWork(
  row: WorkRow
): row is WorkRow & { kind: "independent_work" } {
  return "kind" in row && row.kind === "independent_work";
}

export function independentWork(): WorkRow | undefined {
  return cvdata.work_experience.find(isIndependentWork);
}

export function employedWork(): WorkRow[] {
  return cvdata.work_experience.filter((row) => !isIndependentWork(row));
}

export function projectByKey(key: string) {
  return cvdata.projects.find((project) => project.key === key);
}

/** GitHub (or listed) repo URL. Never a speculative public domain. */
export function projectRepoUrl(key: string): string | undefined {
  return projectByKey(key)?.url;
}

/** npm registry URL when the artifact is a published package. */
export function projectNpmUrl(key: string): string | undefined {
  const project = projectByKey(key);
  if (!project || !("npm_url" in project)) {
    return undefined;
  }
  const npmUrl = project.npm_url;
  return typeof npmUrl === "string" && npmUrl.startsWith("https://") ? npmUrl : undefined;
}

type EvidenceLink = { label: string; url: string };

function namedLinks(row: (typeof cvdata.landing.evidence)[number]): EvidenceLink[] {
  if ("links" in row && Array.isArray(row.links)) {
    return row.links.flatMap((link) => {
      if (
        typeof link === "object" &&
        link &&
        typeof link.label === "string" &&
        typeof link.url === "string"
      ) {
        return [{ label: link.label, url: link.url }];
      }
      return [];
    });
  }
  return [];
}

export function recentCourses() {
  return cvdata.courses;
}

function proofHref(proof: {
  project_key?: string;
  link_label?: string;
}): { label: string; url: string } | undefined {
  if (!proof.project_key) {
    return undefined;
  }
  const url = projectRepoUrl(proof.project_key);
  if (!url) {
    return undefined;
  }
  return { label: proof.link_label ?? proof.project_key, url };
}

/** Site chrome from cvdata.landing, with project repo URLs filled in. */
export function getLanding() {
  const raw = cvdata.landing;
  return {
    role: raw.role,
    place: raw.place,
    location: raw.location,
    seat: raw.seat,
    thesis: raw.thesis,
    summary: raw.summary,
    nowDisclaimer: raw.now_disclaimer,
    proofs: raw.proofs.map((proof) => ({
      n: proof.n,
      title: proof.title,
      line: proof.line,
      href: proofHref(proof),
    })),
    arcHref: raw.arc,
    heroActions: raw.hero_actions.map((action) => ({
      href: action.href,
      label: action.label,
      variant: action.variant as "primary" | "secondary",
    })),
    contactLead: raw.contact_lead,
    contactAside: raw.contact_aside,
    formPlaceholder: raw.form_placeholder,
    credentialsQuote: raw.credentials_quote,
    metaDescription: raw.meta_description,
    workLead: raw.work_lead,
  };
}

export type WorkEvidence = {
  id: string;
  kind: string;
  figure?: string;
  detail: string;
  where: string;
  href?: EvidenceLink;
  hrefs: EvidenceLink[];
};

export type WorkClaim = {
  id: string;
  family: string;
  label: string;
  evidence: WorkEvidence[];
};

export function getWorkClaims(): {
  families: { id: string; title: string }[];
  claims: WorkClaim[];
} {
  const raw = cvdata.landing;
  const bank = new Map(raw.evidence.map((row) => [row.id, row]));
  const claims: WorkClaim[] = raw.claims
    .map((claim) => ({
      id: claim.id,
      family: claim.family,
      label: claim.label,
      evidence: claim.evidence.flatMap((id) => {
        const row = bank.get(id);
        if (!row) {
          return [];
        }
        const projectKey =
          "project_key" in row && typeof row.project_key === "string" ? row.project_key : undefined;
        const npmUrl = projectKey ? projectNpmUrl(projectKey) : undefined;
        const repo = projectKey ? projectRepoUrl(projectKey) : undefined;
        const direct = "href" in row && typeof row.href === "string" ? row.href : undefined;
        const explicit = namedLinks(row);
        const figure = "figure" in row && typeof row.figure === "string" ? row.figure : undefined;
        const fallbackUrl = npmUrl ?? repo ?? direct;
        const linkLabel =
          "link_label" in row && typeof row.link_label === "string"
            ? row.link_label
            : npmUrl || repo
              ? "Source"
              : "Read";
        const hrefs =
          explicit.length > 0
            ? explicit
            : fallbackUrl
              ? [{ label: linkLabel, url: fallbackUrl }]
              : [];
        return [
          {
            id: row.id,
            kind: row.kind,
            figure,
            detail: row.detail,
            where: row.where,
            href: hrefs[0],
            hrefs,
          },
        ];
      }),
    }))
    .filter((claim) => claim.evidence.length > 0);

  return { families: [...raw.claim_families], claims };
}
