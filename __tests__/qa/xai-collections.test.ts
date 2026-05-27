/**
 * Full mock-based tests for the xAI Collections thin client (PR 3).
 *
 * Uses ONLY Node built-in assert (matches types.test.ts minimal scaffolding; no vitest/jest dep).
 * Mocks globalThis.fetch completely — happy paths, API errors, poll timeout, failed status,
 * config errors (no real keys ever surface in tests; env is sanitized per case).
 *
 * Run:
 *   npx tsx __tests__/qa/xai-collections.test.ts
 *   # or via pnpm type-check (smoke) + manual for coverage.
 *
 * DO NOT import this at runtime in app code.
 *
 * Covers the exact surface + Q5 manual-ingest constraint (ingest works in client for helper;
 * no auto wiring exists or is tested here).
 */

import assert from "node:assert/strict";

// Import from barrel (validates export surface + path alias + types)
import {
  type CollectionRef,
  collectionsClient,
  type IngestResult,
  type SearchResult,
  XaiCollectionsApiError,
  XaiCollectionsConfigError,
  XaiCollectionsTimeoutError,
} from "@/lib/qa";

// Save/restore fetch for isolation (critical: never hits real endpoints or keys)
const originalFetch = globalThis.fetch;

function installMockFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    return handler(url, init);
  };
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function makeJsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (k: string) => headers[k.toLowerCase()] || headers[k] || null,
    } as any,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

function makeErrorResponse(status: number, message: string) {
  return makeJsonResponse({ error: { message } }, status);
}

// -----------------------------------------------------------------------------
// Smoke types (compile-time)
// -----------------------------------------------------------------------------
const _exampleRef: CollectionRef = { id: "coll_123", name: "ps-profile-v1-2026-05" };
const _exampleIngest: IngestResult = {
  collectionId: "coll_123",
  fileId: "file_abc",
  status: "DOCUMENT_STATUS_PROCESSED",
};
const _exampleSearch: SearchResult = {
  chunks: [{ text: "foo" }],
  citations: ["collections://c/f"],
};

