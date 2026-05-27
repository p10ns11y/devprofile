/**
 * Basic unit test scaffolding for src/lib/qa (PR 1 foundation).
 *
 * Uses Node built-in assert (no new test runner dep per "minimal" constraint).
 * This file type-checks cleanly and serves as the seed for PR2+ tests
 * (persona-compiler.test.ts, abuse-defense.test.ts, etc.).
 *
 * Run manually (once you have tsx or equivalent, or after future test setup):
 *   npx tsx __tests__/qa/types.test.ts
 *   # or: node --loader ts-node/esm __tests__/qa/types.test.ts
 *
 * For now it is exercised via `pnpm type-check` (the contract).
 * Later PRs can wire into package.json "test:unit" without touching this PR's scope.
 *
 * DO NOT import this at runtime in app code.
 */

import assert from "node:assert/strict";

// Import from the barrel (validates export surface + path alias)
import {
  type AbuseResult,
  NO_LOCAL_VECTORS_COMMENT,
  type PersonaTool,
  type ProfilePacket,
  QA_REACTOR_FLAG,
} from "@/lib/qa";

// Type-level smoke only (compile-time only; safe on any import)
const _examplePacket: ProfilePacket = {
  version: "v1-2026-05",
  compiledAt: new Date().toISOString(),
  coreIdentity: "Test identity",
  principles: ["simplification as moral act"],
  topAchievements: [{ title: "T1", narrative: "N1" }],
  experienceHighlights: [],
  signatureProjects: [],
  goldenExamples: [{ q: "Q?", a: "A." }],
  structuredSnapshot: { keyTechnologies: ["TypeScript"] },
  ingestDocument: "# Test\n\nIngest here.",
  toolSystemPrompt: "You are a helpful colleague.",
};

const _exampleAbuse: AbuseResult = {
  blocked: true,
  reason: "rate-limit",
  layer: "edge",
  goldenAnswer: "See my CV at /cv",
};

const _exampleTool: PersonaTool = {
  name: "testTool",
  description: "A test tool",
  parameters: {}, // would be z.object(...) in real usage
  execute: async () => "result",
};

/**
 * Runtime smoke tests (asserts + console). Safe to import the module for types only.
 * Call explicitly for manual execution:
 *   npx tsx __tests__/qa/types.test.ts
 * Or: if (process.env.NODE_ENV === 'test') runQaTypesSmokeTests();
 */
export function runQaTypesSmokeTests() {
  // Smoke: flag constant
  assert.equal(QA_REACTOR_FLAG, "qaReactor");

  // Smoke: comment contains the critical invariant (enforces review)
  assert.match(NO_LOCAL_VECTORS_COMMENT, /xAI Collections is the sole substrate/);
  assert.match(NO_LOCAL_VECTORS_COMMENT, /No local vectors in reactor path/);

  console.log("✅ qa types scaffolding smoke tests passed (assert + type surface)");
}

// Execute only when run directly (tsx / ts-node / node on compiled) — never on plain import
if (process.argv[1]?.endsWith("types.test.ts") || process.argv[1]?.endsWith("types.test.js")) {
  runQaTypesSmokeTests();
}
