/**
 * Full per-tool unit tests for the 6 specialized Collections-backed persona tools (PR 5).
 *
 * Uses ONLY Node built-in assert (matches xai-collections.test.ts + types.test.ts scaffolding;
 * zero new test runner / jest / vitest deps).
 *
 * Strategy:
 * - Mock ONLY collectionsClient.search (the sole dep of every tool). Never touches real
 *   network or requires real XAI_API_KEY.
 * - Tests both the ai `tool()` wrappers (via aiPersonaTools) and the PersonaToolRegistry
 *   shape (the one-shot registration surface for the future reactor).
 * - Happy paths, error propagation (XaiCollections* errors bubble), edge cases (empty query,
 *   empty results, citation formatting).
 * - Verifies query shaping / specialization prefixes reach the client (coherence driver).
 * - All 6 tools exercised individually + registry contract.
 *
 * Run (as documented for the qa/ suite):
 *   npx tsx __tests__/qa/persona-tools.test.ts
 *
 * DO NOT import at runtime in app code.
 *
 * This file + persona-tools.ts deliver the complete standalone testable module per PR5 design.
 * When validation completes, only descriptions + minor shaping will change; these tests
 * will continue to pass with zero or trivial updates.
 *
 * Test harness notes (PR1 scaffolding style):
 * - Direct singleton mutation of collectionsClient.search (with strict finally-restore) is
 *   intentional and matches xai-collections.test.ts exactly. Acceptable for sequential minimal
 *   harness; documented here as future parallel test risk if the suite evolves.
 */

import assert from "node:assert/strict";

// Import the full public surface from the barrel (validates exports + @/ alias + types)
import {
  // Test-only: direct access to pure citation/empty formatting helper
  __TEST_ONLY_formatSearchResults,
  // Test-only: exact prefixes (single source of truth, eliminates duplication + enables strong asserts)
  __TEST_ONLY_TOOL_PREFIXES__,
  aiPersonaTools,
  collectionsClient,
  type PersonaTool,
  type PersonaToolRegistry,
  personaToolRegistry,
  personaTools,
  XaiCollectionsConfigError,
} from "@/lib/qa";

// -----------------------------------------------------------------------------
// Mocking harness (client.search is the only seam; replace + restore per case)
// -----------------------------------------------------------------------------
type SearchCall = { query: string; opts?: { filters?: { collection_ids?: string[] }; k?: number } };

let searchCalls: SearchCall[] = [];

const originalSearch = collectionsClient.search;

function mockSearch(result: {
  chunks: Array<{ text: string; metadata?: any; score?: number }>;
  citations?: string[];
}) {
  searchCalls = [];
  collectionsClient.search = async (query: string, opts?: any) => {
    searchCalls.push({ query, opts });
    return result as any;
  };
}

function mockSearchThatThrows(error: Error) {
  searchCalls = [];
  collectionsClient.search = async (query: string, opts?: any) => {
    searchCalls.push({ query, opts });
    throw error;
  };
}

function restoreSearch() {
  collectionsClient.search = originalSearch;
  searchCalls = [];
}

// -----------------------------------------------------------------------------
// Smoke types (compile-time only)
// -----------------------------------------------------------------------------
const _registryCheck: PersonaToolRegistry = personaToolRegistry;
const _toolCheck: PersonaTool = personaToolRegistry.profileSearch;

