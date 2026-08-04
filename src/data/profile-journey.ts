/**
 * Curated GitHub profile overview journey for /profile.
 * Source of truth: src/data/p10ns11y_README.md (mirror of p10ns11y/p10ns11y).
 * Not a live API mirror of all public repos.
 */

export type ProfileLink = {
  label: string;
  href: string;
};

export type ProfileFeaturedProject = {
  slug: string;
  name: string;
  href: string;
  stack: string[];
  links?: ProfileLink[];
  /** One-line thesis for the project. */
  summary: string;
  /** Architecture / tech bullets — what the repo actually does. */
  highlights: string[];
  /** What a visitor can genuinely take away. */
  learn: string;
};

export type ProfileCookingItem = {
  name: string;
  href?: string;
  stack: string;
  /** One-line thesis — Featured summary role. */
  summary: string;
  /** Architecture / craft bullets. */
  highlights: string[];
  /** What to watch for as it cooks — Learn band. */
  watchFor: string;
};

export type ProfilePocItem = {
  name: string;
  href: string;
  stack: string;
  summary: string;
  highlights: string[];
  /** What the POC proves — Learn band. */
  proves: string;
  liveHref?: string;
};

export type ProfilePaperRow = {
  label: string;
  links: ProfileLink[];
  note?: string;
};

export type ProfileNpmPackage = {
  name: string;
  href: string;
  year: string;
};

export type ProfileOssItem = {
  name: string;
  detail: string;
  links: ProfileLink[];
};

export type ProfileArchiveSurface = {
  name: string;
  href: string;
  season: string;
  what: string;
};

export type ProfileArchiveSample = {
  surface: string;
  links: ProfileLink[];
};

