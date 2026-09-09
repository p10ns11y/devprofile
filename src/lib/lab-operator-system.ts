import { projectRepoUrl } from "@/lib/homepage-from-cvdata";

/** Evidenced operator-system graph — honest connections only, no invented projects. */
export type SystemNode = {
  id: string;
  label: string;
  role: string;
  href?: string;
};

export type SystemEdge = {
  from: string;
  to: string;
  label: string;
};

export const operatorThesis =
  "Limited budget and family constraints did not produce a pile of chat demos. They produced one operator system — memory, gates, and receipts that compound as the tools evolve.";

export const operatorNodes: SystemNode[] = [
  {
    id: "cvdata",
    label: "cvdata",
    role: "Single master record — site, PDFs, and apply packs read one file",
  },
  {
    id: "devprofile",
    label: "devprofile",
    role: "Public hire surface, grounded Q&A, CV as build artifact",
    href: projectRepoUrl("devprofile"),
  },
  {
    id: "collab-finder",
    label: "collab-finder",
    role: "Local Tauri apply cockpit — human promote before anything sticks",
    href: projectRepoUrl("collab-finder"),
  },
  {
    id: "ensembly",
    label: "ensembly",
    role: "Operator kernel under Grok Bot and Grok Build — HITL gates, T1 ledger, pulse-pack sync",
    href: projectRepoUrl("ensembly"),
  },
  {
    id: "life-os",
    label: "life-os",
    role: "Agentic vault — portfolio memory here, runtime in ensembly",
    href: "https://github.com/p10ns11y/life-os",
  },
];

export const operatorEdges: SystemEdge[] = [
  { from: "cvdata", to: "devprofile", label: "one source, no drift" },
  { from: "cvdata", to: "collab-finder", label: "role-fit packs" },
  { from: "life-os", to: "ensembly", label: "memory ↔ runtime" },
  { from: "ensembly", to: "collab-finder", label: "gates before promote" },
  { from: "ensembly", to: "devprofile", label: "agent skills + verify" },
];

export const manifestoBeats = [
  {
    id: "constraint",
    title: "Constraint",
    line: "Family care since December 2024 and a tight budget ruled out hosted chat toys. What shipped had to earn a daily slot.",
  },
  {
    id: "coherence",
    title: "Coherence",
    line: "cvdata, collab-finder, devprofile, ensembly, and life-os share gates and receipts — not separate demos with copied prompts.",
  },
  {
    id: "evolve",
    title: "Evolve",
    line: "Each layer is built to advance: pulse-pack sync, human promote, eval hooks. The graph gets clearer as models improve.",
  },
] as const;

export type TimelineEntry = {
  id: string;
  era: string;
  title: string;
  line: string;
  systems?: string[];
  href?: string;
};

export const compoundingTimeline: TimelineEntry[] = [
  {
    id: "eeaas",
    era: "2015–2016",
    title: "Orchestration thesis",
    line: "IEEE CloudCom: energy efficiency as a service — participatory sensing and context-aware policies before edge AI was obvious.",
    systems: ["EEaaS"],
  },
  {
    id: "oneflow",
    era: "2017–2024",
    title: "Production compound impact",
    line: "Oneflow: CRM embeds in HubSpot and Salesforce, in-place JS→TS (~70% fewer type errors), team lead with Playwright E2E.",
    systems: ["Oneflow"],
  },
  {
    id: "pause",
    era: "Dec 2024",
    title: "Family care",
    line: "Stepped back from employment. Shipped personal systems in the gaps — not lab employment, honest scope.",
  },
  {
    id: "collab",
    era: "Aug 2026",
    title: "collab-finder 1.0",
    line: "Local Tauri apply cockpit with cost, fit, and rate gates. Human promote before cvdata changes.",
    systems: ["collab-finder", "cvdata"],
    href: projectRepoUrl("collab-finder"),
  },
  {
    id: "devprofile",
    era: "2026",
    title: "devprofile live",
    line: "Hire surface with grounded Q&A and one cvdata file for site + PDFs.",
    systems: ["devprofile", "cvdata"],
    href: projectRepoUrl("devprofile"),
  },
  {
    id: "kernel",
    era: "Under heat",
    title: "ensembly + life-os",
    line: "Operator kernel under Grok Bot/Build; vault memory in life-os. Complementary layer, not a second chat OS.",
    systems: ["ensembly", "life-os", "pulse-pack"],
    href: projectRepoUrl("ensembly"),
  },
];

/** Proof cards framed as compounding systems, not chat demos. */
export const compoundProofs = [
  {
    n: 1,
    title: "Embed in other companies' tools",
    line: "Oneflow CRM clients inside HubSpot, Salesforce, Dynamics — permission models theirs, not a demo iframe.",
    tag: "Production",
  },
  {
    n: 2,
    title: "Control loop, not chat box",
    line: "collab-finder: cost, fit, rate limits, human promote. The prompt is the cheap part.",
    tag: "collab-finder",
    href: projectRepoUrl("collab-finder"),
  },
  {
    n: 3,
    title: "One record, many surfaces",
    line: "cvdata feeds devprofile and apply PDFs. Role-fit packs do not silently fork the master.",
    tag: "devprofile",
    href: projectRepoUrl("devprofile"),
  },
  {
    n: 4,
    title: "Kernel under the harness",
    line: "ensembly: HITL/HOOTL gates, T1 SQLite ledger, pulse-pack sync under Grok Bot and Grok Build.",
    tag: "ensembly",
    href: projectRepoUrl("ensembly"),
  },
  {
    n: 5,
    title: "Modernize in place",
    line: "Oneflow JS→TS with history-preserving script: ~70% fewer type errors, 200+ hours saved vs rewrite.",
    tag: "Oneflow",
  },
  {
    n: 6,
    title: "Below the web stack",
    line: "Rust/WASM metre parser in the browser; collab-finder as local Tauri + SQLite.",
    tag: "Depth",
    href: projectRepoUrl("thepulimaangani"),
  },
] as const;
