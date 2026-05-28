/**
 * persona-compiler.ts — PR2 STUB (sibling branch / validation skeleton shim)
 *
 * Full implementation of compileProfilePacketFromSources (5-source fusion from
 * cvdata.json + golden-qa.md + casual-qa.md + top-three-achievements.md +
 * src/data/persona/ps-profile-v1.md (consolidated location) + rich ProfilePacket construction
 * lives on the PR2 branch (c53ba184 per plan JSON).
 *
 * This minimal barrel shim closes the import/contract gap (High Issue 1) so the
 * PR6 skeleton (persona-reactor.ts + runProfileQA.ts + test) can import,
 * type-check, and run against the *present* PR3 (xai-collections) + PR5
 * (persona-tools) modules in this worktree.
 *
 * In the combined full tree (after PR2 lands), remove this file and import the
 * real from the merged surface. Do not duplicate real compiler logic here.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR2, ProfilePacket)
 * @see src/lib/qa/types.ts (exact ProfilePacket contract + Q1-Q6 invariants)
 * @see src/lib/qa/index.ts (barrel re-export of this stub for consumers)
 */

// Re-export the core type (defined in PR1 types; compiler produces instances of it)
export type { ProfilePacket } from "./types";

import type { ProfilePacket } from "./types";

/**
 * Stub — produces a minimal valid ProfilePacket so cold-start paths in
 * getOrLoadProfilePacket and direct RUN_TESTS_DIRECTLY do not crash before
 * test mocks or real PR2 take over.
 *
 * Real PR2 impl performs the actual fission load + fusion of the 5 sources
 * (with Q6 tone injection into toolSystemPrompt + goldenExamples).
 */
export function compileProfilePacketFromSources(
  rawSources: Array<{ name: string; content: string }>
): ProfilePacket {
  // PR2 stub surface only; real returns richer fused packet
  // (coreIdentity, principles, experienceHighlights, ingestDocument etc. populated from sources)
  return {
    version: "v1-2026-05-stub",
    compiledAt: new Date().toISOString(),
    coreIdentity:
      "Stub persona core (full PR2 fusion of cvdata + persona MDs in sibling/merged tree)",
    principles: ["Premflow / EEaaS (stub)", "Dad-mode realism (stub)"],
    topAchievements: [],
    experienceHighlights: [],
    signatureProjects: [],
    goldenExamples: [
      { q: "Why does premflow still matter?", a: "It starts before I finish the thought..." },
    ],
    structuredSnapshot: {},
    ingestDocument:
      (rawSources || [])
        .map((s) => `# ${s.name}\n${s.content || "(missing in skeleton)"} `)
        .join("\n\n---\n\n") || "# Stub ingest document (PR2 supplies real in full tree)",
    toolSystemPrompt:
      "You are Peramanathan Sathyamoorthy answering in first person (stub). Use the provided tools (Collections-backed) for every factual detail. Warm, professional, with light sparkle per Q6.",
  };
}
