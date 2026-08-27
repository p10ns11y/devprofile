export const FOCUS_INDEX_HREF = "/focus";

export type FocusEssaySlug = "eeaas-to-agents" | "memory-issue";

export type FocusEssay = {
  slug: FocusEssaySlug;
  href: `/focus/${FocusEssaySlug}`;
  navLabel: string;
  title: string;
  cardLede: string;
  eyebrow: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const FOCUS_ESSAYS: readonly FocusEssay[] = [
  {
    slug: "eeaas-to-agents",
    href: "/focus/eeaas-to-agents",
    navLabel: "EEaaS to agents",
    title: "From 2016 energy orchestration to 2026 agentic systems",
    cardLede:
      "Why the cost of the next useful observation must fall while decision quality rises—and why that still holds when nearly all inference is remote.",
    eyebrow: "Thesis → agents",
    image: {
      src: "/images/IA_the_virtuous_loop.svg",
      alt: "",
      width: 700,
      height: 499,
    },
  },
  {
    slug: "memory-issue",
    href: "/focus/memory-issue",
    navLabel: "Pulse instead of dump",
    title: "Pulse instead of dump",
    cardLede:
      "Schrödinger’s three constraints, applied to agent memory: why the harness should pulse, not flood the context window.",
    eyebrow: "Memory",
    image: {
      src: "/images/IA_dump_vs_pulse.svg",
      alt: "",
      width: 860,
      height: 500,
    },
  },
];

export function getFocusEssay(slug: FocusEssaySlug): FocusEssay {
  const essay = FOCUS_ESSAYS.find((item) => item.slug === slug);
  if (!essay) {
    throw new Error(`Unknown Focus essay: ${slug}`);
  }
  return essay;
}

export function listFocusIndexEssays(): { featured: FocusEssay; rest: FocusEssay[] } {
  const [featured, ...rest] = FOCUS_ESSAYS;
  if (!featured) {
    throw new Error("FOCUS_ESSAYS must contain at least one essay");
  }
  return { featured, rest };
}
