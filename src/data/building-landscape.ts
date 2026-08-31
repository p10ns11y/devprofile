export const BUILDING_SINGULARITY = {
  id: "loop",
  label: "One operator loop",
  line: "cvdata, gates, and local agents meet here. Personal stack, not a lab claim.",
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
    "Operator. Uses Grok Bot, Grok Build, and the projects on this map as tools. Local kernel plus playable HITL.",
  thepulimaangani: "Tamil metre in the browser. Rust/WASM parser and React UI.",
  "shelf-life":
    "When a book is on the shelf it has shelf-life. When it is with you it becomes another living experience.",
  "prototype-it-to-explain-itself":
    "Smallest complete prototypes so the code teaches the idea. Character-level LSTM (~150k params), temperature sampling, minimal ReAct agent. Education, not production training.",
};

export const BUILDING_CLUSTERS = [
  {
    id: "agentic",
    title: "Agentic reactor",
    keys: ["collab-finder", "agent-prompt-tuning-lab", "skills", "plugins"],
  },
  {
    id: "presence",
    title: "Presence",
    keys: ["devprofile"],
  },
  {
    id: "foundations",
    title: "Foundations",
    keys: ["elomaxz", "adaptate", "premflow"],
  },
  {
    id: "systems",
    title: "Low-level systems",
    keys: ["arch-machine", "shellyxz.sh", "mesh"],
  },
  {
    id: "cultural",
    title: "Cultural root",
    keys: ["thepulimaangani", "shelf-life"],
  },
  {
    id: "research",
    title: "Research",
    keys: ["prototype-it-to-explain-itself"],
  },
  {
    id: "operator",
    title: "Operator",
    keys: ["ensembly"],
    nearSink: true,
  },
] as const;

export const BUILDING_LAYOUT = {
  labelX: 28,
  nodeX: 280,
  operatorX: 720,
  row: 28,
  groupGap: 16,
  top: 28,
  width: 1100,
  sinkX: 980,
} as const;
