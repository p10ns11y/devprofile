export const PROJECTS_INDEX_HREF = "/projects" as const;

export type WalkthroughSectionId =
  | "problem"
  | "architecture"
  | "components"
  | "data-flow"
  | "tradeoffs"
  | "testing-ops";

export type WalkthroughSection = {
  id: WalkthroughSectionId;
  title: string;
  paragraphs: readonly string[];
};

export type ProjectWalkthrough = {
  slug: string;
  title: string;
  lede: string;
  eyebrow: string;
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
    tech: ["Tauri", "Rust", "React", "TypeScript", "SQLite"],
    cvdataKey: "collab-finder",
    repoUrl: "https://github.com/p10ns11y/collab-finder",
    liveUrl: "https://kanithanj.ai",
    sections: [
      {
        id: "problem",
        title: "Problem",
        paragraphs: [
          "Job hunting fragments into tabs, notes, chat logs, and half-finished CVs. Agents make that worse when they thrash: burn tokens, hit rate limits, and rewrite the same pack without a ledger.",
          "collab-finder treats the hunt as an operator loop. Cost, fit, and rate gates live next to the work. A human promote is required before master CV data or submit artifacts change. The prompt is the cheap part; permanence is expensive.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        paragraphs: [
          "The shell is Tauri 2: a React/TypeScript UI talks to a Rust core over a narrow command surface. Secrets and pause guards stay in Rust so the frontend cannot casually export credentials or bypass stop conditions.",
          "SQLite is the durable ledger for opportunities, prep runs, and export history. Application packs land under a local data directory with meaningful slugs (company-title-date), not anonymous opp_N folders.",
          "Apply PDFs are produced by the kanithanj.cv CLI from pack overlays. Master cvdata in the public portfolio is never mutated by the apply path — overlays merge at generate time.",
        ],
      },
      {
        id: "components",
        title: "Key components",
        paragraphs: [
          "Search and fit prep: live X search plus model-assisted fit notes, bounded by rate and cost guards so agents pause instead of spinning.",
          "Pack export: manifest.json, cv-overlay.json (featured_keys, projects_upsert, overrides), and a submit/ folder with the named PDF.",
          "kanithanj.cv: installable CLI that lists packs, generates {name}-{role}-{id}.pdf, and syncs a user-local copy of master cvdata without writing the portfolio repo.",
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        paragraphs: [
          "Opportunity in → ledger row → prep artifacts → human review → Export pack / Generate apply CV → overlay + PDF under the pack slug.",
          "Promote to the public site is a separate, deliberate sync of master cvdata. Dynamic web apply CVs from packs remain deferred until shared storage exists; the portfolio PDF path stays master-only.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        paragraphs: [
          "Local-first beats a hosted hunt SaaS: credentials and history stay on the machine, but multi-device sync is not the product.",
          "HITL promote slows automation and prevents silent CV corruption. That friction is intentional.",
          "Desktop (Tauri) adds Rust surface area versus a pure web app; the payoff is OS keychain boundaries and a real offline ledger.",
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        paragraphs: [
          "CI quality gates ship with the 1.0.0 cut. Overlay merge behavior is covered in the portfolio repo (cv-overlay tests) so PDF featured projects stay deterministic.",
          "Ops stay boring: local SQLite, pack folders under ~/.local/share/collab-finder, CLI sync for cvdata. No cloud agent runtime in the critical path.",
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
    tech: ["Rust", "WASM", "TypeScript", "React"],
    cvdataKey: "thepulimaangani",
    repoUrl: "https://github.com/p10ns11y/thepulimaangani",
    liveUrl: "https://seiyul-alagi.vercel.app/",
    sections: [
      {
        id: "problem",
        title: "Problem",
        paragraphs: [
          "Tamil classical metre (yāppu) is precise linguistic structure — not a vibe check. Most poetry tools either ignore prosody or bury it in desktop corpora that do not travel with the reader.",
          "thepulimaangani puts segmentation and metre analysis in the browser so scholars, students, and builders can inspect structure without standing up a server or shipping text to a remote NLP API.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        paragraphs: [
          "The hot path is Rust: parser and prosody rules compile to WebAssembly. The React app loads the WASM module once and calls into it for analysis, keeping UI state in TypeScript.",
          "There is no analysis backend. Static hosting (Vercel demo) is enough. That forces the linguistic core to be deterministic and portable — the same crate can be reused outside the web shell later.",
        ],
      },
      {
        id: "components",
        title: "Key components",
        paragraphs: [
          "Rust metre crate: tokenization, syllable / acai structure, and metre classification against classical patterns.",
          "WASM bridge: typed exports the UI can call without reimplementing grammar in JavaScript.",
          "React UI: editor or paste surface, result panels for segmentation and metre labels, designed for reading — not a developer console dump.",
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        paragraphs: [
          "User text → React state → WASM parse → structured result → render. No network round-trip for the core path.",
          "Optional future paths (corpora, saved sessions) stay outside the parser boundary so the linguistic core remains a pure function of input text.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        paragraphs: [
          "WASM payload size versus server-side NLP: first load costs bytes; every later analysis is free and private.",
          "Encoding classical rules in Rust is slower than a heuristic JS port, but correctness and reuse across CLI/desktop later outweigh the one-time compile complexity.",
          "Browser-only demo limits heavy corpus jobs; that is acceptable for an interactive reading tool.",
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        paragraphs: [
          "Parser fixtures against known metre examples catch regressions when rules change. UI smoke covers load-WASM and round-trip display.",
          "Deploy is static: build WASM + frontend, ship to the host. No database or model endpoint to babysit.",
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
    tech: ["TypeScript", "Zod", "OpenAPI", "JSON Schema", "Node.js"],
    cvdataKey: "adaptate",
    repoUrl: "https://github.com/p10ns11y/adaptate",
    npmUrl: "https://www.npmjs.com/package/adaptate",
    sections: [
      {
        id: "problem",
        title: "Problem",
        paragraphs: [
          "Shared models in multi-consumer APIs lie. Partner A requires fields Partner B must omit. A single static Zod object either over-constrains everyone or under-validates the callers who need strictness.",
          "Adaptate treats adaptability as the product: start from one optional base model, then attach per-consumer contracts at runtime without duplicating the entire schema tree.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        paragraphs: [
          "Different architecture from the Oneflow Zod library work: Adaptate is a dedicated npm surface (@adaptate/core, utils, and the adaptate package) aimed at dynamic required-field overlays and OpenAPI/JSON Schema interop.",
          "Validation remains TypeScript-first. OpenAPI is an interoperability lane — generate or align contracts — not a second source of truth that drifts from the runtime checks.",
        ],
      },
      {
        id: "components",
        title: "Key components",
        paragraphs: [
          "Base model: fields optional by default so the shared shape stays honest.",
          "Consumer adapters: runtime required/optional overlays keyed by consumer or route context.",
          "Interop helpers: bridges toward OpenAPI / JSON Schema so docs and gateways can reflect the same constraints the Node process enforces.",
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        paragraphs: [
          "Request context selects a consumer contract → adapter composes base + overlay → parse/validate payload → typed result or structured error.",
          "Failed validation stays local to the request. Schema authorship stays in code review, not in a detached CMS of JSON files.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        paragraphs: [
          "Runtime composition is more flexible than codegen-per-partner and harder to exhaustively type than a closed Zod union of every consumer.",
          "Publishing as npm packages forces semver discipline; breaking overlay semantics is a major, not a quiet patch.",
          "OpenAPI interop will always lag exotic Zod refinements — document the subset you promise, do not claim total isomorphism.",
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        paragraphs: [
          "Unit tests lock overlay precedence: required beats optional, unknown keys policy, and error paths for missing consumer fields.",
          "Package publish is the release train. Consumers pin versions; no hosted service. CI runs type-check and the validation matrix before npm.",
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
    tech: ["JavaScript", "Datasets", "Prompt engineering"],
    cvdataKey: "agent-prompt-tuning-lab",
    repoUrl: "https://github.com/p10ns11y/agent-prompt-tuning-lab",
    sections: [
      {
        id: "problem",
        title: "Problem",
        paragraphs: [
          "Agent work produces the best fine-tuning and eval material you will ever own — and then it dies in scrollback. Uploading those transcripts to a vendor for “auto skill extraction” leaks private context.",
          "The lab keeps harvest local: transcripts in, structured datasets and gold exemplars out, under your filesystem permissions.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        paragraphs: [
          "Pipeline, not chat UI. Ingest parsers normalize heterogeneous agent logs; filters drop secrets and noise; exporters emit datasets, skill stubs, and gold pairs suitable for offline eval.",
          "The design pairs with the wider stack: skills repos and portfolio Q&A want curated exemplars, not raw dumps. Archive is storage; this lab is the admissions filter into reusable assets.",
        ],
      },
      {
        id: "components",
        title: "Key components",
        paragraphs: [
          "Ingest: load local transcript formats into a common turn/tool record.",
          "Curate: label or select gold spans — successful tool traces, crisp refusals, high-signal prompts.",
          "Export: JSON/JSONL datasets, skill markdown scaffolds, and exemplar packs ready for eval harnesses.",
        ],
      },
      {
        id: "data-flow",
        title: "Data flow",
        paragraphs: [
          "Local transcript files → normalize → redact/filter → human or heuristic curation → export artifacts under a project directory.",
          "Nothing in the default path calls a remote training API. If you later fine-tune, you choose the egress deliberately.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Tradeoffs",
        paragraphs: [
          "Local-first means you own ops (disk layout, backups) and you do not get a hosted labeling UI for free.",
          "Heuristic curation is fast and imperfect; gold quality still needs a human pass for anything that gates production prompts.",
          "JavaScript keeps the toolkit easy to run next to Node agent stacks; it is not a GPU training framework.",
        ],
      },
      {
        id: "testing-ops",
        title: "Testing and ops",
        paragraphs: [
          "Fixture transcripts prove parsers stay stable when log formats drift. Export smoke tests assert schema shape for downstream eval.",
          "Ops: run against a known directory, review diffs of exported skills/datasets in git, promote only what you trust into the skills or eval repos.",
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
