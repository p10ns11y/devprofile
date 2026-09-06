export const SHIPPED_INDEX_HREF = "/shipped" as const;

export type WalkthroughSectionId =
  | "product"
  | "architecture"
  | "components"
  | "data-flow"
  | "tradeoffs"
  | "testing-ops";

export type WalkthroughMermaidBlock = { type: "mermaid"; code: string };

/** Scannable product surface — keep body short; mark examples in `sample`. */
export type WalkthroughCard = {
  title: string;
  kicker: string;
  body: string;
  /** Example or enum — rendered with an explicit Sample label. Not live metrics. */
  sample?: string;
};

export type WalkthroughBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: readonly string[] }
  | { type: "callout"; text: string }
  | { type: "flow"; steps: readonly string[] }
  | { type: "cards"; items: readonly WalkthroughCard[] }
  | WalkthroughMermaidBlock;

export type WalkthroughSection = {
  id: WalkthroughSectionId;
  title: string;
  /** Product blocks render before the tech band. */
  band: "product" | "tech";
  blocks: readonly WalkthroughBlock[];
};

export type ProjectWalkthrough = {
  slug: string;
  title: string;
  lede: string;
  eyebrow: string;
  /** Who the product is for. */
  audience: string;
  /** Concrete outcomes a visitor can scan in the first viewport. */
  outcomes: readonly string[];
  /** Primary UX / app surfaces. */
  surfaces: readonly string[];
  tech: readonly string[];
  /** Matches `projects[].key` in cvdata.json */
  cvdataKey: string;
  repoUrl: string;
  liveUrl?: string;
  npmUrl?: string;
  sections: readonly WalkthroughSection[];
};