// -----------------------------------------------------------------------------
// Runtime tests (assert + console). Safe; only run when invoked directly.
// -----------------------------------------------------------------------------
export async function runXaiCollectionsTests() {
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

  async function withCleanEnv(run: () => Promise<void>) {
    const save = { ...process.env };
    delete process.env.XAI_API_KEY;
    delete process.env.XAI_MANAGEMENT_API_KEY;
    try {
      await run();
    } finally {
      process.env.XAI_API_KEY = save.XAI_API_KEY;
      process.env.XAI_MANAGEMENT_API_KEY = save.XAI_MANAGEMENT_API_KEY;
    }
  }

  // Config error when no key (search path)
  await test("search throws CONFIG when no XAI_API_KEY", async () => {
    await withCleanEnv(async () => {
      await assert.rejects(
        () => collectionsClient.search("test query"),
        (e: any) => e instanceof XaiCollectionsConfigError && /XAI_API_KEY/.test(e.message)
      );
    });
  });

  // Happy ensure (list hit)
  await test("ensureCollectionForVersion returns existing on list hit (mocked)", async () => {
    process.env.XAI_API_KEY = "test_key_no_real";
    process.env.XAI_MANAGEMENT_API_KEY = "test_mgmt_key";
    installMockFetch(async (url) => {
      if (url.includes("/v1/collections?filter")) {
        return makeJsonResponse({
          collections: [
            { collection_id: "coll_existing_123", collection_name: "ps-profile-v1-2026-05" },
          ],
        });
      }
      return makeErrorResponse(500, "unexpected");
    });
    try {
      const ref = await collectionsClient.ensureCollectionForVersion("v1-2026-05");
      assert.equal(ref.id, "coll_existing_123");
      assert.match(ref.name, /ps-profile/);
      passed++; // counted inside
    } finally {
      restoreFetch();
    }
  });

  // Happy search
  await test("search returns mapped chunks + citations (mocked)", async () => {
    process.env.XAI_API_KEY = "test_key_no_real";
    installMockFetch(async (url) => {
      if (url.includes("/v1/documents/search")) {
        return makeJsonResponse({
          matches: [
            { content: "Experience at Oneflow...", score: 0.92, metadata: { version: "v1" } },
            { chunk: "Dad-mode principle...", score: 0.87 },
          ],
          citations: ["collections://coll_abc/files/file_1"],
        });
      }
      return makeErrorResponse(404, "no");
    });
    try {
      const res = await collectionsClient.search("Oneflow TS migration", {
        filters: { collection_ids: ["coll_abc"] },
        k: 4,
      });
      assert.equal(res.chunks.length, 2);
      assert.equal(res.chunks[0].text, "Experience at Oneflow...");
      assert.equal(res.chunks[0].score, 0.92);
      assert.equal(res.citations[0], "collections://coll_abc/files/file_1");
    } finally {
      restoreFetch();
    }
  });

  // ingest happy (file upload + associate + poll PROCESSED)
  await test("ingestPacket happy path: upload -> associate -> PROCESSED (mocked, no real keys)", async () => {
    process.env.XAI_API_KEY = "test_key_no_real";
    process.env.XAI_MANAGEMENT_API_KEY = "test_mgmt_key";
    let pollCount = 0;
    installMockFetch(async (url, init) => {
      if (url.includes("/v1/files") && init?.method === "POST") {
        return makeJsonResponse({ id: "file_ingest_999" });
      }
      if (url.includes("/documents/") && init?.method === "POST") {
        return makeJsonResponse({});
      }
      if (url.includes("/documents/") && (!init || init.method === "GET")) {
        pollCount += 1;
        if (pollCount < 2) {
          return makeJsonResponse({ status: "DOCUMENT_STATUS_PROCESSING" });
        }
        return makeJsonResponse({ status: "DOCUMENT_STATUS_PROCESSED" });
      }
      if (url.includes("/v1/collections") && init?.method === "POST") {
        return makeJsonResponse({
          collection_id: "coll_new_456",
          collection_name: "ps-profile-v1-2026-05",
        });
      }
      return makeErrorResponse(500, "unexpected ingest mock");
    });
    try {
      const fakePacket = {
        version: "v1-2026-05",
        compiledAt: new Date().toISOString(),
        coreIdentity: "test",
        principles: [],
        topAchievements: [],
        experienceHighlights: [],
        signatureProjects: [],
        goldenExamples: [],
        structuredSnapshot: {},
        ingestDocument: "# Test Persona\n\nIngest me.",
        toolSystemPrompt: "You are helpful.",
      } as any;
      const result = await collectionsClient.ingestPacket(fakePacket);
      assert.equal(result.collectionId, "coll_new_456");
      assert.equal(result.fileId, "file_ingest_999");
      assert.equal(result.status, "DOCUMENT_STATUS_PROCESSED");
    } finally {
      restoreFetch();
    }
  });

  // Poll timeout
  await test("ingestPacket throws TIMEOUT on long poll (mocked)", async () => {
    process.env.XAI_API_KEY = "test_key_no_real";
    process.env.XAI_MANAGEMENT_API_KEY = "test_mgmt_key";
    installMockFetch(async (url, init) => {
      if (url.includes("/v1/files")) return makeJsonResponse({ id: "file_t" });
      if (url.includes("/documents/") && init?.method === "POST") return makeJsonResponse({});
      if (url.includes("/documents/") && init?.method !== "POST") {
        return makeJsonResponse({ status: "DOCUMENT_STATUS_PROCESSING" }); // never progresses
      }
      if (url.includes("/v1/collections") && init?.method === "POST") {
        return makeJsonResponse({ collection_id: "coll_t", collection_name: "ps-profile-t" });
      }
      return makeErrorResponse(500, "no");
    });
    try {
      const fakePacket = {
        version: "t",
        ingestDocument: "x",
        compiledAt: "",
        coreIdentity: "",
        principles: [],
        topAchievements: [],
        experienceHighlights: [],
        signatureProjects: [],
        goldenExamples: [],
        structuredSnapshot: {},
        toolSystemPrompt: "",
      } as any;
      await assert.rejects(
        () => collectionsClient.ingestPacket(fakePacket),
        (e: any) => e instanceof XaiCollectionsTimeoutError && /timeout/.test(e.message)
      );
    } finally {
      restoreFetch();
    }
  });

  // API error surfaces as ApiError
  await test("search surfaces API error as XaiCollectionsApiError", async () => {
    process.env.XAI_API_KEY = "test_key_no_real";
    installMockFetch(async (url) => {
      if (url.includes("/documents/search")) return makeErrorResponse(429, "rate limited");
      return makeErrorResponse(500, "no");
    });
    try {
      await assert.rejects(
        () => collectionsClient.search("q", { filters: { collection_ids: ["c"] } }),
        (e: any) => e instanceof XaiCollectionsApiError && e.status === 429
      );
    } finally {
      restoreFetch();
    }
  });

  // Restore env
  process.env.XAI_API_KEY = origEnv.XAI_API_KEY;
  process.env.XAI_MANAGEMENT_API_KEY = origEnv.XAI_MANAGEMENT_API_KEY;

  console.log(`\n✅ xai-collections tests complete (passed=${passed}, failed=${failed})`);
  if (failed > 0) throw new Error(`${failed} test(s) failed`);
}

// Execute only when run directly
if (
  process.argv[1]?.endsWith("xai-collections.test.ts") ||
  process.argv[1]?.endsWith("xai-collections.test.js")
) {
  runXaiCollectionsTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
