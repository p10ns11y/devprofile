import { profileJourney } from "@/data/profile-journey";

export type ProfileDeckSlideKind =
  | "cover"
  | "story"
  | "story-plan"
  | "story-quote"
  | "timeline"
  | "featured-one"
  | "cooking-set"
  | "pocs"
  | "long-arc"
  | "long-arc-core"
  | "long-arc-papers"
  | "long-arc-course"
  | "writing"
  | "npm"
  | "oss"
  | "connect"
  | "archive-intro"
  | "archive-surfaces"
  | "archive-samples"
  | "close";

export type ProfileDeckSlide = {
  id: string;
  /** Unique shareable URL word cue — `/profile?slide=<cue>`. */
  cue: string;
  kind: ProfileDeckSlideKind;
  chapter: string;
  title: string;
  /** Bridge line between beats — narration glue. */
  bridge?: string;
  featuredSlug?: string;
  cookingNames?: string[];
  /** Archive surfaces slice [start, end). */
  surfaceRange?: [number, number];
  /** Index into archive.samples. */
  sampleIndex?: number;
  /** npm year filter, e.g. "2024". */
  npmYear?: string;
  /** Timeline phase name when kind is timeline. */
  timelinePhase?: string;
  /** Index into profileJourney.pocs. */
  pocIndex?: number;
  /** Thesis papers slice [start, end). */
  paperRange?: [number, number];
  /** Open-source slice [start, end). */
  ossRange?: [number, number];
};

export type ProfileDeckNavChild = {
  label: string;
  firstSlideId: string;
};

export type ProfileDeckNavChapter = {
  id: string;
  label: string;
  firstSlideId: string;
  children?: ProfileDeckNavChild[];
};

const featuredBySlug = Object.fromEntries(profileJourney.featured.map((p) => [p.slug, p]));

export function featuredProject(slug: string) {
  return featuredBySlug[slug];
}

export function cookingItems(names: string[]) {
  return profileJourney.cooking.filter((item) => names.includes(item.name));
}

/**
 * Strict viewport beats: each slide must fit without scrolling.
 * Narration: arrive → why → featured chain → under heat → proofs → long arc → writing → more → archive → close.
 */
