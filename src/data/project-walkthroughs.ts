export const SHIPPED_INDEX_HREF = "/shipped" as const;

export type WalkthroughSectionId =
  | "product"
  | "architecture"
  | "components"
  | "data-flow"
  | "tradeoffs"
  | "testing-ops";

export type WalkthroughMermaidBlock = { type: "mermaid"; code: string };

/** Scannable product surface — keep body short; optional `example` for a concrete illustration. */
export type WalkthroughCard = {
  title: string;
  kicker: string;
  body: string;
  /** Concrete illustration: demo data, UI labels, or a format name. Not live metrics. Rendered with an "Example" label. */
  example?: string;
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
    slug: "collab-finder",
    title: "collab-finder — job hunt desktop app",
    lede: "Desktop app for high-fit job hunting at kanithanj.ai. You approve before anything hits your master CV or apply files. Hunt screens, pack checks, pipeline, local database. Not a chat app.",
    eyebrow: "Career · desktop app",
    audience:
      "Recruiters and engineers who want job-hunt screens, not another chat window.",
    outcomes: [
      "Evaluate roles, prepare, generate apply PDFs on your machine",
      "Check pack files without a terminal",
      "Track prep and post-apply outcomes",
      "Local database; credentials stay on the machine",
      "Named apply PDFs via the CV generate CLI (kanithanj.cv)",
    ],
    surfaces: [
      "Discover / Mission / Sweden / Xplore hunt screens",
      "Preferences — pack file checks",
      "Pipeline — hunt progress",
      "CV generate CLI (kanithanj.cv)",
      "Local database on this machine",
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
            text: "Desktop app for job hunting at kanithanj.ai. Screens check cost, fit, and rate. You approve before the master CV on the public portfolio site or apply files change. Not a chat app.",
          },
          {
            type: "cards",
            items: [
              {
                title: "Hunt loop",
                kicker: "What you do",
                body: "Open Discover, Mission, Sweden, or Xplore. Paste a job link or description in Quick Target. Evaluate fit, prepare notes, generate an apply CV, mark Applied. Reopen a saved row to load fit and prep from the local database without another model call.",
              },
              {
                title: "Pack file checks",
                kicker: "Shipped · Preferences",
                body: "Shows whether your pack files on disk are ready. Evaluate and Next 10 read those files. They are not built into the app. Missing files make Evaluate use placeholder text.",
                example:
                  "Pack status on Preferences. Not a live machine.",
              },
              {
                title: "Pipeline",
                kicker: "Shipped · Pipeline",
                body: "Tracks where each role stands before and after you apply. Applied rows stay visible even when Mission lists get long.",
                example:
                  "Fixed prep stages and outcome labels. No live counts.",
              },
              {
                title: "Local database",
                kicker: "Durable state",
                body: "Stores opportunities, prep, events, and history on this machine. Secrets stay in the OS keyring. No cloud sync. Local backup optional.",
              },
            ],
          },
          {
            type: "flow",
            steps: [
              "Find roles",
              "Evaluate and prepare",
              "Pack files on disk",
              "Generate apply CV (kanithanj.cv)",
              "Track outcome",
            ],
          },
          {
            type: "paragraph",
            text: "Job hunting spreads across tabs and chat logs. This app keeps a local record. Chat helps; screens do the work.",
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
  subgraph ground["Pack files"]
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
              "Tauri desktop shell (Rust + React): UI calls Rust for secrets and file work",
              "Local database (SQLite, WAL mode) holds opportunities, prep, events, and pipeline dates",
              "Master CV on the public portfolio site is never changed by apply — job edits merge when you generate a PDF",
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
            text: "Promote to the public site is a separate sync of the master CV. Apply PDFs come from packs; the portfolio PDF uses the master CV only.",
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
              "Pack health unit tests cover missing and placeholder identity files",
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
    lede: "Classical Tamil metre in the browser. Paste verse, get syllable splits and metre labels. No server required.",
    eyebrow: "Creative · metre",
    audience:
      "Students, scholars, and builders who need Tamil metre without calling a remote API.",
    outcomes: [
      "Syllable splits and metre labels in the browser",
      "Text stays on your machine — no remote API",
      "Rust parser you can reuse outside the web app",
      "Rule-based checker, not a general text model",
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
            text: "Classical Tamil rules drive the check, not a general text model. Paste verse, read labels in the browser. Nothing is uploaded for analysis.",
          },
          {
            type: "bullets",
            items: [
              "Paste Tamil verse. See syllable splits and metre labels.",
              "Classical rules run first.",
              "Nothing leaves your browser.",
            ],
          },
          {
            type: "paragraph",
            text: "Tamil classical metre (yāppu) is strict structure. Most tools skip it or lock it in desktop-only files.",
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
              "Rust parser compiles to WebAssembly (WASM) for the browser hot path",
              "React loads the module once and calls it for each analysis",
              "UI state stays in TypeScript; static hosting is enough for the demo",
              "Offline ML helpers stay out of the browser path; live analysis uses classical rules",
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
              "React UI: reading-first panels for verse and labels",
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
    lede: "One shared model, optional by default. Per-consumer rules set what is required at runtime. Docs and gateways use the same model. Uses Zod with OpenAPI / JSON Schema when consumers need different required fields.",
    eyebrow: "Systems · validation",
    audience:
      "API authors where Partner A requires fields Partner B must omit.",
    outcomes: [
      "One optional base model for all consumers",
      "Per-consumer rules at runtime",
      "Same model for code, docs, and gateways",
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
            text: "Every field starts optional. Per-consumer rules set what each caller must send. Docs and gateways read the same model. No second schema file.",
          },
          {
            type: "paragraph",
            text: "When Partner A needs fields Partner B skips, one static schema fails. It blocks everyone or checks too little.",
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
              "OpenAPI / JSON Schema bridges generate or align contracts from the same model",
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
  "collab-finder",
  "thepulimaangani",
  "adaptate",
] as const;

export type ShippedWalkthroughSlug = (typeof SHIPPED_WALKTHROUGH_SLUGS)[number];

export type ProjectWalkthroughSlug = ShippedWalkthroughSlug;

export function listProjectWalkthroughs(): readonly ProjectWalkthrough[] {
  const order = new Map(SHIPPED_WALKTHROUGH_SLUGS.map((slug, index) => [slug, index]));
  return PROJECT_WALKTHROUGHS.filter((project) => order.has(project.slug as ShippedWalkthroughSlug))
    .slice()
    .sort(
      (left, right) =>
        order.get(left.slug as ShippedWalkthroughSlug)! -
        order.get(right.slug as ShippedWalkthroughSlug)!
    );
}

export function getProjectWalkthrough(slug: string): ProjectWalkthrough | undefined {
  if (!(SHIPPED_WALKTHROUGH_SLUGS as readonly string[]).includes(slug)) {
    return undefined;
  }
  return PROJECT_WALKTHROUGHS.find((project) => project.slug === slug);
}

export function projectWalkthroughSlugs(): ShippedWalkthroughSlug[] {
  return [...SHIPPED_WALKTHROUGH_SLUGS];
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
