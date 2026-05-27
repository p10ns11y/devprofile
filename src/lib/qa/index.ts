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
 * Subsequent PRs add (behind qaReactor flag, disabled by default):
 * - persona-compiler.ts (PR2; stub present for PR6 skeleton alignment)
 * - xai-collections.ts (PR3; real)
 * - abuse-defense.ts (PR4; stub present for PR6)
 * - persona-tools.ts (PR5; real)
 * - persona-reactor.ts (PR6; real) + runProfileQA.ts
 * - durable-retry lightweight (Q2 shim present for PR6)
 *
 * Import pattern (future):
 *   import { ProfilePacket, checkAbuse, ... } from '@/lib/qa';
 *
 * Legacy reactor (src/utils/qa-utils.ts + /api/cv/qa/route.ts) remains untouched
 * until PR7 dual-path wiring. This preserves instant fallback.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md
 * @see src/config/feature-flags.ts (qaReactor)
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


// Feature flag key for consumers (single source; avoids magic strings)
export const QA_REACTOR_FLAG = "qaReactor" as const;

// Boundary enforcement (dev-time signal; runtime checks live in reactor PR)
export const NO_LOCAL_VECTORS_COMMENT =
  "xAI Collections is the sole substrate. No local vectors in reactor path. See types.ts header.";