export const profileDeckSlides: ProfileDeckSlide[] = [
  {
    id: "cover",
    cue: "arrive",
    kind: "cover",
    chapter: "arrive",
    title: "Arrive",
  },
  {
    id: "story",
    cue: "inch-at-a-time",
    kind: "story",
    chapter: "story",
    title: "An inch at a time",
    bridge: "How craft arrives — not a spreadsheet of destinies.",
  },
  {
    id: "story-plan",
    cue: "plan-from-clarity",
    kind: "story-plan",
    chapter: "story",
    title: "Plan from clarity",
    bridge: "When the field settles, the plan goes deeper.",
  },
  {
    id: "story-quote",
    cue: "master-plan",
    kind: "story-quote",
    chapter: "story",
    title: "Master plan",
  },
  {
    id: "timeline-start",
    cue: "start",
    kind: "timeline",
    chapter: "story",
    title: "Start",
    bridge: "After Oneflow · Dec 2024",
    timelinePhase: "Start",
  },
  {
    id: "timeline-pause",
    cue: "pause",
    kind: "timeline",
    chapter: "story",
    title: "Pause",
    bridge: "The quiet months — paused, not abandoned.",
    timelinePhase: "Pause",
  },
  {
    id: "timeline-stretch",
    cue: "stretch",
    kind: "timeline",
    chapter: "story",
    title: "Stretch",
    bridge: "The graph forming itself.",
    timelinePhase: "Stretch",
  },
  {
    id: "feat-collab-finder",
    cue: "collab-finder",
    kind: "featured-one",
    chapter: "featured",
    title: "collab-finder",
    featuredSlug: "collab-finder",
    bridge: "Featured · Agents — self-guarded autonomy.",
  },
  {
    id: "feat-agent-prompt-tuning-lab",
    cue: "agent-prompt-tuning-lab",
    kind: "featured-one",
    chapter: "featured",
    title: "agent-prompt-tuning-lab",
    featuredSlug: "agent-prompt-tuning-lab",
  },
  {
    id: "feat-skills",
    cue: "skills",
    kind: "featured-one",
    chapter: "featured",
    title: "skills",
    featuredSlug: "skills",
  },
  {
    id: "feat-shellyxz.sh",
    cue: "shellyxz",
    kind: "featured-one",
    chapter: "featured",
    title: "shellyxz.sh",
    featuredSlug: "shellyxz.sh",
    bridge: "Systems — shell, machine, satellite.",
  },
  {
    id: "feat-arch-machine",
    cue: "arch-machine",
    kind: "featured-one",
    chapter: "featured",
    title: "arch-machine",
    featuredSlug: "arch-machine",
  },
  {
    id: "feat-elomaxz",
    cue: "elomaxz",
    kind: "featured-one",
    chapter: "featured",
    title: "elomaxz",
    featuredSlug: "elomaxz",
  },
  {
    id: "feat-adaptate",
    cue: "adaptate",
    kind: "featured-one",
    chapter: "featured",
    title: "adaptate",
    featuredSlug: "adaptate",
    bridge: "Products — explain, adapt, this site.",
  },
  {
    id: "feat-thepulimaangani",
    cue: "thepulimaangani",
    kind: "featured-one",
    chapter: "featured",
    title: "thepulimaangani",
    featuredSlug: "thepulimaangani",
  },
  {
    id: "feat-prototype-it-to-explain-itself",
    cue: "prototype-it",
    kind: "featured-one",
    chapter: "featured",
    title: "prototype-it-to-explain-itself",
    featuredSlug: "prototype-it-to-explain-itself",
  },
  {
    id: "feat-devprofile",
    cue: "devprofile",
    kind: "featured-one",
    chapter: "featured",
    title: "devprofile",
    featuredSlug: "devprofile",
  },
  {
    id: "cooking-ensembly",
    cue: "ensembly",
    kind: "cooking-set",
    chapter: "cooking",
    title: "ensembly",
    bridge: "Under heat — progress without killing inception.",
    cookingNames: ["ensembly"],
  },
  {
    id: "cooking-life-os",
    cue: "life-os",
    kind: "cooking-set",
    chapter: "cooking",
    title: "life-os",
    cookingNames: ["life-os"],
  },
  {
    id: "cooking-plugins",
    cue: "plugins",
    kind: "cooking-set",
    chapter: "cooking",
    title: "plugins",
    cookingNames: ["plugins"],
  },
  {
    id: "cooking-premflow",
    cue: "premflow",
    kind: "cooking-set",
    chapter: "cooking",
    title: "premflow",
    bridge: "Daily drivers — what you touch every day.",
    cookingNames: ["premflow"],
  },
  {
    id: "cooking-local",
    cue: "local-first-ai",
    kind: "cooking-set",
    chapter: "cooking",
    title: "Local-first AI",
    cookingNames: ["Local-first AI & quiet automation"],
  },
  {
    id: "poc-0",
    cue: "live-feed",
    kind: "pocs",
    chapter: "pocs",
    title: "v0-live-feed-app",
    bridge: "Shipped to learn — live surfaces, not daily drivers.",
    pocIndex: 0,
  },
  {
    id: "poc-1",
    cue: "selfie-sign-in",
    kind: "pocs",
    chapter: "pocs",
    title: "selfie-sign-in",
    pocIndex: 1,
  },
  {
    id: "long-arc",
    cue: "two-habits",
    kind: "long-arc",
    chapter: "long-arc",
    title: "Two habits",
    bridge: "Habits that outlast any single project.",
  },
  {
    id: "long-arc-core",
    cue: "orchestrate",
    kind: "long-arc-core",
    chapter: "long-arc",
    title: "Orchestrate under constraint",
    bridge: "Thesis 2016 → 2026",
  },
  {
    id: "long-arc-papers-a",
    cue: "primary-sources",
    kind: "long-arc-papers",
    chapter: "long-arc",
    title: "Primary sources",
    bridge: "Thesis & early papers",
    paperRange: [0, 3],
  },
  {
    id: "long-arc-papers-b",
    cue: "telling-the-arc",
    kind: "long-arc-papers",
    chapter: "long-arc",
    title: "How I tell the arc",
    bridge: "IEEE · Wiley · notes on X",
    paperRange: [3, 5],
  },
  {
    id: "long-arc-course",
    cue: "ship-more",
    kind: "long-arc-course",
    chapter: "long-arc",
    title: "Ship more than asked",
    bridge: "Course craft · Uppsala 2011",
  },
  {
    id: "writing",
    cue: "stakes-feel-real",
    kind: "writing",
    chapter: "writing",
    title: "When stakes feel real",
    bridge: "Writing · careful long-form",
  },
  {
    id: "npm-recent",
    cue: "packages-2024",
    kind: "npm",
    chapter: "writing",
    title: "Packages in motion",
    bridge: "npm · 2024",
    npmYear: "2024",
  },
  {
    id: "npm-earlier",
    cue: "packages-earlier",
    kind: "npm",
    chapter: "writing",
    title: "Earlier releases",
    bridge: "npm · 2017–2021",
    npmYear: "earlier",
  },
  {
    id: "oss-a",
    cue: "upstream-fixes",
    kind: "oss",
    chapter: "more",
    title: "Upstream fixes",
    bridge: "PRs that left the house",
    ossRange: [0, 2],
  },
  {
    id: "oss-b",
    cue: "ecosystem",
    kind: "oss",
    chapter: "more",
    title: "Ecosystem contributions",
    bridge: "Kent · React Boilerplate",
    ossRange: [2, 4],
  },
  {
    id: "connect",
    cue: "find-me",
    kind: "connect",
    chapter: "more",
    title: "Find me",
  },
  {
    id: "archive-intro",
    cue: "two-seasons",
    kind: "archive-intro",
    chapter: "archive",
    title: "Two seasons",
    bridge: "Honest archive — not a victory lap",
  },
  {
    id: "archive-surfaces-a",
    cue: "uppsala",
    kind: "archive-surfaces",
    chapter: "archive",
    title: "Uppsala surfaces",
    bridge: "Public writing that never left the map",
    surfaceRange: [0, 3],
  },
  {
    id: "archive-surfaces-b",
    cue: "pro-life",
    kind: "archive-surfaces",
    chapter: "archive",
    title: "Pro-life surfaces",
    bridge: "Low bandwidth · kept on the map",
    surfaceRange: [3, 5],
  },
  {
    id: "archive-samples-0",
    cue: "tamil",
    kind: "archive-samples",
    chapter: "archive",
    title: "Tamil samples",
    sampleIndex: 0,
  },
  {
    id: "archive-samples-1",
    cue: "tea-stall",
    kind: "archive-samples",
    chapter: "archive",
    title: "Tea Stall samples",
    sampleIndex: 1,
  },
  {
    id: "archive-samples-2",
    cue: "on-the-way",
    kind: "archive-samples",
    chapter: "archive",
    title: "On The Way samples",
    sampleIndex: 2,
  },
  {
    id: "close",
    cue: "elsewhere",
    kind: "close",
    chapter: "close",
    title: "Elsewhere",
  },
];

