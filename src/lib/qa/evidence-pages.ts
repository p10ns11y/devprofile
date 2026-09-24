export type QaEvidencePageLink = {
  id: string;
  path: string;
  anchor?: string;
  label: string;
  keywords: readonly string[];
};

export const QA_EVIDENCE_PAGES: readonly QaEvidencePageLink[] = [
  {
    id: "pay-target-range",
    path: "/pay-report",
    anchor: "target-range",
    label: "Pay report — target range",
    keywords: ["target range", "compensation", "salary", "pay band", "next chapter", "rate"],
  },
  {
    id: "pay-experience",
    path: "/pay-report",
    anchor: "experience",
    label: "Pay report — senior band fit",
    keywords: ["senior band", "years of experience", "oneflow", "8 years", "experience fits"],
  },
  {
    id: "pay-break",
    path: "/pay-report",
    anchor: "why-the-break-doesnt-set-me-back",
    label: "Pay report — career break",
    keywords: ["career break", "gap", "break doesn't", "time away"],
  },
  {
    id: "focus-eeaas",
    path: "/focus/eeaas-to-agents",
    label: "Essay — EEaaS to agents",
    keywords: [
      "eeaas",
      "energy efficiency as a service",
      "2016 thesis",
      "master thesis",
      "orchestration",
      "agentic ai",
    ],
  },
  {
    id: "focus-hitl",
    path: "/focus/hitl-hootl",
    label: "Essay — HITL vs HOOTL",
    keywords: ["hitl", "hootl", "human in the loop", "senior engineer", "ai era", "core skills"],
  },
  {
    id: "focus-memory",
    path: "/focus/memory-issue",
    label: "Essay — memory issue",
    keywords: ["memory", "context window", "retrieval", "archive", "agent memory"],
  },
  {
    id: "profile-long-arc",
    path: "/profile",
    anchor: "long-arc",
    label: "Profile — long arc",
    keywords: ["career arc", "career journey", "2016", "master", "oneflow", "8 years"],
  },
  {
    id: "profile-featured",
    path: "/profile",
    anchor: "featured",
    label: "Profile — featured work",
    keywords: ["featured", "premflow", "proud", "signature project", "top achievement"],
  },
  {
    id: "profile-pocs",
    path: "/profile",
    anchor: "proof-of-concepts",
    label: "Profile — proof of concepts",
    keywords: ["proof of concept", "poc", "experiment", "multi-agent", "agent infrastructure"],
  },
  {
    id: "profile-story",
    path: "/profile",
    anchor: "an-inch-at-a-time",
    label: "Profile — story",
    keywords: ["story", "inch at a time", "philosophy", "craft"],
  },
  {
    id: "shipped-collab-finder",
    path: "/shipped/collab-finder",
    anchor: "section-product",
    label: "Shipped — collab-finder",
    keywords: ["collab-finder", "collab finder", "job hunt", "desktop app", "tauri"],
  },
  {
    id: "shipped-adaptate",
    path: "/shipped/adaptate",
    anchor: "section-product",
    label: "Shipped — adaptate",
    keywords: ["adaptate", "babel", "i18n", "internationalization"],
  },
  {
    id: "shipped-thepulimaangani",
    path: "/shipped/thepulimaangani",
    anchor: "section-product",
    label: "Shipped — thepulimaangani",
    keywords: ["thepulimaangani", "pulimaangani", "tamil", "creative"],
  },
  {
    id: "home-work",
    path: "/",
    anchor: "work",
    label: "Home — evidence",
    keywords: [
      "oneflow",
      "typescript migration",
      "playwright",
      "engineering team lead",
      "type-error",
      "top 3",
      "achievement",
      "zod",
    ],
  },
  {
    id: "home-systems",
    path: "/",
    anchor: "systems",
    label: "Home — systems graph",
    keywords: ["systems", "architecture", "clusters", "operator loop", "infrastructure"],
  },
  {
    id: "home-about",
    path: "/",
    anchor: "about",
    label: "Home — about",
    keywords: ["background", "hiring", "who you are", "summary"],
  },
  {
    id: "building",
    path: "/building",
    label: "Building landscape",
    keywords: ["building", "public stack", "github", "open source", "simplify", "remove features"],
  },
  {
    id: "shipped-index",
    path: "/shipped",
    anchor: "shipped-gallery-heading",
    label: "Shipped walkthroughs",
    keywords: ["shipped", "walkthrough", "architecture walkthrough", "project write-up"],
  },
  {
    id: "certificates",
    path: "/certificates",
    anchor: "certificates-heading",
    label: "Certificates",
    keywords: ["certificate", "certification", "aws", "azure", "credential", "course"],
  },
  {
    id: "focus-index",
    path: "/focus",
    anchor: "focus-essays-heading",
    label: "Focus essays",
    keywords: ["essay", "focus", "writing", "white paper"],
  },
];

export function evidencePageHref(link: Pick<QaEvidencePageLink, "path" | "anchor">): string {
  return link.anchor ? `${link.path}#${link.anchor}` : link.path;
}