export const profileJourney = {
  handle: "p10ns11y",
  githubUrl: "https://github.com/p10ns11y",
  name: "Peramanathan Sathyamoorthy",
  location: "Stockholm, Sweden",
  tagline: "Builder of useful things · open source tinkerer · LEARNING in rePUBLIC",
  githubBio:
    "With cosmic passion for coding and design, I crafted exclusive softwares, conquered legacy chaos, and exited triumphantly! Will be 👀ing new soon",
  intro:
    "I turn personal friction into public tools and dig into the why behind the libraries I use. Side experiments: @thecuriousts.",
  badges: [
    { label: "GitHub", href: "https://github.com/p10ns11y" },
    { label: "CV", href: "https://peramanathan-sathyamoorthy-cv.vercel.app/" },
    { label: "X", href: "https://x.com/peramanathan" },
    { label: "npm", href: "https://www.npmjs.com/~p10ns11y" },
    { label: "thecuriousts", href: "https://github.com/thecuriousts" },
    { label: "GitRoll", href: "https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33" },
    {
      label: "Grokipedia",
      href: "https://grokipedia.com/page/Peramanathan_Sathyamoorthy",
    },
    { label: "skills.sh", href: "https://skills.sh/p10ns11y/skills" },
  ] satisfies ProfileLink[],
  toc: [
    { label: "story", href: "#an-inch-at-a-time" },
    { label: "featured", href: "#featured" },
    { label: "cooking", href: "#cooking" },
    { label: "pocs", href: "#proof-of-concepts" },
    { label: "long arc", href: "#long-arc" },
    { label: "writing", href: "#writing-packages" },
    { label: "more", href: "#more" },
  ] satisfies ProfileLink[],
  story: {
    title: "An inch at a time",
    lead: "Featured and Cooking did not start as a spreadsheet of destinies. They grow the way real craft does: a spark on X, friction from another domain, a personal limit, a season of life you cannot negotiate away — then the need to make something so the constraint loses a little power. One thing triggers the next. Connections often show up after you move.",
    body: "That is not anti-planning. Once requirements are crystal clear, I plan deeper: which areas and projects need energy, what is time-sensitive now, what is long-term attention. Until then the field is chaotic by nature — prolonged, consistent effort is how chaos becomes harmony and work starts to feel almost effortless.",
    timelineLabel: "After Oneflow · Dec 2024",
    timeline: [
      {
        phase: "Start",
        html: "Prototype from AI course content · personal tech stack",
        links: [
          { label: "adaptate", href: "https://github.com/p10ns11y/adaptate" },
          { label: "ama-about-me", href: "https://github.com/p10ns11y/ama-about-me" },
          { label: "devprofile", href: "https://github.com/p10ns11y/devprofile" },
        ],
      },
      {
        phase: "Pause",
        html: "DAD duty · months of quiet",
        links: [],
      },
      {
        phase: "Stretch",
        html: "Engineering craft + systems thinking — the graph forming itself",
        links: [
          {
            label: "agent-prompt-tuning-lab",
            href: "https://github.com/p10ns11y/agent-prompt-tuning-lab",
          },
          { label: "elomaxz", href: "https://github.com/p10ns11y/elomaxz" },
          { label: "arch-machine", href: "https://github.com/p10ns11y/arch-machine" },
          { label: "thepulimaangani", href: "https://github.com/p10ns11y/thepulimaangani" },
        ],
      },
    ],
    quote:
      "A true master plan, to me, is only one thing: an interconnected, inter-related web of friction-removing automations aimed at impossible missions that great vision makes real. I strongly endorse the pioneering lead of Tesla and SpaceX on that path.",
  },
  featuredLead: "What’s unique · stack · why look it up. The chain above is how they arrived.",
  featured: [
    {
      slug: "collab-finder",
      name: "collab-finder",
      href: "https://github.com/p10ns11y/collab-finder",
      stack: ["Tauri v2", "Rust", "React", "TypeScript", "SQLite"],
      summary:
        "Agentic X opportunity finder — self-guarded reactor, not a job-board scraper. You intervene when guards fire, not on every step.",
      highlights: [
        "Tauri desktop: MVU React shell + 27 Rust invoke handlers (secrets, search, reactor, Quick Target)",
        "Credentials in Rust keyring/file — Bearer + xAI never live in UI state",
        "SQLite ledger for opportunities, search history, pause events; cost/fit/rate-limit guards stop thrashing",
        "Discover · Xplore · Settings; path toward MCP autonomy from today’s invoke bridge",
      ],
      learn:
        "How to productize agent loops with honest HITL: durable state, hard stop conditions, and credential boundaries that survive real use — transferable to production agent infra without claiming lab employment.",
    },
    {
      slug: "shellyxz.sh",
      name: "shellyxz.sh",
      href: "https://github.com/p10ns11y/shellyxz.sh",
      stack: ["zsh", "bash", "fish", "mise", "starship"],
      summary:
        "Portable multi-shell kernel — not a dotfiles dump. PATH contract, environment presets, Omarchy-friendly modern tooling.",
      highlights: [
        "One config story across zsh · bash · fish with shared conventions",
        "mise / starship / zoxide-class tooling wired as a product, not copy-paste aliases",
        "ab / av / at verification cockpit for reviewing agent work in the terminal",
        "Plugin boundaries so agent plugins extend CLIs without melting the shell",
      ],
      learn:
        "Terminal UX as product design for AI-era operators — portable contracts, plugin isolation, and a place to verify agent output before it becomes permanent.",
    },
    {
      slug: "arch-machine",
      name: "arch-machine",
      href: "https://github.com/p10ns11y/arch-machine",
      stack: ["Rust", "Shell", "Arch Linux", "YAML profiles"],
      links: [
        {
          label: "eye-comfort",
          href: "https://github.com/p10ns11y/arch-machine/tree/sentinel/modules/productivity/eye-comfort",
        },
      ],
      summary:
        "Profile-based Arch fortress steered by archy — thin install first, then ML/AI or security profiles. Evidence closes the loop; not a one-shot script.",
      highlights: [
        "archy control plane (Rust) steers shell backends; evidence logs suggest the next action",
        "YAML profiles: thin · minimal · ml-dev · security-dev; dry-run and inventory before mutate",
        "Self-audit / security-audit / package-actuate — installer as ongoing product",
        "eye-comfort: circadian phases from latitude plus place, culture, and season overlays",
      ],
      learn:
        "Systems product thinking: profile-driven installs, self-audit loops, and ergonomics (theming) treated as vision science + place — not aesthetic cosplay.",
    },
    {
      slug: "skills",
      name: "skills",
      href: "https://github.com/p10ns11y/skills",
      stack: ["Shell", "Python", "JavaScript", "Markdown"],
      links: [{ label: "skills.sh", href: "https://skills.sh/p10ns11y/skills" }],
      summary:
        "Skills extracted from real projects — orchestration, security, multi-agent work — not generic prompt packs.",
      highlights: [
        "Packaged for skills.sh distribution; each skill maps to lived workflow friction",
        "Covers concurrent multi-agent development, AI security, and complex orchestration",
        "High-signal packaging: when to load a skill, what it refuses, how to verify",
        "Copied from personal systems so the skill stays honest about scope",
      ],
      learn:
        "Treat agent skills as reusable engineering assets — extract from shipping work, name the refusal boundaries, prefer signal over chat trivia.",
    },
    {
      slug: "adaptate",
      name: "adaptate",
      href: "https://github.com/p10ns11y/adaptate",
      stack: ["TypeScript", "Zod", "OpenAPI", "pnpm"],
      links: [{ label: "npm", href: "https://www.npmjs.com/package/adaptate" }],
      summary:
        "One optional Zod model → per-consumer required fields at runtime, with OpenAPI interop. Static schemas stop where multi-tenant APIs start.",
      highlights: [
        "@adaptate/core — transformSchema + config: declare what each consumer requires",
        "@adaptate/utils — OpenAPI ↔ Zod, YAML $ref resolution",
        "Peer Zod ^3.25 || ^4; deepPartial-friendly single source of truth",
        "Monorepo with CI, coverage, Socket.dev supply-chain badge — library craft at package quality",
      ],
      learn:
        "Validation as a product API: avoid optional-everything vs duplicate schemas; one model, many consumer contracts, OpenAPI kept in the loop.",
    },
    {
      slug: "elomaxz",
      name: "elomaxz",
      href: "https://github.com/p10ns11y/elomaxz",
      stack: ["C", "MVU", "Cmd/Effect"],
      links: [
        { label: "on X", href: "https://x.com/Peramanathan/status/2060627340972151099" },
        { label: "premflow", href: "https://github.com/thecuriousts/premflow" },
      ],
      summary:
        "Elm-style hybrid MVU for C — tagged messages, pure update, first-class Cmd/Effect. Dogfooded by premflow, the daily-driver CLI.",
      highlights: [
        "ElomaxzProgram core: init / update / view + runners (CLI and message-source)",
        "Functional core + imperative shell — effects execute pacman, cp, systemctl-class work",
        "Composition foundation for actor-style machines without abandoning C",
        "Counter example + cheat-sheet docs; evolved from legacy elm-c",
      ],
      learn:
        "Functional architecture under systems constraints — predictable state in C, proven by a CLI you actually run every day (premflow).",
    },
    {
      slug: "agent-prompt-tuning-lab",
      name: "agent-prompt-tuning-lab",
      href: "https://github.com/p10ns11y/agent-prompt-tuning-lab",
      stack: ["JavaScript", "Cursor transcripts", "datasets"],
      summary:
        "Privacy-first harvest of your own Cursor agent transcripts → normalized datasets, skills, rules, and gold exemplars — without shipping chats to the cloud.",
      highlights: [
        "Ingest → normalize → split pipeline aimed at prompt-tuning and few-shot packs",
        "Emits skills, rules, and gold exemplars from real sessions you already ran",
        "Local-first: training material stays on the machine that produced the work",
        "Topics: agent-transcripts, dataset-generation, skills-extraction, prompt-engineering",
      ],
      learn:
        "Agent tooling as a data product — turn private transcripts into reusable evaluation assets while keeping locality and privacy as non-negotiables.",
    },
    {
      slug: "prototype-it-to-explain-itself",
      name: "prototype-it-to-explain-itself",
      href: "https://github.com/p10ns11y/prototype-it-to-explain-itself",
      stack: ["Python", "PyTorch", "LSTM", "ReAct"],
      links: [
        {
          label: "Live",
          href: "https://prototype-it-to-explain-itself.sathyam-peram.workers.dev/",
        },
      ],
      summary:
        "Smallest complete prototypes so the code teaches the idea — character-level LSTM (~150k params), temperature sampling, probability inspection, minimal ReAct agent.",
      highlights: [
        "Trainable next-token LSTM you can inspect and modify in an afternoon",
        "Temperature sampling + probability views — interpretability before scale",
        "Minimal ReAct loop: education, not production AI infra",
        "Live Workers demo for the “read the code / run the idea” loop",
      ],
      learn:
        "First-principles LLM mechanics without the cloud stack — if you cannot re-run and edit it, you have not explained it.",
    },
    {
      slug: "thepulimaangani",
      name: "thepulimaangani",
      href: "https://github.com/p10ns11y/thepulimaangani",
      stack: ["TanStack Start", "Rust", "WASM", "TypeScript"],
      links: [{ label: "Live", href: "https://seiyul-alagi.vercel.app/" }],
      summary:
        "Tamil prosody in the browser — classical grammar and poem metres with a Rust/WASM parser and modern React UI.",
      highlights: [
        "React (TanStack Start) + Rust WASM hot path for metre layers: syllable · foot · linkage · line · ornament",
        "wasm-pack build; Node 22 + pnpm; typecheck and tests match CI",
        "Domain software: Tamil classical prosody / grammar — rare in open source",
        "Vercel via Nitro Build Output API; ARCHITECTURE.md documents data flow",
      ],
      learn:
        "Cultural-computational product design — put the hard linguistic structure in WASM, keep the UI honest to the domain, ship a live surface reviewers can try.",
    },
    {
      slug: "devprofile",
      name: "devprofile",
      href: "https://github.com/p10ns11y/devprofile",
      stack: ["Next.js", "React", "TypeScript", "xAI"],
      links: [
        {
          label: "Live",
          href: "https://peramanathan-sathyamoorthy-cv.vercel.app/",
        },
      ],
      summary:
        "Portfolio as a live product — agent-oriented Q&A, document views, automated PDF CV. Presence engineered, not a static README clone.",
      highlights: [
        "Next.js App Router; profile Q&A grounded in curated persona / golden sources",
        "Interactive document viewing + automated PDF CV generation pipelines",
        "This viewport deck is the GitHub overview as Experience mode",
        "Fusion / fission agent skills and supply-chain hygiene as first-class craft",
      ],
      learn:
        "Personal brand as maintainable software — retrieval-backed answers, CV as build artifact, and restraint over dashboard cliché.",
    },
  ] satisfies ProfileFeaturedProject[],
  cookingLead:
    "Still under heat — and a little semi-planned: as more work can be delegated to agent systems, it helps to see overall progress without killing natural inception (spark → friction → next link).",
  cooking: [
    {
      name: "ensembly",
      href: "https://github.com/thecuriousts/ensembly",
      stack: "JS · Rust · WASM",
      summary: "Game of Peram — life as a playable system you authorize, not a black-box sim.",
      highlights: [
        "Beacons, HITL gates, and a local kernel keep agency with the human",
        "Body-world work stays yours — the game does not seize authorization",
        "JS · Rust · WASM stack under active heat",
      ],
      watchFor: "Progress without killing inception — spark → friction → next link.",
    },
    {
      name: "life-os",
      href: "https://github.com/p10ns11y/life-os",
      stack: "Markdown · Obsidian",
      summary: "Agentic vault for portfolio memory — Projects · Areas · schema · energy.",
      highlights: [
        "Obsidian/Markdown as the durable store, not a throwaway chat log",
        "Schema and energy labels so agents and humans share the same map",
        "Companion to ensembly — memory here, runtime there",
      ],
      watchFor: "Vault that stays auditable when agents start moving work.",
    },
    {
      name: "plugins",
      href: "https://github.com/p10ns11y/plugins",
      stack: "Markdown · Shell",
      summary: "Grok/agent plugins that coach real CLIs — premflow pomo and coach over live tools.",
      highlights: [
        "Plugins sit on top of CLIs you already trust",
        "Markdown + shell — thin glue, not another framework",
        "Dogfood path into daily-driver loops",
      ],
      watchFor: "Agent help that respects the tool you already open every day.",
    },
    {
      name: "premflow",
      href: "https://github.com/thecuriousts/premflow",
      stack: "C · elomaxz",
      summary: "Daily-driver CLI — notes, tasks, pomos — dogfood for MVU-in-C via elomaxz.",
      highlights: [
        "Ledger agents and humans actually share",
        "Grew from a tiny binary into structured update/Cmd/Effect",
        "Muscle-memory speed without flag soup",
      ],
      watchFor: "Protect deep-work windows in Dad mode without abandoning craft.",
    },
    {
      name: "Local-first AI & quiet automation",
      stack: "agents · device",
      summary: "Automation that respects device, attention, and data boundaries.",
      highlights: [
        "Locality first — what leaves the machine is a deliberate choice",
        "Quiet loops you can audit, not ambient always-on noise",
        "Same thesis spine as 2016 → 2026 orchestration under constraint",
      ],
      watchFor: "Progress you can inspect when the agent finishes a tick.",
    },
  ] satisfies ProfileCookingItem[],
  pocsLead:
    "Shipped to learn — live surfaces, not daily drivers. Useful when you want the idea under your fingers before productizing.",
  pocs: [
    {
      name: "v0-live-feed-app",
      href: "https://github.com/p10ns11y/v0-live-feed-app",
      stack: "TypeScript · v0",
      summary: "X “For You” re-imagined as a technical flow — live surface before productizing.",
      highlights: [
        "TypeScript · v0 for fast iteration on feed UX",
        "Data / ML can plug in from open x-algorithm later",
        "Shipped to learn — not a daily driver",
      ],
      proves: "Feel the feed idea under your fingers before betting a product on it.",
      liveHref: "https://v0-live-feed-app.vercel.app/",
    },
    {
      name: "selfie-sign-in-flow-using-v0-xAI",
      href: "https://github.com/p10ns11y/selfie-sign-in-flow-using-v0-xAI",
      stack: "TypeScript · AWS Rekognition · XState",
      summary: "Face auth end-to-end — enroll → train → login with selfie, not a mock.",
      highlights: [
        "XState owns the multi-angle enroll / train / login machine",
        "AWS Rekognition for real recognition, not a UI stub",
        "Complex UI that had to survive the full happy path",
      ],
      proves: "State machines + vision APIs can ship as a believable auth story.",
      liveHref: "https://v0-selfie-sign-in-process.vercel.app",
    },
  ] satisfies ProfilePocItem[],
  longArc: {
    lead: "Two habits that outlast any single project: orchestrate under constraint, and when the calendar slips, ship more than was asked — deeper work, not a thin late apology.",
    core: "An orchestrator that profiles, predicts, and acts under constraint — not “battery tips.” Same shape as today’s AI stack problem: where inference runs (cloud · edge · on-device NPU), what data leaves the machine, how agents spend energy and attention. Intelligence that respects cost and locality compounds; blanket centralization taxes humans.",
    thesisNote:
      "Why host a copy: DiVA full-text is often blocked off-campus (ISP / network policy). Prefer the hosted PDF when DiVA fails.",
    thesisPapers: [
      {
        label: "Thesis PDF (hosted)",
        links: [
          {
            label: "Full text",
            href: "https://peramanathan-sathyamoorthy-cv.vercel.app/pdfs/master-thesis.pdf",
          },
          {
            label: "devprofile#32",
            href: "https://github.com/p10ns11y/devprofile/pull/32",
          },
        ],
        note: "Enabling Energy-Efficient Data Communication with Participatory Sensing and Mobile Cloud",
      },
      {
        label: "Thesis · Uppsala DiVA",
        links: [
          {
            label: "Record",
            href: "http://uu.diva-portal.org/smash/record.jsf?pid=diva2:893525",
          },
          {
            label: "FULLTEXT01.pdf",
            href: "https://www.diva-portal.org/smash/get/diva2:897798/FULLTEXT01.pdf",
          },
        ],
      },
      {
        label: "IEEE",
        links: [
          {
            label: "Energy Efficiency as an Orchestration Service for Mobile Internet of Things",
            href: "https://ieeexplore.ieee.org/document/7396150",
          },
        ],
        note: "CloudCom 2015",
      },
      {
        label: "Wiley",
        links: [
          {
            label:
              "Profiling Energy Efficiency and Data Communications for Mobile Internet of Things",
            href: "https://onlinelibrary.wiley.com/doi/10.1155/2017/6562915",
          },
        ],
        note: "2017",
      },
      {
        label: "On X",
        links: [
          {
            label: "How I explained the long arc",
            href: "https://x.com/Peramanathan/status/2035707867844809074",
          },
        ],
      },
    ] satisfies ProfilePaperRow[],
    courseCraftNote:
      "Uppsala Machine Learning course (CMU-style project lineage). The assignment ran late — instead of a survey-only late submit, it was extended into real implementation and hands-on work (pair assignment; finished solo when the partner had no time). Same muscle as today: delay is not an excuse to shrink the outcome.",
    courseCraft: [
      {
        label: "Report PDF",
        links: [
          {
            label: "ML face-recognition report (2011)",
            href: "https://peramanathan-sathyamoorthy-cv.vercel.app/pdfs/ml_face_recognition_report_2011.pdf",
          },
        ],
      },
      {
        label: "On X",
        links: [
          {
            label: "Delayed work and shipping more than asked",
            href: "https://x.com/Peramanathan/status/2064993180328796667",
          },
        ],
      },
    ] satisfies ProfilePaperRow[],
  },
  writing: {
    articles: {
      label: "Articles on X",
      href: "https://x.com/Peramanathan/articles",
      detail:
        "culture, health, tech, policy; careful long-form when stakes feel real, not take-farming.",
    },
    books: [
      {
        label: "Rust from First Principles Companion",
        href: "https://github.com/thecuriousts/shelf-life/blob/writealive/coding/rust_from_first_principles_companion.pdf",
        detail: "language nuances, interconnectedness, non-linear learning (with Grok).",
        from: {
          label: "shelf-life",
          href: "https://github.com/thecuriousts/shelf-life",
        },
      },
    ],
    npmProfile: "https://www.npmjs.com/~p10ns11y",
    npm: [
      { name: "adaptate", href: "https://www.npmjs.com/package/adaptate", year: "2024" },
      {
        name: "@adaptate/core",
        href: "https://www.npmjs.com/package/@adaptate/core",
        year: "2024",
      },
      {
        name: "@adaptate/utils",
        href: "https://www.npmjs.com/package/@adaptate/utils",
        year: "2024",
      },
      { name: "@p10ns11y/hy", href: "https://www.npmjs.com/package/@p10ns11y/hy", year: "2021" },
      {
        name: "react-redux-quest",
        href: "https://www.npmjs.com/package/react-redux-quest",
        year: "2018",
      },
      {
        name: "babel-plugin-react-intl-messages-generator",
        href: "https://www.npmjs.com/package/babel-plugin-react-intl-messages-generator",
        year: "2017",
      },
    ] satisfies ProfileNpmPackage[],
  },
  openSource: [
    {
      name: "Zod",
      detail: "nullish chaining (2022)",
      links: [{ label: "PR #1702", href: "https://github.com/colinhacks/zod/pull/1702" }],
    },
    {
      name: "react-intl",
      detail: "babel-plugin-react-intl-messages-generator (2017)",
      links: [
        {
          label: "npm package",
          href: "https://www.npmjs.com/package/babel-plugin-react-intl-messages-generator",
        },
      ],
    },
    {
      name: "Kent C. Dodds' ecosystem",
      detail: "2020–2021",
      links: [
        { label: "bookshelf #116", href: "https://github.com/kentcdodds/bookshelf/pull/116" },
        { label: "bookshelf #184", href: "https://github.com/kentcdodds/bookshelf/pull/184" },
        {
          label: "testing-react-apps #39",
          href: "https://github.com/kentcdodds/testing-react-apps/pull/39",
        },
        {
          label: "testing-react-apps #42",
          href: "https://github.com/kentcdodds/testing-react-apps/pull/42",
        },
      ],
    },
    {
      name: "React Boilerplate",
      detail: "2016",
      links: [
        {
          label: "PR #1355",
          href: "https://github.com/react-boilerplate/react-boilerplate/pull/1355",
        },
        {
          label: "PR #1364",
          href: "https://github.com/react-boilerplate/react-boilerplate/pull/1364",
        },
        {
          label: "PR #1167",
          href: "https://github.com/react-boilerplate/react-boilerplate/pull/1167",
        },
      ],
    },
  ] satisfies ProfileOssItem[],
  connect: [
    { label: "@peramanathan", href: "https://x.com/peramanathan" },
    { label: "Articles", href: "https://x.com/Peramanathan/articles" },
    { label: "CV", href: "https://peramanathan-sathyamoorthy-cv.vercel.app/" },
    { label: "sathyam.peram@gmail.com", href: "mailto:sathyam.peram@gmail.com" },
  ] satisfies ProfileLink[],
  org: {
    name: "thecuriousts",
    href: "https://github.com/thecuriousts",
    role: "Side experiments organization",
  },
  archive: {
    lead: "Public writing and side sites that never left the map. Two seasons:",
    seasons: [
      "Uppsala University (academic · pre-professional) — Blogspot years with room to wander in public.",
      "Professional life — personal site + tech blog under a low time budget; neither quite became a habit. Honest archive, not a victory lap.",
    ],
    surfaces: [
      {
        name: "சிரவை பெரமு",
        href: "https://peramuwin.blogspot.com/",
        season: "Uppsala · ~2012–2021",
        what: "Tamil poetry & language craft",
      },
      {
        name: "Prem Sathya’s Tea Stall",
        href: "https://peramanathan.blogspot.com/",
        season: "Uppsala · 2011–2013",
        what: "English essays — algorithms, teaching, ergonomics",
      },
      {
        name: "On The Way",
        href: "https://prem-ontheway.blogspot.com/",
        season: "Uppsala · 2011",
        what: "Photo stops — Sweden & Tamil Nadu",
      },
      {
        name: "peramsathyam.fly.dev",
        href: "https://peramsathyam.fly.dev/",
        season: "Pro life · low bandwidth",
        what: "Personal site — craft + Tamil poems",
      },
      {
        name: "kingsparrow.space",
        href: "https://kingsparrow.space/",
        season: "Pro life · low bandwidth",
        what: "Sparse tech notes — domain may be reused later",
      },
    ] satisfies ProfileArchiveSurface[],
    samples: [
      {
        surface: "சிரவை பெரமு",
        links: [
          { label: "அகலா விளக்கு", href: "https://peramuwin.blogspot.com/2021/04/blog-post_4.html" },
          { label: "அவனும் அவளும்", href: "https://peramuwin.blogspot.com/2021/04/blog-post.html" },
          {
            label: "அடடே அன்பு மழை",
            href: "https://peramuwin.blogspot.com/2021/03/blog-post_5.html",
          },
          {
            label: "பணியிடை பனிநடை",
            href: "https://peramuwin.blogspot.com/2021/02/blog-post.html",
          },
        ],
      },
      {
        surface: "Tea Stall",
        links: [
          {
            label: "Fourier as warrior",
            href: "https://peramanathan.blogspot.com/2012/11/a-warrior-to-fourier-series.html",
          },
          {
            label: "Vedic binary mult",
            href: "https://peramanathan.blogspot.com/2012/03/binary-multiplication-can-we-do-it.html",
          },
          {
            label: "constraint programming",
            href: "https://peramanathan.blogspot.com/2011/09/problem-from-real-world.html",
          },
          {
            label: "ergonomics / RSI",
            href: "https://peramanathan.blogspot.com/2011/05/ergonomics-and-repetitive-strain.html",
          },
        ],
      },
      {
        surface: "On The Way",
        links: [
          {
            label: "Autumn in Uppsala",
            href: "https://prem-ontheway.blogspot.com/2011/06/autumn-in-uppsala.html",
          },
          {
            label: "Sunnersta Lake",
            href: "https://prem-ontheway.blogspot.com/2011/05/sunnersta-lake.html",
          },
          {
            label: "Mannargudi Temple",
            href: "https://prem-ontheway.blogspot.com/2011/05/mannargudi-temple.html",
          },
        ],
      },
    ] satisfies ProfileArchiveSample[],
  },
  footer: {
    quote: "He doesn’t need to predict the future. He’s been quietly preparing for it since 2016.",
    quoteAttribution: "Grok · April 2026",
    quoteHref: "https://github.com/p10ns11y/p10ns11y/blob/main/GROK_TESTIMONIAL.md",
    tagline: "Built in public · Always learning · An inch at a time",
  },
  nextLinks: [
    { href: "/?cv=view", label: "View CV" },
    { href: "/qa", label: "Ask about my work" },
    { href: "/certificates", label: "Certificates" },
    { href: "/status/code/200", label: "Live GitHub activity" },
    { href: "https://github.com/p10ns11y?tab=repositories", label: "All public repos on GitHub" },
    { href: "/#contact", label: "Contact" },
  ] satisfies ProfileLink[],
} as const;
