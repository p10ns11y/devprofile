export const BUILDING_SINGULARITY = {
  id: "loop",
  label: "One operator loop",
  sublabel: "white hole",
  line: "Projects fall in on the left. The operator is the other face: a white hole. Output, not capture. Personal stack, not a lab claim.",
  tooltip:
    "A Penrose white hole is the other side of a black hole: same throat, reverse arrow. A black hole captures; a white hole emits. Projects fall in on the left. What comes out is shipped work, not a gallery of repos.",
} as const;

export const BUILDING_FALLBACK_URL: Record<string, string> = {
  "arch-machine": "https://github.com/p10ns11y/arch-machine",
  elomaxz: "https://github.com/p10ns11y/elomaxz",
  "prototype-it-to-explain-itself": "https://github.com/p10ns11y/prototype-it-to-explain-itself",
  skills: "https://github.com/p10ns11y/skills",
  plugins: "https://github.com/p10ns11y/plugins",
  "shellyxz.sh": "https://github.com/p10ns11y/shellyxz.sh",
  premflow: "https://github.com/thecuriousts/premflow",
  ensembly: "https://github.com/thecuriousts/ensembly",
  "shelf-life": "https://github.com/thecuriousts/shelf-life",
};

export const BUILDING_PRIVATE = new Set(["mesh"]);

export const BUILDING_BLURB: Record<string, string> = {
  "collab-finder":
    "Tauri + Rust + React desktop app for high-fit roles and apply packs (1.0.0 shipped 19 Aug 2026).",
  "agent-prompt-tuning-lab":
    "Privacy-first toolkit: local agent transcripts to datasets, skills, and gold exemplars.",
  skills: "Portable agent skills extracted from lived workflows, not generic prompt packs.",
  plugins: "Grok and agent plugins that coach real CLIs. premflow pomo and coach over live tools.",
  devprofile: "Public portfolio and apply-CV. Next.js, grounded Q&A, Focus essays.",
  "arch-machine": "Hardened Arch workstation installer and control plane.",
  "shellyxz.sh":
    "Portable multi-shell kernel. PATH contract, plugin isolation, not a dotfiles dump.",
  mesh: "Private cooking for devices and networks. Not a public repo.",
  elomaxz: "Elm-style hybrid MVU for C. Tagged messages, pure update, first-class Cmd/Effect.",
  adaptate:
    "Ground-up npm validator. Different architecture from the Oneflow Zod lib. One optional Zod model, per-consumer contracts, OpenAPI interop.",
  premflow: "Small C CLI for notes, tasks, pomodoro, a daily journal, search, and a stats view.",
  ensembly:
    "Operator kernel under mass-market agents. Grok captures; ensembly-kernel holds done, pending, and denied so you do not re-pay tokens for the same gate. Pulse-pack syncs memory. Game of Peram is parked. Not a second chat.",
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
  { key: "mesh", cluster: "foundations-infra", area: "systems" },
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