/** TOC: nested only when chapter is active. Few children so the rail never scrolls. */
export const profileDeckNav: ProfileDeckNavChapter[] = [
  { id: "arrive", label: "Arrive", firstSlideId: "cover" },
  {
    id: "story",
    label: "Story",
    firstSlideId: "story",
    children: [
      { label: "An inch at a time", firstSlideId: "story" },
      { label: "Plan from clarity", firstSlideId: "story-plan" },
      { label: "Start", firstSlideId: "timeline-start" },
      { label: "Pause", firstSlideId: "timeline-pause" },
      { label: "Stretch", firstSlideId: "timeline-stretch" },
    ],
  },
  {
    id: "featured",
    label: "Featured",
    firstSlideId: "feat-collab-finder",
    children: [
      { label: "Agents", firstSlideId: "feat-collab-finder" },
      { label: "Systems", firstSlideId: "feat-shellyxz.sh" },
      { label: "Products", firstSlideId: "feat-adaptate" },
    ],
  },
  {
    id: "cooking",
    label: "Cooking",
    firstSlideId: "cooking-ensembly",
    children: [
      { label: "Under heat", firstSlideId: "cooking-ensembly" },
      { label: "Daily drivers", firstSlideId: "cooking-premflow" },
    ],
  },
  { id: "pocs", label: "POCs", firstSlideId: "poc-0" },
  {
    id: "long-arc",
    label: "Long arc",
    firstSlideId: "long-arc",
    children: [
      { label: "Habits", firstSlideId: "long-arc" },
      { label: "Core", firstSlideId: "long-arc-core" },
      { label: "Papers", firstSlideId: "long-arc-papers-a" },
      { label: "Course", firstSlideId: "long-arc-course" },
    ],
  },
  {
    id: "writing",
    label: "Writing",
    firstSlideId: "writing",
    children: [
      { label: "Long-form", firstSlideId: "writing" },
      { label: "npm", firstSlideId: "npm-recent" },
    ],
  },
  {
    id: "more",
    label: "More",
    firstSlideId: "oss-a",
    children: [
      { label: "Upstream", firstSlideId: "oss-a" },
      { label: "Find me", firstSlideId: "connect" },
    ],
  },
  {
    id: "archive",
    label: "Archive",
    firstSlideId: "archive-intro",
    children: [
      { label: "Seasons", firstSlideId: "archive-intro" },
      { label: "Surfaces", firstSlideId: "archive-surfaces-a" },
      { label: "Samples", firstSlideId: "archive-samples-0" },
    ],
  },
  { id: "close", label: "Elsewhere", firstSlideId: "close" },
];

export function slideIndexById(slideId: string): number {
  return profileDeckSlides.findIndex((slide) => slide.id === slideId);
}

/** Query key for shareable deep links: `/profile?slide=<cue>`. */
export const PROFILE_SLIDE_PARAM = "slide";

export function slideIndexByCue(cue: string): number {
  return profileDeckSlides.findIndex((slide) => slide.cue === cue);
}

/** Resolve share URL value — cue first, then legacy internal id. */
export function resolveSlideIndex(slideParam: string | null | undefined): number {
  if (!slideParam) return 0;
  const byCue = slideIndexByCue(slideParam);
  if (byCue >= 0) return byCue;
  const byId = slideIndexById(slideParam);
  return byId >= 0 ? byId : 0;
}
