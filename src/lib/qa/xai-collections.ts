/**
 * xAI Collections Thin Client (PR 3).
 *
 * Zero-dependency (beyond native fetch) client for the sole allowed substrate.
 * Implements ensureCollectionForVersion, ingestPacket (management), search helper.
 *
 * CRITICAL (per design + User Decision 5 / Q5):
 * - Phase 1 ingest is MANUAL/DIRECT via console.x.ai only.
 * - This client supports the ops for the manual-ingest helper script (scripts/)
 *   and future Post-PR8 automation. The reactor path (PR6+) MUST NOT auto-call
 *   ingestPacket (ingestIfNeeded is intentionally omitted here).
 * - All Collections traffic (create, upload, poll, search) lives ONLY in this module.
 * - xAI Collections is the SOLE substrate: no local vectors ever in reactor path.
 *
 * Env:
 * - XAI_API_KEY (required for search + general; get from console.x.ai)
 * - XAI_MANAGEMENT_API_KEY (preferred for create/ingest; falls back to XAI_API_KEY)
 *
 * Bases (2026 per design/docs):
 * - Management: https://management-api.x.ai/v1 (create, documents add/poll)
 * - API: https://api.x.ai/v1 (documents/search, files upload)
 *
 * Error types + structured econ logging (payload lens, durations, request ids, status).
 * Mocks in tests override global fetch; never uses real keys in test runs.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (PR3, Q5, client surface)
 * @see src/lib/qa/types.ts (ProfilePacket, CollectionRef, IngestResult, SearchResult)
 */

import type { CollectionRef, IngestResult, ProfilePacket, SearchResult } from "./types";

// -----------------------------------------------------------------------------
// Error types (good errors, structured, reviewable)
// -----------------------------------------------------------------------------

export class XaiCollectionsError extends Error {
  readonly code: string;
  readonly status?: number;
  constructor(message: string, code = "UNKNOWN", status?: number) {
    super(message);
    this.name = "XaiCollectionsError";
    this.code = code;
    this.status = status;
  }
}

export class XaiCollectionsConfigError extends XaiCollectionsError {
  constructor(message: string) {
    super(message, "CONFIG");
    this.name = "XaiCollectionsConfigError";
  }
}

export class XaiCollectionsApiError extends XaiCollectionsError {
  readonly body?: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message, "API", status);
    this.name = "XaiCollectionsApiError";
    this.body = body;
  }
}

export class XaiCollectionsTimeoutError extends XaiCollectionsError {
  constructor(message: string) {
    super(message, "TIMEOUT");
    this.name = "XaiCollectionsTimeoutError";
  }
}

// -----------------------------------------------------------------------------
// Config + constants (clear errors; manual-ingest constraint enforced in docs)
// -----------------------------------------------------------------------------

const MANAGEMENT_BASE = "https://management-api.x.ai";
const API_BASE = "https://api.x.ai";

const DEFAULT_POLL_TIMEOUT_MS = process.env.XAI_TEST_POLL_TIMEOUT_MS
  ? Number(process.env.XAI_TEST_POLL_TIMEOUT_MS)
  : 180_000;
const DEFAULT_POLL_INTERVAL_MS = process.env.XAI_TEST_POLL_INTERVAL_MS
  ? Number(process.env.XAI_TEST_POLL_INTERVAL_MS)
  : 3_000;
const DEFAULT_SEARCH_K = 8;

function getApiKey(): string {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) {
    throw new XaiCollectionsConfigError(
      "XAI_API_KEY is required. Get one at console.x.ai (X Premium+). " +
        "Never hardcode keys. See .env.example and design Q5."
    );
  }
  return key;
}

function getManagementKey(): string {
  const m = process.env.XAI_MANAGEMENT_API_KEY?.trim();
  if (m) return m;
  // Fallback to api key (some keys have mgmt perms); explicit error in ops that need it
  return getApiKey();
}

