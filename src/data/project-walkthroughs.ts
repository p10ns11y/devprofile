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
    title: "ensembly — operator kernel",
    lede: "A thin complementary kernel under Grok Bot, Grok Build, and Cursor: HITL and HOOTL gates, a T1 SQLite ledger, episodic memory, and pulse-pack sync. Not a second chat OS. Game of Peram stays parked in prototype/.",
    eyebrow: "Systems · operator kernel",
    audience:
      "Hiring visitors and operators who need the layer under capture tools — durable gates and pulses, not another chat window.",
    outcomes: [
      "HITL / HOOTL runtime: approve, deny, claim, complete on the machine",
      "T1 SQLite ledger for done, pending, and denied",
      "Pulse-pack memory sync without dual-write ops",
      "Read-only peram-mcp for Grok and Cursor",
      "Game of Peram / Node swarm parked under prototype/",
    ],
    surfaces: [
      "peram-kernel CLI — runtime and pulse-pack",
      "peram-memory — episodic CRDT",
      "peram-mcp — read-only agent wire",
      "Issue #1 runtime fixture",
      "prototype/ — parked game and Node stack",
    ],
    tech: ["Rust", "SQLite", "CRDT", "MCP"],
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
            text: "Complementary operator kernel — a white hole under Grok Bot, Grok Build, and Cursor. Capture stays on the harness. ensembly holds done, pending, and denied so you do not re-litigate the same gate. Not a second chat OS. Game of Peram is parked in prototype/, not the live product.",
          },
          {
            type: "cards",
            items: [
              {
                title: "Operator loop",
                kicker: "What you do",
                body: "Load a fixture or local ops DB, read status, tick HOOTL digital work, then approve, deny, claim, or complete at HITL gates. Reflect scores coherence over episodic memory. The kernel names the critical path; the harness does not own the ledger.",
              },
              {
                title: "HITL / HOOTL runtime",
                kicker: "Shipped · peram-kernel",
                body: "Life-state, dependency graph, critical path, and a typed message bus. HOOTL agents clear digital thrash. HITL waits for body-world claims or explicit approve and deny. Auth gates never self-approve.",
                sample:
                  "Fixture actions pay-rent and grocery-errand. Regimes Hootl and HitlWait. Issue #1 fixture only — not a live operator machine.",
              },
              {
                title: "Pulse-pack",
                kicker: "Shipped · memory sync",
                body: "Portable memory export and import between Grok Bot as the canonical host and a laptop client. Pulse-pack is memory only. Ops SQLite stays single-writer. No live cloud sync and no dual master.",
                sample:
                  "Format peram-pulse-pack-v1. Commands export, status, import. Memory merge only — no live session counts.",
              },
              {
                title: "T1 SQLite ledger",
                kicker: "Durable memory",
                body: "Local peram-ops.sqlite is the control source of truth for gates and regime. Episodic peram-memory.json is auxiliary — it records and learns; it never decides gates or priority. Secrets and life data stay off git.",
              },
            ],
          },
          {
            type: "flow",
            steps: [
              "Harness captures",
              "Runtime tick",
              "HITL gate",
              "Ledger write",
              "Pulse-pack merge",
            ],
          },
          {
            type: "paragraph",
            text: "Mass-market agents optimize capture. The Musk cut of 4 September 2026 parked the browser game, Node swarm, and WASM world sim under prototype/. Live crates are peram-kernel, peram-memory, and the read-only peram-mcp wire. Automate the digital. Surface the physical. Wait only for permission.",
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
  subgraph harness["Harness"]
    GROK["Grok Bot / Build / Cursor"]
  end
  subgraph kernel["peram-kernel"]
    RT["HITL / HOOTL runtime"]
    LED["T1 SQLite ledger"]
    PP["pulse-pack"]
    RT --> LED
    RT --> PP
  end
  subgraph mem["peram-memory"]
    CRDT["Episodic CRDT"]
  end
  MCP["peram-mcp"]
  GROK -->|"capture"| RT
  RT --> CRDT
  PP -->|"memory merge"| CRDT
  MCP -.->|"read"| CRDT`,
          },
          {
            type: "bullets",
            items: [
              "peram-kernel is the control source of truth: life-state, dependency graph, critical path, message bus, backup, and pulse-pack",
              "peram-memory is an auxiliary CRDT. The kernel never delegates gate or priority decisions to it",
              "peram-mcp is a read-only satellite for Grok and Cursor. Agents query memory; they do not own the ops DB",
              "Grok Bot is the canonical host for ops SQLite. Laptop import merges memory only",
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
              "Runtime CLI: load, status, tick, approve, deny, claim, complete, reflect against a local DB or the Issue #1 fixture",
              "Pulse-pack: export, status, import. Memory and archive events only — no ops dual-write",
              "peram-mcp: read-only Model Context Protocol tools for harnesses",
              "prototype/: parked Game of Peram client, Node swarm.js, and WASM world sim. Not source of truth",
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
              "Harness proposes work",
              "Kernel records pending",
              "HOOTL tick or HITL decision",
              "Ledger write",
              "Optional reflect",
              "Pulse-pack export on the canonical host",
              "Laptop import merges memory",
            ],
          },
          {
            type: "paragraph",
            text: "life-os remains the clustered Projects and Areas vault. ensembly is the local digital-clone kernel. Private life data stays in data/local and is never part of the MIT grant.",
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
              "Complementing Grok instead of competing as a chat OS means the kernel has no visitor canvas. Dogfood is CLI and pulse files",
              "Single-writer ops SQLite prevents silent gate drift and forbids live dual-write sync. Pulse-pack is file copy, not a hosted dashboard",
              "Parking Game of Peram removes a play loop that hiring visitors might expect. The product is gates, pulses, and a ledger",
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
              "Dogfood path is cargo test on peram-kernel and peram-memory, then runtime load of the Issue #1 fixture",
              "peram-mcp builds as a read-only binary. No new chat OS or plugin sprawl",
              "Privacy default-deny: data/local and private/ stay off git",
              "Thesis copy for HITL and HOOTL lives on this site at /articles/hitl-hootl. It is design law, not live metrics",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "collab-finder",
    title: "collab-finder — career heading cockpit",
    lede: "kanithanj.ai is a Tauri heading cockpit for high-fit roles: hunt, pack health, pipeline, and a local SQLite ledger. Human promote before anything becomes permanent. Not a second chat OS.",
    eyebrow: "Career · heading cockpit",
    audience:
      "Hiring visitors and operators who need a career heading cockpit — structured screens, not another chat window.",
    outcomes: [
      "Hunt loop: Evaluate → Prepare → Generate on the machine",
      "Preferences pack health without opening a terminal",
      "Pipeline hunt progress with prep and post-apply outcomes",
      "Local SQLite ledger. Credentials stay on the machine",
      "Named apply PDFs via kanithanj.cv overlays",
    ],
    surfaces: [
      "Discover / Mission / Sweden / Xplore",
      "Preferences — operator pack health",
      "Pipeline — hunt progress",
      "kanithanj.cv CLI",
      "Local SQLite ledger",
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
            text: "Career heading cockpit — a satellite, not a second chat OS. Structured screens. Cost, fit, and rate gates. HITL promote before master CV or submit artifacts change.",
          },
          {
            type: "cards",
            items: [
              {
                title: "Hunt loop",
                kicker: "What you do",
                body: "Discover, Mission, Sweden, and Xplore ingest roles. Quick Target: paste a URL or JD, Evaluate fit, Prepare, Generate apply CV, then mark Applied. Click a rail row to restore fit and prep from SQLite — no extra model call.",
              },
              {
                title: "Preferences pack health",
                kicker: "Shipped · Preferences",
                body: "Operator pack health inspects identity files under the packs directory on disk. No network. Evaluate and Next 10 read those files — they are not compiled into the binary. Missing seed silently falls Evaluate back to stub CV text.",
                sample:
                  "Badge labels Seeded, Degraded, Stub identity, Missing. File kinds ok, stub, missing. Not a live machine.",
              },
              {
                title: "Pipeline",
                kicker: "Shipped · Pipeline",
                body: "Hunt-progress screen. Prep status and post-apply outcome stay orthogonal. A dedicated query keeps applied rows visible when Mission inventory floods recency-limited history.",
                sample:
                  "Prep: new, analyzed, prepped, applied, passed, archived. Outcome: waiting, screening, interview, offer, rejected, withdrawn. Enums only — no live counts.",
              },
              {
                title: "Local SQLite ledger",
                kicker: "Durable memory",
                body: "WAL SQLite on the machine for opportunities, prep, events, and history. Secrets stay in the OS keyring. Multi-device sync is not the product. Optional local backup and export scripts — not a hosted dashboard.",
              },
            ],
          },
          {
            type: "flow",
            steps: [
              "Hunt ingest",
              "Evaluate + Prepare",
              "Pack on disk",
              "kanithanj.cv generate",
              "Pipeline outcome",
            ],
          },
          {
            type: "paragraph",
            text: "Job hunting fragments into tabs, notes, and chat logs. This app is the heading cockpit: ledger first. Chat is never the only surface.",
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
    DB["SQLite WAL"]
    PL["Pipeline"]
    DB --> PL
  end
  subgraph apply["Apply"]
    XDG["XDG application pack"]
    CLI["kanithanj.cv"]
    XDG --> CLI
  end
  PK --> QT
  QT --> DB
  QT --> XDG`,
          },
          {
            type: "bullets",
            items: [
              "Tauri 2 shell: React/TypeScript MVU talks to a Rust core over a narrow command surface",
              "Secrets and pause guards stay in Rust so the UI cannot casually export credentials",
              "SQLite WAL is the durable ledger for opportunities, prep, events, and pipeline dates",
              "Master cvdata in the public portfolio is never mutated by apply — overlays merge at generate time",
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
              "Preferences: operator pack health, kanithanj.cv install, rank packs. Health is local file inspection",
              "Pipeline: dedicated opportunity query, prep status, and orthogonal post-apply outcomes",
              "kanithanj.cv: status, list, generate, sync. Writes PDFs. Never mutates site master cvdata",
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
            text: "Promote to the public site is a separate sync of master cvdata. Dynamic web apply CVs from packs stay deferred until shared storage exists; the portfolio PDF path stays master-only.",
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
              "HITL promote slows automation and prevents silent CV corruption. That friction is intentional",
              "Desktop (Tauri) adds Rust surface area versus a pure web app; the payoff is OS keychain boundaries and a real offline ledger",
              "Satellite to the operator loop, not a chat OS. Quest exists; hunt screens own the work",
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
              "Pack health unit tests cover missing, seeded, and stub identity files",
              "Pipeline verify runner plus merge-status tests keep applied rows from being dropped",
              "Overlay merge behavior is covered in this portfolio repo so PDF featured projects stay deterministic",
              "Ops stay boring: local SQLite, packs under ~/.local/share/collab-finder, CLI sync for cvdata",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "thepulimaangani",
    title: "thepulimaangani — Tamil metre in the browser",
    lede: "Classical Tamil prosody as a cultural-computational product: a Rust metre parser compiled to WASM, wrapped in a React UI, with no backend required for analysis.",
    eyebrow: "Creative · metre",
    audience:
      "Scholars, students, and builders who need classical Tamil metre without a remote NLP API.",
    outcomes: [
      "Segmentation and metre labels in the browser",
      "No analysis backend or text shipped to a remote NLP API",
      "Deterministic Rust core reusable outside the web shell",
      "Engineered dense[51] features. No raw-text net on the product path",
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
            text: "Classical ML on the parse plant, not a raw-text net. Mid-level labs can read the breadth as hiring confidence. Frontier labs may find the catalogue obvious.",
          },
          {
            type: "bullets",
            items: [
              "Parse plant to dense[51] engineered features. No raw-text TF-IDF or big net on the product path",
              "Heuristic metre head plus dense boosts. Optional hybrid multinomial logistic",
              "PCA, Monte Carlo, entropy/margin. Dual-truth: ML stays separate from the classical checker",
              "Pattern microscope: logistic, linear SVM, k-NN/prototypes, calibration, LDA/MI",
              "Trees and GBDT stay offline. Naive Bayes, clustering, HMM/CRF are research. Not every Tier B method is live in WASM",
            ],
          },
          {
            type: "paragraph",
            text: "Tamil classical metre (yāppu) is precise linguistic structure, not a vibe check. Most poetry tools either ignore prosody or bury it in desktop corpora that do not travel with the reader.",
          },
          {
            type: "callout",
            text: "Put the parser in the browser so inspection stays private, portable, and free of a server.",
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
    title: "Adaptate — adaptable Zod / OpenAPI validators",
    lede: "A ground-up npm validator: one optional Zod model, per-consumer required fields at runtime, and OpenAPI interop — for APIs where static schemas stop at the multi-tenant edge.",
    eyebrow: "Systems · validation",
    audience:
      "API authors with multi-consumer contracts where Partner A requires fields Partner B must omit.",
    outcomes: [
      "One optional base model shared across consumers",
      "Per-consumer required/optional overlays at runtime",
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
            text: "One optional base model. Per-consumer required or optional overlays at runtime. OpenAPI interop is a lane, not a second source of truth.",
          },
          {
            type: "paragraph",
            text: "Shared models in multi-consumer APIs lie. A single static Zod object either over-constrains everyone or under-validates the callers who need strictness.",
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
              "Dedicated npm surface aimed at dynamic required-field overlays and OpenAPI/JSON Schema interop",
              "Validation stays TypeScript-first",
              "OpenAPI is an interoperability lane — generate or align contracts — not a second source of truth",
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
              "Consumer adapters: runtime required/optional overlays keyed by consumer or route context",
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
              "Adapter composes base + overlay",
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
              "Runtime composition is more flexible than codegen-per-partner and harder to exhaustively type than a closed Zod union",
              "Publishing as npm packages forces semver discipline; breaking overlay semantics is a major",
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
              "Unit tests lock overlay precedence, unknown-key policy, and missing-field errors",
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
