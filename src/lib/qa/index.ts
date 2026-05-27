/**
 * Barrel export for the xAI Agentic Profile QA Reactor (lib/qa).
 *
 * PR 1 (Foundation) establishes:
 * - Clean import boundaries: all reactor code lives under src/lib/qa/
 * - Strict isolation: xAI Collections is the sole substrate.
 * - NO local vectors / embeddings / HF models in the main reactor path.
 *
 * Any future local/tiny model usage is confined to:
 *   - High-frequency question cache (narrow, isolated)
 *   - Most-frequently-asked fallback (non-retrieval)
 * These never touch persona retrieval or Collections ingest.
 *
 * The reactor behavior on the /qa page (introduced in PR #48) is controlled by the
 * ENABLE_XAI_REACTOR environment variable (see runProfileQA.ts).
 *
 * When enabled: full agentic path with xAI Collections, specialized tools, and defense layers.
 * When disabled (default): simple/legacy path for zero risk.
 *
 * Import pattern:
 *   import { ProfilePacket, checkAbuse, ... } from '@/lib/qa';
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md
 */

export type { PersonaToolName } from "./persona-tools";
// PR 5: 6 specialized Collections-backed tools + registry (validation-gated skeletons)
export {
  __TEST_ONLY_formatSearchResults,
  __TEST_ONLY_TOOL_PREFIXES__,
  aiPersonaTools,
  educationAndBackgroundTool,
  personaToolRegistry,
  personaTools,
  principlesAndPhilosophyTool,
  profileSearchTool,
  projectsTool,
  skillsTool,
  workExperienceTool,
} from "./persona-tools";
// Re-export core types (the only concrete artifact in PR 1)
// (sorted to satisfy biome organizeImports)
export type {
  AbuseConfig,
  AbuseResult,
  CollectionRef,
  IngestResult,
  PersonaTool,
  PersonaToolRegistry,
  ProfilePacket,
  SearchResult,
} from "./types";
// PR2/PR4/Q2 skeleton shims for PR6 validation-gate alignment (High Issues 1+2 closure).
// These are minimal TODO stubs only (see each file header). Full implementations live on
// sibling PR2/PR4 branches (plan: c53ba184, b59206f). In combined tree: delete shims
// and import real surface. This lets persona-reactor.ts + test import + tsc + run
// against *present* PR3 (xai-collections) + PR5 (persona-tools + aiPersonaTools) only.
// Barrel re-exports keep consumers able to `import { ... } from '@/lib/qa'`.
export { compileProfilePacketFromSources } from "./persona-compiler";
export { checkAbuse, computeGoldenFallback } from "./abuse-defense";
export { withLightweightRetry } from "./durable-retry";

// Real modules (PR3 present; PR1 types)
export {
  collectionsClient,
  XaiCollectionsApiError,
  XaiCollectionsConfigError,
  XaiCollectionsError,
  XaiCollectionsTimeoutError,
} from "./xai-collections";

// Future (PR6 public surface wired in PR7; PR4/PR2 real when merged):
// export { runProfileQA, runProfileQAReactor } from './persona-reactor';


// Kept for test compatibility. The actual toggle is now the ENABLE_XAI_REACTOR env var.
export const QA_REACTOR_FLAG = "qaReactor" as const;

// Boundary enforcement (dev-time signal; runtime checks live in reactor PR)
export const NO_LOCAL_VECTORS_COMMENT =
  "xAI Collections is the sole substrate. No local vectors in reactor path. See types.ts header.";
