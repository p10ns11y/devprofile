export const BUILDING_SINGULARITY = {
  id: "loop",
  label: "One portal",
  sublabel: "white hole",
  line: "Fleet seeds carry work from areas into one portal. It is dark at intake and a white hole at release. What comes out (sparks, flames, dust, stars) feeds back into the map, and retired work drifts back in as raw material. Personal stack, not a lab claim.",
  womb: "Grok is the womb of the loop: work enters, is formed, and is born back out through the same portal.",
  tooltip:
    "A Penrose white hole is the other side of a black hole: same throat, reverse arrow. A black hole captures; a white hole emits. Work enters on the left. What comes out is shipped work, not a gallery of repos.",
} as const;

export const BUILDING_FALLBACK_URL: Record<string, string> = {
  "arch-machine": "https://github.com/p10ns11y/arch-machine",
  elomaxz: "https://github.com/p10ns11y/elomaxz",
  packedbox: "https://github.com/p10ns11y/packedbox",
  "prototype-it-to-explain-itself": "https://github.com/p10ns11y/prototype-it-to-explain-itself",
  skills: "https://github.com/p10ns11y/skills",
  plugins: "https://github.com/p10ns11y/plugins",
  "shellyxz.sh": "https://github.com/p10ns11y/shellyxz.sh",
  premflow: "https://github.com/thecuriousts/premflow",
  ensembly: "https://github.com/thecuriousts/ensembly",
  "shelf-life": "https://github.com/thecuriousts/shelf-life",
  "participatory-mesh": "https://github.com/thecuriousts/participatory-mesh",
};

export const BUILDING_PRIVATE = new Set<string>();

export const BUILDING_BLURB: Record<string, string> = {
  "collab-finder":
    "Desktop app for high-fit job hunting. Approve before apply files change (1.0.0 shipped 19 Aug 2026).",
  "agent-prompt-tuning-lab":
    "Privacy-first toolkit: local agent transcripts to datasets, skills, and gold exemplars.",
  skills: "Portable agent skills extracted from lived workflows, not generic prompt packs.",
  plugins: "Grok and agent plugins that coach real CLIs. premflow pomo and coach over live tools.",
  devprofile: "Public portfolio and apply-CV. Next.js, grounded Q&A, Focus essays.",
  "arch-machine": "Hardened Arch workstation installer and control plane.",
  "shellyxz.sh":
    "Portable multi-shell kernel. PATH contract, plugin isolation, not a dotfiles dump.",
  packedbox:
    "Melt of shellyxz.sh and arch-machine. Portable Linux bootstrap (Arch, Debian, Ubuntu) with a shared PATH contract and terminal pack for reliable setup on cloud servers, Grok Bot Computer, and cloud agent machines.",
  "participatory-mesh":
    "Elixir/OTP CommandFabric. An explicit allowlist across a distributed mesh. Transport and host tools are swappable. The product is the allowlist, not chat. Pairs with ensembly: authorize and claim, then dispatch onto another participant.",
  elomaxz: "Elm-style hybrid MVU for C. Tagged messages, pure update, first-class Cmd/Effect.",
  adaptate:
    "npm library: one optional shared model, per-consumer required fields at runtime, OpenAPI interop.",
  premflow: "Small C CLI for notes, tasks, pomodoro, a daily journal, search, and a stats view.",
  ensembly:
    "Local control layer under Grok and Cursor. Chat tools capture work; ensembly-kernel stores done, pending, and denied. Portable memory sync files. Not a second chat app.",
  thepulimaangani: "Tamil metre in the browser. Rust/WASM parser and React UI.",
  "shelf-life":
    "Writing — tech books and companions. When a book is on the shelf it has shelf-life. When it is with you it becomes another living experience.",
  "prototype-it-to-explain-itself":
    "Smallest complete prototypes so the code teaches the idea. Character-level LSTM (~150k params), temperature sampling, minimal ReAct agent. Education, not production training.",
};

export type ClusterId =
  | "agentic-reactor"
  | "presence-career"
  | "foundations-infra"
  | "cultural-creative"
  | "research-prototypes";

export type AreaId = "career" | "systems" | "creative" | "learning";

export type AtlasProject = {
  key: string;
  cluster: ClusterId;
  area: AreaId;
  /** Display-only craft line. Not a taxonomy. */
  epithet?: "writing" | "metre";
  role?: "operator";
};

