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
 * - persona-compiler.ts
 * - xai-collections.ts
 * - abuse-defense.ts
 * - golden-fallback.ts
 * - persona-tools.ts
 * - persona-reactor.ts (runProfileQA)
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

// Re-export core types (the only concrete artifact in PR 1)
// (sorted to satisfy biome organizeImports)
export type {
  AbuseConfig,
  AbuseResult,
  PersonaTool,
  PersonaToolRegistry,
  ProfilePacket,
} from "./types";

// PR 2: Persona Compiler (pure + packet generation)
export { compileProfilePacket, compileProfilePacketFromSources } from "./persona-compiler";
export type { ProfileSources } from "./persona-compiler"; // for pure-core callers (review #10; tests + future reactor)

// Placeholder comments for future modules (no files created in this PR to keep minimal)
// export { collectionsClient } from './xai-collections';
// export { checkAbuse } from './abuse-defense';
// export { runProfileQA } from './persona-reactor';

// Feature flag key for consumers (single source; avoids magic strings)
export const QA_REACTOR_FLAG = "qaReactor" as const;

// Boundary enforcement (dev-time signal; runtime checks live in reactor PR)
export const NO_LOCAL_VECTORS_COMMENT =
  "xAI Collections is the sole substrate. No local vectors in reactor path. See types.ts header.";