// -----------------------------------------------------------------------------
// Runtime tests
// -----------------------------------------------------------------------------
export async function runPersonaToolsTests() {
  const origEnv = { ...process.env };
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`✅ ${name}`);
            passed++;
          })
          .catch((e) => {
            console.error(`❌ ${name}:`, e);
            failed++;
          });
      }
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}:`, e);
      failed++;
    }
  }

  // Always ensure a dummy key so any accidental non-mocked path blows up clearly (never real)
  process.env.XAI_API_KEY = "sk-test-dummy-for-persona-tools-tests-only";

  console.log("\n=== persona-tools (PR 5) test run (mocked collectionsClient only) ===\n");

  // --- Registry contract ---
  await test("personaToolRegistry has exactly the 6 expected keys", () => {
    const keys = Object.keys(personaToolRegistry).sort();
    assert.deepEqual(keys, [
      "educationAndBackground",
      "principlesAndPhilosophy",
      "profileSearch",
      "projects",
      "skills",
      "workExperience",
    ]);
    assert.equal(typeof personaToolRegistry.profileSearch.execute, "function");
  });

  await test("aiPersonaTools and personaTools export the 6 ai tools", () => {
    assert.ok(aiPersonaTools.profileSearch);
    assert.ok(personaTools.workExperienceTool);
    // Spot-check a couple more
    assert.ok(aiPersonaTools.principlesAndPhilosophy);
    assert.ok(personaTools.educationAndBackgroundTool);
  });

  // --- Individual tool happy paths (via registry personaTool.execute for direct testability) ---
  const toolNames = [
    "profileSearch",
    "workExperience",
    "skills",
    "projects",
    "educationAndBackground",
    "principlesAndPhilosophy",
  ] as const;

  for (const name of toolNames) {
    await test(`${name} happy path returns formatted chunks + citations`, async () => {
      mockSearch({
        chunks: [
          { text: `Grounded excerpt for ${name}`, score: 0.92 },
          { text: "Second relevant paragraph with impact details." },
        ],
        citations: ["collections://coll_abc/files/42", "collections://coll_abc/files/43"],
      });
      try {
        const out = await personaToolRegistry[name].execute({ query: "test query for " + name });
        assert.match(out, /Grounded excerpt/);
        assert.match(out, /\[1\]/);
        assert.match(out, /Citations: collections:\/\/coll_abc/);
        // Verify specialization prefix reached the client (the coherence mechanism)
        // Uses single source of truth from __TEST_ONLY_TOOL_PREFIXES__ (DRY + exact ^...$ for all 6).
        assert.ok(searchCalls.length >= 1);
        const expectedPrefix = __TEST_ONLY_TOOL_PREFIXES__[name];
        assert.match(searchCalls[0].query, new RegExp(`^${expectedPrefix}: `));
      } finally {
        restoreSearch();
      }
    });
  }

  // --- Query shaping + empty handling ---
  await test("profileSearch shapes query with prefix and handles empty results gracefully", async () => {
    mockSearch({ chunks: [], citations: [] });
    try {
      const out = await personaToolRegistry.profileSearch.execute({
        query: "career turning points",
      });
      assert.match(out, /No matching excerpts/);
      assert.equal(searchCalls.length, 1);
      assert.match(searchCalls[0].query, /^professional profile: career turning points$/);
    } finally {
      restoreSearch();
    }
  });

  await test("workExperience rejects empty query with helpful message (no client call)", async () => {
    // We don't even call search for empty (early return in execute)
    const out = await personaToolRegistry.workExperience.execute({ query: "   " });
    assert.match(out, /Please provide a specific, non-empty query/);
    assert.equal(searchCalls.length, 0); // never reached client
  });

  // --- Error propagation (client errors must surface; reactor will decide fallback) ---
  await test("skillsTool surfaces XaiCollectionsConfigError from client (e.g. missing key in real path)", async () => {
    const err = new XaiCollectionsConfigError("XAI_API_KEY is required (test)");
    mockSearchThatThrows(err);
    try {
      await assert.rejects(
        async () => personaToolRegistry.skills.execute({ query: "TypeScript patterns" }),
        /XAI_API_KEY is required/
      );
    } finally {
      restoreSearch();
    }
  });

  await test("projectsTool surfaces generic client errors", async () => {
    mockSearchThatThrows(new Error("network hiccup in test"));
    try {
      await assert.rejects(
        async () => personaToolRegistry.projects.execute({ query: "Zod PR" }),
        /network hiccup/
      );
    } finally {
      restoreSearch();
    }
  });

  // --- Citation + metadata formatting edge ---
  await test("principlesAndPhilosophy includes metadata and citations when present", async () => {
    mockSearch({
      chunks: [{ text: "Simplification is a moral act.", metadata: { source: "ps-profile-v1" } }],
      citations: ["collections://c1/f99"],
    });
    try {
      const out = await personaToolRegistry.principlesAndPhilosophy.execute({
        query: "why simplify",
      });
      assert.match(out, /Simplification is a moral act/);
      assert.match(out, /source/);
      assert.match(out, /Citations: collections:\/\/c1\/f99/);
    } finally {
      restoreSearch();
    }
  });

  // --- educationAndBackground specific (the one with most cultural/thesis signal) ---
  await test("educationAndBackgroundTool passes thesis-flavored queries through shaping", async () => {
    mockSearch({ chunks: [{ text: "EEaaS thesis core" }], citations: [] });
    try {
      const out = await personaToolRegistry.educationAndBackground.execute({
        query: "epic predictor thesis",
      });
      assert.match(out, /EEaaS thesis/);
      assert.match(searchCalls[0].query, /^education background thesis: epic predictor thesis$/);
    } finally {
      restoreSearch();
    }
  });

  // --- Registry can be iterated for reactor (one-shot registration) ---
  await test("personaToolRegistry is iterable and every entry has name + execute", () => {
    const entries = Object.entries(personaToolRegistry);
    assert.equal(entries.length, 6);
    for (const [key, t] of entries) {
      assert.equal(t.name, key);
      assert.equal(typeof t.execute, "function");
      assert.ok(t.description.length > 40, `description for ${key} should be rich`);
    }
  });

  // --- Direct tests for pure helpers (formatSearchResults) — isolated coverage of citation/empty logic ---
  await test("formatSearchResults handles empty chunks gracefully (pure helper, direct)", () => {
    const out = __TEST_ONLY_formatSearchResults({ chunks: [], citations: [] } as any);
    assert.match(out, /No matching excerpts/);
  });

  await test("formatSearchResults includes metadata + citations when present (pure helper, direct)", () => {
    const out = __TEST_ONLY_formatSearchResults({
      chunks: [{ text: "foo bar", metadata: { section: "Experience" }, score: 0.87 }],
      citations: ["collections://c/f1"],
    } as any);
    assert.match(out, /foo bar/);
    assert.match(out, /section/);
    assert.match(out, /Citations: collections:\/\/c\/f1/);
  });

  // --- ai tool surface sanity (they are real ai.tool() objects consumable by streamText) ---
  await test("aiPersonaTools entries are valid tool objects (have description)", () => {
    for (const [key, t] of Object.entries(aiPersonaTools)) {
      assert.ok((t as any).description, `${key} aiTool missing description`);
      // parameters exist on the tool definition for zod
      assert.ok((t as any).parameters || (t as any).inputSchema, `${key} aiTool missing schema`);
    }
  });

  // Teardown
  restoreSearch();
  process.env.XAI_API_KEY = origEnv.XAI_API_KEY;
  delete process.env.XAI_API_KEY; // clean if it wasn't present

  console.log(`\n=== persona-tools tests complete: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    throw new Error(`${failed} persona-tools tests failed`);
  }
}

// Auto-run when invoked directly (npx tsx __tests__/qa/persona-tools.test.ts)
if (
  process.argv[1]?.endsWith("persona-tools.test.ts") ||
  process.argv[1]?.endsWith("persona-tools.test.js")
) {
  runPersonaToolsTests().catch((e) => {
    console.error("Fatal test failure:", e);
    process.exit(1);
  });
}