export type ClusterRecord = { id: ClusterId; title: string };
export type AreaRecord = { id: AreaId; title: string };

export const BUILDING_CLUSTERS: readonly ClusterRecord[] = [
  { id: "agentic-reactor", title: "Agentic reactor" },
  { id: "presence-career", title: "Presence + career leverage" },
  { id: "foundations-infra", title: "Daily foundations + infra" },
  { id: "cultural-creative", title: "Cultural + creative root" },
  { id: "research-prototypes", title: "Research prototypes" },
];

export const BUILDING_AREAS: readonly AreaRecord[] = [
  { id: "career", title: "Career" },
  { id: "systems", title: "Systems" },
  { id: "creative", title: "Creative" },
  { id: "learning", title: "Learning" },
];

export const BUILDING_PROJECTS: readonly AtlasProject[] = [
  { key: "collab-finder", cluster: "agentic-reactor", area: "career" },
  { key: "agent-prompt-tuning-lab", cluster: "agentic-reactor", area: "learning" },
  { key: "skills", cluster: "agentic-reactor", area: "systems" },
  { key: "plugins", cluster: "agentic-reactor", area: "systems" },
  { key: "devprofile", cluster: "presence-career", area: "career" },
  { key: "elomaxz", cluster: "foundations-infra", area: "systems" },
  { key: "adaptate", cluster: "foundations-infra", area: "systems" },
  { key: "premflow", cluster: "foundations-infra", area: "systems" },
  { key: "arch-machine", cluster: "foundations-infra", area: "systems" },
  { key: "shellyxz.sh", cluster: "foundations-infra", area: "systems" },
  { key: "packedbox", cluster: "foundations-infra", area: "systems" },
  { key: "participatory-mesh", cluster: "foundations-infra", area: "systems" },
  {
    key: "thepulimaangani",
    cluster: "cultural-creative",
    area: "creative",
    epithet: "metre",
  },
  {
    key: "shelf-life",
    cluster: "cultural-creative",
    area: "creative",
    epithet: "writing",
  },
  { key: "prototype-it-to-explain-itself", cluster: "research-prototypes", area: "learning" },
  { key: "ensembly", cluster: "agentic-reactor", area: "systems", role: "operator" },
];

export function projectsInCluster(cluster: ClusterId): AtlasProject[] {
  return BUILDING_PROJECTS.filter((project) => project.cluster === cluster);
}

export function projectsInArea(area: AreaId): AtlasProject[] {
  return BUILDING_PROJECTS.filter((project) => project.area === area);
}

export const BUILDING_LOOP_STAGES = [
  { id: "universe", label: "Universe", line: "Areas hold clusters, which hold projects." },
  {
    id: "portal",
    label: "Portal",
    line: "Work enters dark at intake and leaves as a white hole at release. Grok forms it inside.",
  },
  {
    id: "pulse",
    label: "Ensembly",
    line: "Memory and heartbeat that keep the loop from forgetting, and the decision model that makes coordination programmatically repeatable across apps, harnesses and SI bots, Grok Bot included.",
  },
  {
    id: "platform",
    label: "SI platform",
    line: "Grok Bot coordinates its own bots the same way: it delegates work to them, decides through Ensembly and remembers through it too.",
  },
  {
    id: "fleet",
    label: "Fleet seeds",
    line: "Bots carry work from areas and clusters into the portal.",
  },
  {
    id: "release",
    label: "Release",
    line: "Sparks (ideas), flames (active builds), dust (fragments), stars (shipped PRs, deploys, releases, applications).",
  },
  {
    id: "feedback",
    label: "Feedback",
    line: "Learnings, new requirements and changes flow back and reshape areas, clusters and projects.",
  },
  {
    id: "decay",
    label: "Decay",
    line: "Retired, replaced, archived or melted projects drift back to the portal as raw material.",
  },
] as const;

export const BUILDING_RELEASE_KINDS = [
  { id: "spark", label: "sparks", note: "ideas" },
  { id: "flame", label: "flames", note: "active builds" },
  { id: "dust", label: "dust", note: "fragments" },
  { id: "star", label: "stars", note: "shipped PRs, deploys, releases, applications" },
] as const;
