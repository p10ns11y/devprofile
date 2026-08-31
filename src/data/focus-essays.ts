export const FOCUS_INDEX_HREF = "/essays";

export type FocusEssaySlug = "eeaas-to-agents" | "memory-issue" | "archive-not-memory";

export type FocusEssay = {
  slug: FocusEssaySlug;
  href: `/essays/${string}`;
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

export type FocusMemoryEssaySlug = "pulse" | "archive-not-memory";

export type FocusMemoryEssay = {
  slug: FocusMemoryEssaySlug;
  href: "/essays/memory-issue" | "/essays/memory-issue/archive-not-memory";
  navLabel: string;
  title: string;
};

export const FOCUS_MEMORY_ESSAYS: readonly FocusMemoryEssay[] = [
  {
    slug: "pulse",
    href: "/essays/memory-issue",
    navLabel: "Pulse instead of dump",
    title: "Pulse instead of dump",
  },
  {
    slug: "archive-not-memory",
    href: "/essays/memory-issue/archive-not-memory",
    navLabel: "Archive is not memory",
    title: "Archive is not memory",
  },
];

export const FOCUS_ESSAYS: readonly FocusEssay[] = [
  {
    slug: "eeaas-to-agents",
    href: "/essays/eeaas-to-agents",
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
    href: "/essays/memory-issue",
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
  {
    slug: "archive-not-memory",
    href: "/essays/memory-issue/archive-not-memory",
    navLabel: "Archive is not memory",
    title: "Archive is not memory — the second constraint on agent recall",
    cardLede:
      "What is allowed to become a snippet at all? Reuse, not form, is the admissions rule for memory—and why both biology and harnesses invent when the filter has no reject gate.",
    eyebrow: "Memory · admissions",
    image: {
      src: "/images/IA_archive_vs_memory.svg",
      alt: "",
      width: 860,
      height: 560,
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

export function getFocusMemoryEssay(slug: FocusMemoryEssaySlug): FocusMemoryEssay {
  const essay = FOCUS_MEMORY_ESSAYS.find((item) => item.slug === slug);
  if (!essay) {
    throw new Error(`Unknown Focus memory essay: ${slug}`);
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