function collectionNameForVersion(version: string): string {
  // Sanitize for safety; design uses ps-profile-${version}
  const safe = version.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `ps-profile-${safe}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  apiKey: string,
  label: string
): Promise<{ data: T; requestId?: string; status: number }> {
  const start = Date.now();
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  } as Record<string, string>;
  if (init.body && typeof init.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...init, headers });
  const durationMs = Date.now() - start;
  const requestId =
    res.headers.get("x-request-id") ||
    res.headers.get("request-id") ||
    res.headers.get("x-xai-request-id") ||
    undefined;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
  }

  console.log(
    `collections:${label} status=${res.status} durationMs=${durationMs} requestId=${requestId ?? "n/a"}`
  );

  if (!res.ok) {
    const msg =
      (body as any)?.error?.message ||
      (body as any)?.message ||
      (typeof body === "string" ? body : JSON.stringify(body)) ||
      `HTTP ${res.status}`;
    throw new XaiCollectionsApiError(`collections ${label} failed: ${msg}`, res.status, body);
  }

  return { data: body as T, requestId, status: res.status };
}

// -----------------------------------------------------------------------------
// Core client (thin; object export for barrel + testability)
// -----------------------------------------------------------------------------

class XaiCollectionsClient {
  async ensureCollectionForVersion(version: string): Promise<CollectionRef> {
    if (!version) throw new XaiCollectionsConfigError("version is required");
    const mgmtKey = getManagementKey();
    const name = collectionNameForVersion(version);

    // List with filter (supported per docs)
    const listUrl = `${MANAGEMENT_BASE}/v1/collections?filter=collection_name:"${name}"&limit=5`;
    try {
      const { data } = await fetchJson<{
        collections?: Array<{ collection_id: string; collection_name: string }>;
      }>(listUrl, { method: "GET" }, mgmtKey, "ensure-list");
      const hit = data.collections?.find((c) => c.collection_name === name);
      if (hit) {
        console.log(`collections:ensure found existing name=${name} id=${hit.collection_id}`);
        return { id: hit.collection_id, name };
      }
    } catch (e) {
      // If list fails (e.g. perms), fall through to create attempt (will surface clear error)
      console.log(
        `collections:ensure list attempt (may be empty or first run): ${(e as Error).message}`
      );
    }

    // Note (racy ensure / TOCTOU): list-then-create is acceptable for Phase 1 manual use (single-user console/script). Concurrent new-version creates are not a supported path.

    // Create (minimal config; server defaults for chunk/index are acceptable for persona MD)
    const createUrl = `${MANAGEMENT_BASE}/v1/collections`;
    const createBody = {
      collection_name: name,
      collection_description: `xAI Grok Agentic Profile QA persona packet (${version}). Phase 1: manual ingest via console.x.ai per Q5.`,
      // Light config to ensure text-friendly chunking (tune post-validation if needed)
      index_configuration: { model_name: "grok-embedding-small" },
      chunk_configuration: {
        tokens_configuration: {
          max_chunk_size_tokens: 1024,
          chunk_overlap_tokens: 128,
          encoding_name: "o200k_base",
        },
        strip_whitespace: true,
      },
    };

    const { data: created } = await fetchJson<{ collection_id: string; collection_name: string }>(
      createUrl,
      { method: "POST", body: JSON.stringify(createBody) },
      mgmtKey,
      "ensure-create"
    );

    console.log(`collections:ensure created name=${name} id=${created.collection_id}`);
    return { id: created.collection_id, name: created.collection_name };
  }

  async ingestPacket(packet: ProfilePacket): Promise<IngestResult> {
    // NOTE: Per User Decision 5 / Q5, this is for the manual helper script ONLY.
    // Reactor must not call this automatically in Phase 1.
    if (!packet?.version || !packet?.ingestDocument) {
      throw new XaiCollectionsConfigError(
        "ingestPacket requires packet with version + ingestDocument"
      );
    }

    const mgmtKey = getManagementKey(); // will throw clear CONFIG if absent
    const apiKeyForFiles = getApiKey();
    const ref = await this.ensureCollectionForVersion(packet.version);
    const collId = ref.id;

    // 1) Upload the ingest document via Files API (api.x.ai)
    const fileName = `${packet.version}.md`;
    const form = new FormData();
    form.append("file", new Blob([packet.ingestDocument], { type: "text/markdown" }), fileName);
    form.append("purpose", "assistants");

    const fileUploadUrl = `${API_BASE}/v1/files`;
    const { data: fileMeta } = await fetchJson<{ id: string }>(
      fileUploadUrl,
      { method: "POST", body: form },
      apiKeyForFiles,
      "ingest-file-upload"
    );
    const fileId = fileMeta.id;

    console.log(
      `collections:ingest file uploaded fileId=${fileId} size=${packet.ingestDocument.length}`
    );

    // 2) Associate document with collection (triggers processing)
    const assocUrl = `${MANAGEMENT_BASE}/v1/collections/${collId}/documents/${fileId}`;
    await fetchJson(
      assocUrl,
      {
        method: "POST",
        body: JSON.stringify({
          fields: {
            version: packet.version,
            type: "professional-persona",
          },
        }),
      },
      mgmtKey,
      "ingest-associate"
    );

    // 3) Poll until PROCESSED (or timeout/failed)
    const pollUrl = `${MANAGEMENT_BASE}/v1/collections/${collId}/documents/${fileId}`;
    const deadline = Date.now() + DEFAULT_POLL_TIMEOUT_MS;
    let attempt = 0;

    while (Date.now() < deadline) {
      attempt += 1;
      const { data: doc } = await fetchJson<{
        status: string;
        error_message?: string;
      }>(pollUrl, { method: "GET" }, mgmtKey, "ingest-poll");

      const status = doc.status;
      console.log(`collections:ingest poll attempt=${attempt} status=${status} fileId=${fileId}`);

      if (status === "DOCUMENT_STATUS_PROCESSED") {
        return { collectionId: collId, fileId, status };
      }
      if (status === "DOCUMENT_STATUS_FAILED") {
        throw new XaiCollectionsApiError(
          `ingest failed: ${doc.error_message || "DOCUMENT_STATUS_FAILED"}`,
          500,
          doc
        );
      }
      // still PROCESSING or UNKNOWN -> sleep
      await sleep(DEFAULT_POLL_INTERVAL_MS);
    }

    throw new XaiCollectionsTimeoutError(
      `ingest poll timeout after ${DEFAULT_POLL_TIMEOUT_MS}ms for fileId=${fileId} (collection ${collId}). ` +
        "Check console.x.ai or increase timeout. Manual console ingest is the Phase 1 path (Q5)."
    );
  }

  async search(
    query: string,
    opts?: { filters?: { collection_ids?: string[] }; k?: number }
  ): Promise<SearchResult> {
    if (!query || query.trim().length === 0) {
      throw new XaiCollectionsConfigError("search requires non-empty query");
    }
    const apiKey = getApiKey();
    const collectionIds = opts?.filters?.collection_ids || [];
    if (collectionIds.length === 0) {
      // Allow caller to pass via filters; for direct use ensure first.
      console.log("collections:search warning: no collection_ids in filters (may return empty)");
    }

    const searchUrl = `${API_BASE}/v1/documents/search`;
    const body = {
      query: query.trim(),
      source: { collection_ids: collectionIds },
      max_num_results: opts?.k ?? DEFAULT_SEARCH_K,
    };

    const start = Date.now();
    const { data, requestId } = await fetchJson<{
      matches?: Array<{ content?: string; chunk?: string; metadata?: any; score?: number }>;
      results?: any[];
      citations?: string[];
    }>(searchUrl, { method: "POST", body: JSON.stringify(body) }, apiKey, "search");

    const durationMs = Date.now() - start;
    const rawMatches = data.matches || data.results || [];
    const chunks = rawMatches.map((m: any) => ({
      text: (m.content || m.chunk || m.text || "").toString(),
      metadata: m.metadata || m.fields || undefined,
      score: typeof m.score === "number" ? m.score : undefined,
    }));

    // Citations: prefer server, else synthesize collections:// URIs (design format)
    let citations: string[] = data.citations || [];
    if (citations.length === 0 && collectionIds.length > 0) {
      // Best-effort; real citations come with matches in full responses
      citations = chunks
        .slice(0, 3)
        .map((_, i) => `collections://${collectionIds[0]}/files/search-${i}`);
    }

    console.log(
      `collections:search qLen=${query.length} k=${body.max_num_results} hits=${chunks.length} durationMs=${durationMs} requestId=${requestId ?? "n/a"}`
    );

    return { chunks, citations };
  }
}

export const collectionsClient = new XaiCollectionsClient();
