export const PROJECTS_INDEX_HREF = "/projects" as const;

export type WalkthroughSectionId =
  | "product"
  | "architecture"
  | "components"
  | "data-flow"
  | "tradeoffs"
  | "testing-ops";

export type WalkthroughBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: readonly string[] }
  | { type: "callout"; text: string }
  | { type: "flow"; steps: readonly string[] };

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
    slug: "collab-finder",
    title: "collab-finder — local apply cockpit",
    lede:
      "A Tauri desktop reactor for high-fit roles: live search, fit prep, SQLite history, and human promote before anything becomes permanent. Shipped as kanithanj.ai 1.0.0.",
    eyebrow: "Career · agentic reactor",
    audience: "Operators who hunt high-fit roles and refuse silent CV or pack mutations.",
    outcomes: [
      "Live search and fit prep stay on the machine",
      "SQLite ledger for opportunities, prep, and exports",
      "Human promote before master CV or submit artifacts change",
      "Named apply PDFs via kanithanj.cv overlays",
    ],
    surfaces: [
      "Desktop shell (Tauri 2 + React)",
      "Local pack folders with company-title-date slugs",
      "kanithanj.cv CLI for PDF generate and cvdata sync",
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
            type: "paragraph",
            text: "Job hunting fragments into tabs, notes, chat logs, and half-finished CVs. Agents make that worse when they thrash: burn tokens, hit rate limits, and rewrite the same pack without a ledger.",
          },
          {
            type: "bullets",
            items: [
              "Cost, fit, and rate gates live next to the work",
              "A human promote is required before permanence",
              "The prompt is cheap; changing master data is expensive",
            ],
          },
          {
            type: "callout",
            text: "Local-first apply loop. Credentials and history stay on the machine. Multi-device sync is not the product.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Tauri 2 shell: React/TypeScript UI talks to a Rust core over a narrow command surface",
              "Secrets and pause guards stay in Rust so the UI cannot casually export credentials",
              "SQLite is the durable ledger for opportunities, prep runs, and export history",
              "Master cvdata in the public portfolio is never mutated by the apply path — overlays merge at generate time",
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
              "Search and fit prep: live X search plus model-assisted fit notes, bounded by rate and cost guards",
              "Pack export: manifest.json, cv-overlay.json, and a submit/ folder with the named PDF",
              "kanithanj.cv: lists packs, generates {name}-{role}-{id}.pdf, syncs a user-local copy of master cvdata",
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
              "Prep artifacts",
              "Human review",
              "Export pack / generate apply CV",
              "Overlay + PDF under the pack slug",
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
              "Overlay merge behavior is covered in the portfolio repo so PDF featured projects stay deterministic",
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
    lede:
      "Classical Tamil prosody as a cultural-computational product: a Rust metre parser compiled to WASM, wrapped in a React UI, with no backend required for analysis.",
    eyebrow: "Creative · metre",
    audience: "Scholars, students, and builders who need classical Tamil metre without a remote NLP API.",
    outcomes: [
      "Segmentation and metre labels in the browser",
      "No analysis backend or text shipped to a remote NLP API",
      "Deterministic Rust core reusable outside the web shell",
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
    lede:
      "A ground-up npm validator: one optional Zod model, per-consumer required fields at runtime, and OpenAPI interop — for APIs where static schemas stop at the multi-tenant edge.",
    eyebrow: "Systems · validation",
    audience: "API authors with multi-consumer contracts where Partner A requires fields Partner B must omit.",
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
            type: "paragraph",
            text: "Shared models in multi-consumer APIs lie. A single static Zod object either over-constrains everyone or under-validates the callers who need strictness.",
          },
          {
            type: "callout",
            text: "Start from one optional base model, then attach per-consumer contracts at runtime without duplicating the schema tree.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
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
  {
    slug: "agent-prompt-tuning-lab",
    title: "agent-prompt-tuning-lab — local transcript → eval assets",
    lede:
      "Privacy-first toolkit that turns your own agent transcripts into datasets, skills, and gold exemplars — training material without shipping chats to the cloud.",
    eyebrow: "Learning · agentic reactor",
    audience: "Builders who want eval assets and skill stubs from their own agent logs without vendor upload.",
    outcomes: [
      "Local ingest of heterogeneous agent transcripts",
      "Datasets, skill scaffolds, and gold exemplars on disk",
      "No default path to a remote training API",
    ],
    surfaces: [
      "CLI / pipeline over local transcript directories",
      "Export packs: JSON/JSONL, skill markdown, exemplar sets",
      "Git-reviewed promote into skills or eval repos",
    ],
    tech: ["JavaScript", "Datasets", "Prompt engineering"],
    cvdataKey: "agent-prompt-tuning-lab",
    repoUrl: "https://github.com/p10ns11y/agent-prompt-tuning-lab",
    sections: [
      {
        id: "product",
        title: "Product",
        band: "product",
        blocks: [
          {
            type: "paragraph",
            text: "Agent work produces the best fine-tuning and eval material you will ever own — and then it dies in scrollback. Uploading those transcripts to a vendor for auto skill extraction leaks private context.",
          },
          {
            type: "callout",
            text: "Keep harvest local: transcripts in, structured datasets and gold exemplars out, under your filesystem permissions.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        band: "tech",
        blocks: [
          {
            type: "bullets",
            items: [
              "Pipeline, not chat UI",
              "Ingest parsers normalize heterogeneous agent logs; filters drop secrets and noise",
              "Exporters emit datasets, skill stubs, and gold pairs for offline eval",
              "Pairs with skills repos and portfolio Q&A that want curated exemplars, not raw dumps",
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
              "Ingest: load local transcript formats into a common turn/tool record",
              "Curate: label or select gold spans — successful tool traces, crisp refusals, high-signal prompts",
              "Export: JSON/JSONL datasets, skill markdown scaffolds, exemplar packs",
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
              "Local transcript files",
              "Normalize",
              "Redact / filter",
              "Human or heuristic curation",
              "Export artifacts under a project directory",
            ],
          },
          {
            type: "paragraph",
            text: "Nothing in the default path calls a remote training API. If you later fine-tune, you choose the egress deliberately.",
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
              "Local-first means you own disk layout and backups; there is no hosted labeling UI for free",
              "Heuristic curation is fast and imperfect; gold that gates production prompts still needs a human pass",
              "JavaScript keeps the toolkit easy to run next to Node agent stacks; it is not a GPU training framework",
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
              "Fixture transcripts prove parsers stay stable when log formats drift",
              "Export smoke tests assert schema shape for downstream eval",
              "Run against a known directory, review export diffs in git, promote only what you trust",
            ],
          },
        ],
      },
    ],
  },
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