export const PROJECT_WALKTHROUGHS: readonly ProjectWalkthrough[] = [
  {
    slug: "ensembly",
    title: "ensembly — local control layer",
    lede: "Local control layer for Grok Bot, Grok Build, and Cursor. Human approval (HITL) and automated digital work (HOOTL), a SQLite to-do ledger, mergeable episodic memory, and portable memory sync files. Not a second chat app.",
    eyebrow: "Systems · local control",
    audience:
      "Engineers and recruiters who want to see what runs under the chat tools: durable approve and deny state, not another chat window.",
    outcomes: [
      "Human approval (HITL) and automated digital work (HOOTL): approve, deny, claim, complete on your machine",
      "SQLite ledger for done, pending, and denied items",
      "Portable memory sync files without dual-write databases",
      "Read-only ensembly-mcp for Grok and Cursor",
    ],
    surfaces: [
      "ensembly-kernel CLI — runtime and memory sync",
      "ensembly-memory — mergeable episodic memory",
      "ensembly-mcp — read-only agent wire",
      "Bundled demo dataset for try-out",
    ],
    tech: ["ensembly-kernel", "ensembly-memory", "ensembly-mcp", "Rust"],
    cvdataKey: "ensembly",
    repoUrl: "https://github.com/thecuriousts/ensembly",
    sections: [
      {
        id: "product",
        title: "Product",
        band: "product",
        blocks: [
          {
            type: "callout",
            text: "Grok Bot keeps the chat. ensembly-kernel holds done, pending, and denied so you do not re-approve the same item. Not a second chat app.",
          },
          {
            type: "cards",
            items: [
              {
                title: "Daily workflow",
                kicker: "What you do",
                body: "Load a demo dataset or local ops DB, read status, run automated work ticks, then approve, deny, claim, or complete at human approval gates. Reflect scores coherence over episodic memory. The kernel tracks the critical path; chat tools do not own the ledger.",
              },
              {
                title: "Human approval / automated work",
                kicker: "Shipped · ensembly-kernel",
                body: "Life-state, dependency graph, critical path, and a typed message bus. Automated work (HOOTL) clears routine digital tasks. Human approval (HITL) waits for you to claim a physical task or explicitly approve or deny. Auth gates never self-approve.",
                sample:
                  "A small demo dataset of household tasks (rent, groceries) in automated vs waiting-for-you modes. Not this person's live machine.",
              },
              {
                title: "Portable memory sync",
                kicker: "Shipped · memory sync",
                body: "Export and import portable memory sync files between Grok Bot on your main machine and a laptop. Memory only. The ops SQLite file has one writer. No live cloud sync and no dual master.",
                sample:
                  "Format ensembly-pulse-pack-v1. Legacy peram-pulse-pack-v1 still imports. Commands export, status, import. Memory merge only — no live session counts.",
              },
              {
                title: "SQLite ops ledger",
                kicker: "Durable state",
                body: "Default ops file is local ensembly-ops.sqlite. Episodic ensembly-memory.json is auxiliary. It records and learns. It never decides gates or priority. Old installs keep working; a one-shot copy renames local files if you want the new names. Secrets stay off git.",
              },
            ],
          },
          {
            type: "flow",
            steps: [
              "Chat proposes work",
              "Runtime tick",
              "Human approval gate",
              "Ledger write",
              "Memory file merge",
            ],
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "mermaid",
            code: `graph TB
  subgraph tools["Grok Bot / Build / Cursor"]
    GROK["Chat and capture"]
  end
  subgraph kernel["ensembly-kernel"]
    RT["Human approval + automated work"]
    LED["SQLite ledger"]
    PP["pulse-pack"]
    RT --> LED
    RT --> PP
  end
  subgraph mem["ensembly-memory"]
    CRDT["Mergeable memory"]
  end
  MCP["ensembly-mcp (read-only)"]
  GROK -->|"proposals"| RT
  RT --> CRDT
  PP -->|"memory merge"| CRDT
  MCP -.->|"read"| CRDT`,
          },
          {
            type: "bullets",
            items: [
              "ensembly-kernel is the control source of truth: life-state, dependency graph, critical path, message bus, backup, and pulse-pack",
              "ensembly-memory is auxiliary mergeable memory (CRDT). The kernel never delegates gate or priority decisions to it",
              "ensembly-mcp is read-only for Grok and Cursor. Agents query memory. They do not own the ops DB",
              "Grok Bot on your main machine owns the ops SQLite file. Laptop import merges memory only",
            ],
          },
        ],
      },
      {
        id: "components",
        title: "Key components",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Runtime CLI: load, status, tick, approve, deny, claim, complete, reflect against a local DB or bundled demo dataset. Primary bin ensembly; one-release alias peram",
              "Portable memory sync (pulse-pack): export, status, import. Memory and archive events only. No ops dual-write",
              "ensembly-mcp: read-only Model Context Protocol tools for Grok and Cursor. One-release alias peram-mcp",
              "prototype/: an older browser game and Node stack. Not the product",
            ],
          },
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        band: "tech",
        blocks: [
          {
            type: "flow",
            steps: [
              "Chat tool proposes work",
              "Kernel records pending",
              "Automated work tick or human approval",
              "Ledger write",
              "Optional reflect",
              "Pulse-pack export on the main machine",
              "Laptop import merges memory",
            ],
          },
          {
            type: "paragraph",
            text: "The life-os vault (Projects and Areas) stays separate. ensembly is the local control layer on your machine. Private life data stays in data/local and is never part of the MIT grant.",
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Works alongside Grok instead of competing as a chat app. No visitor UI. Daily use is CLI and memory sync files",
              "Single-writer ops SQLite prevents silent gate drift and forbids live dual-write sync. Memory sync is file copy, not a hosted dashboard",
              "Scope is local CLI and file sync, not a hosted multi-user service",
            ],
          },
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Dev workflow: cargo test -p ensembly-kernel and cargo test -p ensembly-memory. Optional: load the bundled demo dataset locally",
              "ensembly-mcp builds as a read-only binary. No new chat app or plugin sprawl",
              "Privacy default-deny: data/local and private/ stay off git",
              "Background essay on human approval (HITL) and automated work (HOOTL) is at /articles/hitl-hootl. Not live metrics",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "collab-finder",
    title: "collab-finder — job hunt desktop app",
    lede: "Desktop app for high-fit job hunting at kanithanj.ai. You approve before anything is written to your master CV or apply files. Hunt screens, pack health, pipeline, and a local database — not a chat replacement.",
    eyebrow: "Career · desktop app",
    audience:
      "Engineers and recruiters who want structured job-hunt screens, not another chat window.",
    outcomes: [
      "Hunt flow: Evaluate → Prepare → Generate apply PDF on your machine",
      "Pack health checks without opening a terminal",
      "Pipeline tracks prep and post-apply outcomes",
      "Local SQLite database. Credentials stay on the machine",
      "Named apply PDFs via the CV generate CLI (kanithanj.cv)",
    ],
    surfaces: [
      "Discover / Mission / Sweden / Xplore hunt screens",
      "Preferences — pack health checks",
      "Pipeline — hunt progress",
      "CV generate CLI (kanithanj.cv)",
      "Local SQLite database",
    ],
    tech: ["Tauri", "Rust", "React", "TypeScript", "SQLite"],
    cvdataKey: "collab-finder",
    repoUrl: "https://github.com/p10ns11y/collab-finder",
    liveUrl: "https://kanithanj.ai",
    sections: [
      {
        id: "product",
        title: "Product",
        band: "product",
        blocks: [
          {
            type: "callout",
            text: "Desktop app for job hunting at kanithanj.ai. Structured screens with cost, fit, and rate checks. You approve before the master CV on the public portfolio site or apply files change. Not a chat replacement.",
          },
          {
            type: "cards",
            items: [
              {
                title: "Hunt loop",
                kicker: "What you do",
                body: "Browse Discover, Mission, Sweden, or Xplore for roles. In Quick Target, paste a job URL or description, evaluate fit, prepare notes, generate an apply CV, then mark Applied. Click a saved row to restore fit and prep from the local database without calling the model again.",
              },
              {
                title: "Preferences pack health",
                kicker: "Shipped · Preferences",
                body: "Checks identity files in the packs folder on disk. No network. Evaluate and Next 10 read those files. They are not compiled into the app. If pack files are missing, Evaluate uses placeholder text.",
                sample:
                  "Demo badges for pack status. Not a live machine.",
              },
              {
                title: "Pipeline",
                kicker: "Shipped · Pipeline",
                body: "Hunt progress screen. Prep status and post-apply outcome stay separate. A dedicated query keeps applied rows visible when Mission inventory floods recency-limited history.",
                sample:
                  "Fixed prep stages and outcome labels in the app. No live counts.",
              },
              {
                title: "Local SQLite ledger",
                kicker: "Durable state",
                body: "Local SQLite database on this machine for opportunities, prep, events, and history. Secrets stay in the OS keyring. Multi-device sync is not the product. Optional local backup and export scripts — not a hosted dashboard.",
              },
            ],
          },
          {
            type: "flow",
            steps: [
              "Find roles",
              "Evaluate and prepare",
              "Packs on disk",
              "CV generate CLI",
              "Track outcome",
            ],
          },
          {
            type: "paragraph",
            text: "Job hunting spreads across tabs, notes, and chat logs. This app keeps a local ledger first. Chat is a helper, not the only UI.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "mermaid",
            code: `graph TB
  subgraph hunt["Hunt"]
    SRC["Discover / Mission / Sweden / Xplore"]
    QT["Evaluate → Prepare → Generate"]
    SRC --> QT
  end
  subgraph ground["Grounding"]
    PH["Preferences pack health"]
    PK["Identity packs on disk"]
    PH --> PK
  end
  subgraph persist["Ledger"]
    DB["Local SQLite"]
    PL["Pipeline"]
    DB --> PL
  end
  subgraph apply["Apply"]
    PKOUT["Packs folder"]
    CLI["kanithanj.cv"]
    PKOUT --> CLI
  end
  PK --> QT
  QT --> DB
  QT --> PKOUT`,
          },
          {
            type: "bullets",
            items: [
              "Tauri desktop shell (Rust + React): UI calls a Rust core for secrets and file work",
              "Secrets and pause guards stay in Rust so the UI cannot casually export credentials",
              "Local SQLite database (WAL mode) holds opportunities, prep, events, and pipeline dates",
              "Master CV on the public portfolio site is never mutated by apply — per-job changes merge at generate time",
            ],
          },
        ],
      },
      {
        id: "components",
        title: "Key components",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Hunt screens: Discover rail and Quick Target; Mission career boards; Sweden JobTech; Xplore live X plus a guarded cycle",
              "Preferences: pack health checks, CV generate CLI install, rank packs. Health is local file inspection",
              "Pipeline: dedicated opportunity query, prep status, and separate post-apply outcomes",
              "CV generate CLI (kanithanj.cv): status, list, generate, sync. Writes PDFs. Never mutates the master CV on the public portfolio site",
            ],
          },
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        band: "tech",
        blocks: [
          {
            type: "flow",
            steps: [
              "Opportunity in",
              "Ledger row",
              "CV packet from packs or textarea",
              "Evaluate + Prepare",
              "Human review",
              "Export pack / generate apply CV",
              "Pipeline outcome",
            ],
          },
          {
            type: "paragraph",
            text: "Promote to the public site is a separate sync of the master CV. Dynamic web apply CVs from packs stay deferred until shared storage exists. The portfolio PDF path stays master-only.",
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Human approval before promote slows automation and prevents silent CV corruption. That friction is intentional",
              "Tauri desktop adds Rust surface area versus a pure web app. The payoff is OS keychain boundaries and a real offline ledger",
              "Hunt screens own the work. Quest chat exists but is not the primary UI",
            ],
          },
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "CI quality gates ship with the 1.0.0 cut",
              "Pack health unit tests cover missing, seeded, and placeholder identity files",
              "Pipeline verify runner plus merge-status tests keep applied rows from being dropped",
              "Per-job CV merge behavior is covered in this portfolio repo so PDF featured projects stay deterministic",
              "Ops stay boring: local SQLite, packs under ~/.local/share/collab-finder, CLI sync for the master CV",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "thepulimaangani",
    title: "thepulimaangani — Tamil metre in the browser",
    lede: "Classical Tamil prosody in the browser: a Rust metre parser compiled to WASM, wrapped in React, with no backend required for analysis.",
    eyebrow: "Creative · metre",
    audience:
      "Scholars, students, and builders who need classical Tamil metre without a remote NLP API.",
    outcomes: [
      "Segmentation and metre labels in the browser",
      "No analysis backend or text shipped to a remote NLP API",
      "Deterministic Rust core reusable outside the web shell",
      "Hand-built feature vector. No raw-text net on the product path",
    ],
    surfaces: [
      "Paste / editor surface for verse",
      "Result panels for segmentation and metre labels",
      "Static Vercel demo host",
    ],
    tech: ["Rust", "WASM", "TypeScript", "React"],
    cvdataKey: "thepulimaangani",
    repoUrl: "https://github.com/p10ns11y/thepulimaangani",
    liveUrl: "https://seiyul-alagi.vercel.app/",
    sections: [
      {
        id: "product",
        title: "Product",
        band: "product",
        blocks: [
          {
            type: "callout",
            text: "Classical Tamil metre rules drive the parser, not a raw-text neural net. Paste verse, get segmentation and labels in the browser. No server round-trip for analysis.",
          },
          {
            type: "bullets",
            items: [
              "Paste Tamil verse and get syllable segmentation plus metre labels on screen",
              "Classical rule checker and rule-based metre head run first",
              "Analysis stays in the browser. Text is not sent to a remote API",
            ],
          },
          {
            type: "paragraph",
            text: "Tamil classical metre (yāppu) is precise linguistic structure. Most poetry tools either ignore prosody or bury it in desktop corpora that do not travel with the reader.",
          },
          {
            type: "callout",
            text: "The parser runs in the browser so inspection stays private, portable, and free of a server.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "mermaid",
            code: `graph LR
  TXT["User verse"] --> UI["React UI"]
  UI --> WASM["WASM bridge"]
  WASM --> RUST["Rust metre parser"]
  RUST --> OUT["Segmentation & metre labels"]
  OUT --> UI`,
          },
          {
            type: "bullets",
            items: [
              "Hot path is Rust: parser and prosody rules compile to WebAssembly",
              "React loads the WASM module once and calls into it for analysis",
              "UI state stays in TypeScript; static hosting is enough for the demo",
              "Offline ML helpers stay out of the browser path; live analysis uses classical rules and a rule-based metre head",
            ],
          },
        ],
      },
      {
        id: "components",
        title: "Key components",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Rust metre crate: tokenization, syllable / acai structure, metre classification",
              "WASM bridge: typed exports the UI can call without reimplementing grammar in JavaScript",
              "React UI: reading-first panels, not a developer console dump",
            ],
          },
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        band: "tech",
        blocks: [
          {
            type: "flow",
            steps: ["User text", "React state", "WASM parse", "Structured result", "Render"],
          },
          {
            type: "paragraph",
            text: "No network round-trip for the core path. Optional corpora or saved sessions stay outside the parser boundary so the linguistic core remains a pure function of input text.",
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "WASM payload size versus server-side NLP: first load costs bytes; later analysis is free and private",
              "Encoding classical rules in Rust is slower than a heuristic JS port; correctness and reuse outweigh one-time compile cost",
              "Browser-only demo limits heavy corpus jobs; fine for an interactive reading tool",
            ],
          },
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Parser fixtures against known metre examples catch rule regressions",
              "UI smoke covers load-WASM and round-trip display",
              "Deploy is static: build WASM + frontend, ship. No database or model endpoint",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "adaptate",
    title: "Adaptate — runtime validation for shared API models",
    lede: "npm library that keeps one shared model optional by default, then tightens required fields per API consumer at runtime, with docs and gateway interop. Built on Zod with OpenAPI / JSON Schema bridges when different consumers need different required fields.",
    eyebrow: "Systems · validation",
    audience:
      "API authors where Partner A requires fields Partner B must omit.",
    outcomes: [
      "One optional base model shared across consumers",
      "Per-consumer rules for required and optional fields at runtime",
      "OpenAPI / JSON Schema interop without a second source of truth",
    ],
    surfaces: [
      "npm packages (@adaptate/core, utils, adaptate)",
      "Runtime adapter composition in Node",
      "OpenAPI / JSON Schema bridge helpers",
    ],
    tech: ["TypeScript", "Zod", "OpenAPI", "JSON Schema", "Node.js"],
    cvdataKey: "adaptate",
    repoUrl: "https://github.com/p10ns11y/adaptate",
    npmUrl: "https://www.npmjs.com/package/adaptate",
    sections: [
      {
        id: "product",
        title: "Product",
        band: "product",
        blocks: [
          {
            type: "callout",
            text: "One shared model with every field optional by default. Per-consumer rules tighten what is required at runtime. Docs and gateways can share the same model through OpenAPI / JSON Schema. No second source of truth.",
          },
          {
            type: "paragraph",
            text: "When Partner A requires fields Partner B must omit, a single static schema breaks down. It either over-constrains everyone or under-validates the callers who need strictness.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "mermaid",
            code: `graph TB
  CTX["Request + consumer context"] --> ADP["Consumer adapter"]
  BASE["Optional base model"] --> ADP
  ADP --> ZOD["Zod validate"]
  ZOD --> RES["Typed result / error"]
  OAPI["OpenAPI / JSON Schema"] -.interop.-> BASE`,
          },
          {
            type: "bullets",
            items: [
              "npm packages (@adaptate/core, utils, adaptate) for runtime validation in Node",
              "Consumer adapters apply per-consumer rules keyed by route or caller",
              "Validation stays TypeScript-first on top of Zod",
              "OpenAPI / JSON Schema bridges generate or align contracts — not a second source of truth",
            ],
          },
        ],
      },
      {
        id: "components",
        title: "Key components",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Base model: fields optional by default so the shared shape stays honest",
              "Consumer adapters: runtime per-consumer rules keyed by consumer or route context",
              "Interop helpers: bridges toward OpenAPI / JSON Schema for docs and gateways",
            ],
          },
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        band: "tech",
        blocks: [
          {
            type: "flow",
            steps: [
              "Request context selects consumer contract",
              "Adapter composes base + per-consumer rules",
              "Parse / validate payload",
              "Typed result or structured error",
            ],
          },
          {
            type: "paragraph",
            text: "Failed validation stays local to the request. Schema authorship stays in code review, not in a detached CMS of JSON files.",
          },
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Runtime per-consumer rules are more flexible than codegen-per-partner and harder to exhaustively type than a closed Zod union",
              "Publishing as npm packages forces semver discipline; breaking rule semantics is a major version",
              "OpenAPI interop lags exotic Zod refinements — document the subset you promise",
            ],
          },
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Unit tests lock per-consumer rule precedence, unknown-key policy, and missing-field errors",
              "Package publish is the release train; consumers pin versions",
              "CI runs type-check and the validation matrix before npm",
            ],
          },
        ],
      },
    ],
  },
] as const;

export const SHIPPED_WALKTHROUGH_SLUGS = [
  "ensembly",
  "collab-finder",
  "thepulimaangani",
  "adaptate",
] as const;

export type ProjectWalkthroughSlug = (typeof PROJECT_WALKTHROUGHS)[number]["slug"];

export function listProjectWalkthroughs(): readonly ProjectWalkthrough[] {
  return PROJECT_WALKTHROUGHS;
}

export function getProjectWalkthrough(slug: string): ProjectWalkthrough | undefined {
  return PROJECT_WALKTHROUGHS.find((project) => project.slug === slug);
}

export function projectWalkthroughSlugs(): ProjectWalkthroughSlug[] {
  return PROJECT_WALKTHROUGHS.map((project) => project.slug);
}

export function walkthroughSectionsByBand(
  project: ProjectWalkthrough,
  band: WalkthroughSection["band"]
): readonly WalkthroughSection[] {
  return project.sections.filter((section) => section.band === band);
}

/** Architecture section must lead with a mermaid block; rendered above tech prose. */
export function getArchitectureDiagram(
  project: ProjectWalkthrough
): WalkthroughMermaidBlock | undefined {
  const architecture = project.sections.find((section) => section.id === "architecture");
  const first = architecture?.blocks[0];
  return first?.type === "mermaid" ? first : undefined;
}

/** Omit the band-level diagram when rendering architecture section body copy. */
export function sectionBlocksWithoutLeadingDiagram(
  section: WalkthroughSection
): readonly WalkthroughBlock[] {
  if (section.id !== "architecture" || section.blocks[0]?.type !== "mermaid") {
    return section.blocks;
  }
  return section.blocks.slice(1);
}
