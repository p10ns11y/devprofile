# `@devprofile/qa` — Profile Q&A

Self-contained server library for the `/qa` page: two retrieval backends behind one HTTP contract, BDD-first tests, and a single visitor-facing JSON shape.

**Entry points**

| Surface | Role |
|---------|------|
| `POST /api/cv/qa` | Thin route → `handleQaRequest` |
| `@/lib/qa` | Public barrel (gateway, config, types, tools) |
| `ProfileQA` (`src/components/profile-qa.tsx`) | Client UI — expects `{ answer, details[] }` |

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Client]
    UI["ProfileQA (/qa)"]
  end

  subgraph api [API layer]
    Route["route.ts"]
    GW["gateway/handle-qa-request.ts"]
  end

  subgraph config [Config]
    Mode["config/resolve-qa-mode.ts"]
  end

  subgraph local [Local-index path — default]
    Gen["profile-qa-generator.ts"]
    Ret["retrieve.ts"]
    Idx["qa-index.json + embed-query"]
    Cache["qa-cache.ts"]
  end

  subgraph agentic [Agentic path — ENABLE_XAI_REACTOR]
    Run["runProfileQA.ts"]
    Reactor["persona-reactor.ts"]
    Defense["abuse-defense.ts"]
    Compiler["persona-compiler.ts"]
    Tools["persona-tools.ts (6 tools)"]
    Search["agentic/tools/search-backend.ts"]
    XAI["xai-collections.ts"]
    Grok["Grok via AI SDK streamText"]
  end

  subgraph shared [Shared]
    Mapper["shared/response-mapper.ts"]
    Details["shared/map-search-to-details.ts"]
    Types["types.ts"]
  end

  UI -->|POST question| Route
  Route --> GW
  GW --> Mode
  Mode -->|local-index| Gen
  Mode -->|agentic| Run
  Gen --> Ret
  Gen --> Idx
  Gen --> Cache
  Run --> Reactor
  Reactor --> Defense
  Reactor --> Compiler
  Reactor --> Grok
  Grok --> Tools
  Tools --> Search
  Search --> XAI
  Search -->|USE_LOCAL_PROFILE_DATA| Ret
  Tools --> Details
  Gen --> Mapper
  GW --> Mapper
  Mapper --> Types
```

### Design principles

1. **One visitor contract** — `{ answer, details: RetrievedChunk[] }` regardless of backend.
2. **Dual path, one kill switch** — `ENABLE_XAI_REACTOR`; default path stays local-index.
3. **Defense-first (agentic only)** — `checkAbuse` before any Grok or Collections spend.
4. **Colocated BDD** — scenarios in `features/*.feature.test.ts`; unit tests beside modules.
5. **No local vectors on reactor path** — agentic retrieval uses xAI Collections or file keyword search, not `qa-index.json` embeddings.

---

## Request flows

### Default path (local-index)

```mermaid
sequenceDiagram
  participant V as Visitor
  participant R as /api/cv/qa
  participant G as handleQaRequest
  participant C as qa-cache
  participant P as profile-qa-generator
  participant I as retrieve + qa-index

  V->>R: POST { question }
  R->>G: handleQaRequest(q, { ip, headers })
  G->>C: cache hit?
  alt cache hit
    C-->>G: cached QAResponse
  else cache miss
    G->>P: runLocalIndexQa(q)
    P->>I: hybrid RRF retrieve (BM25 + cosine)
    P->>P: golden-routing / template / Ollama
    P-->>G: { answer, details, strategy }
    G->>C: set
  end
  G-->>R: body + headers
  R-->>V: 200 JSON
```

**Retrieval:** `retrieve.ts` — reciprocal rank fusion over pre-built `src/data/qa-index.json` (MiniLM embeddings + BM25).

**Generation strategies:** `golden-match` → curated `idealAnswer` from `golden-routing.ts` (question embed ≥ 0.87, keyword overlap, or **Golden Q&A retrieval chunk ≥ 0.65** — avoids generic CV intro when the panel already shows a golden hit); `template` → `qa-utils`; `ollama` → local LLM when configured and retrieval confidence is sufficient.

**Agentic path:** after tools, if top retrieved chunk is Golden Q&A ≥ `GOLDEN_RETRIEVAL_MIN_SIM`, the reactor replaces generic Grok/intro text with the same curated answer (`persona-reactor.ts`).

**Caching:** identical questions return the same payload (`qa-cache.ts`).

### Agentic path (reactor)

```mermaid
sequenceDiagram
  participant V as Visitor
  participant G as handleQaRequest
  participant PR as persona-reactor
  participant D as checkAbuse
  participant GF as golden-fallback
  participant ST as streamText + 6 tools
  participant SB as search-backend
  participant X as xai-collections

  V->>G: question (reactor enabled)
  G->>PR: runProfileQA
  PR->>D: checkAbuse (first)
  alt blocked
    D-->>PR: { blocked, reason, layer }
    PR->>GF: computeGoldenFallback
    PR-->>G: { answer, isGolden, defense, details: [] }
  else passed
    PR->>ST: Grok + tool loop (max 5 steps)
    ST->>SB: tool execute → searchProfile
    SB->>X: POST /v1/documents/search (or local files)
    X-->>SB: SearchResult chunks
    SB-->>ST: formatted excerpts for model
    ST-->>PR: answer + retrievedChunks
    PR-->>G: { answer, retrievedChunks, version }
  end
  G->>G: map chunks → details[] (similarity 0–1)
  G-->>V: 200 JSON (+ X-QA-Reactor header)
```

**On reactor error:** gateway logs and **falls back to local-index** (same as default path).

**UI grounding:** `shared/map-search-to-details.ts` normalizes xAI scores to 0–1 for the “Retrieved information” `% match` display in `ProfileQA`.

---

## Abuse handling (agentic only)

Runs inside `persona-reactor.ts` before packet compile for Grok. **Not applied** on the default local-index path.

| Layer | Implementation | Default threshold |
|-------|----------------|-------------------|
| Edge | In-memory sliding window per `ip \| user-agent` | 12 req / 5 min |
| Semantic | Regex blocklist + off-topic heuristic | patterns in `abuse-defense.ts` |
| Behavioral | Repeated identical questions in window | 3 repeats / 5 questions |
| Hard caps | Config present | **not wired yet** (`ABUSE_IP_PER_DAY`, etc.) |

On block: HTTP **200**, `isGolden: true`, curated `computeGoldenFallback` answer, `details: []`, zero xAI cost.

Config: `src/config/abuse-defense.ts` + `ABUSE_*` env overrides (see `.env.example`).

---

## Response contract

```typescript
interface QAResponse {
  answer: string;
  details: RetrievedChunk[];  // UI “Retrieved information” panel
  strategy?: "golden-match" | "template" | "ollama" | "reactor";
  ollamaError?: string;
}

interface RetrievedChunk {
  text: string;
  section: string;      // e.g. "Profile", "golden-qa", tool label
  similarity: number;   // 0–1 → displayed as % match
  source?: string;
}
```

Agentic responses may also include `version`, `isGolden`, `defense` (passed through by `shared/response-mapper.ts`). Reactor responses add headers `X-QA-Reactor: 1` and `X-QA-Version`.

Visitor assertions: `test/contracts.ts` → `assertQaResponseForVisitor()`.

---

## Module map

```
src/lib/qa/
├── README.md                          ← this file
├── index.ts                           public barrel
├── types.ts                           shared + agentic types
│
├── gateway/
│   └── handle-qa-request.ts           visitor orchestration (mode, cache, fallback)
├── config/
│   └── resolve-qa-mode.ts             ENABLE_XAI_REACTOR, agentic retrieval mode
│
├── features/                          BDD acceptance (write scenarios first)
│   ├── ask-question.feature.test.ts   S1, S2, S3
│   ├── cache.feature.test.ts          S4
│   ├── local-fallback.feature.test.ts S5
│   ├── agentic-parity.feature.test.ts S6
│   ├── safe-refusal.feature.test.ts   S7
│   └── local-profile-data.feature.test.ts S8
├── test/                              shared test helpers only
│   ├── contracts.ts
│   └── bdd.ts
│
├── shared/
│   ├── response-mapper.ts             JSON body + reactor headers
│   ├── map-search-to-details.ts       SearchResult → RetrievedChunk[]
│   └── types.contract.test.ts
│
├── agentic/
│   ├── pipeline/
│   │   ├── run-pipeline.test.ts       S6 (reactor wiring)
│   │   └── defense.test.ts            S7 (abuse + golden)
│   └── tools/
│       ├── search-backend.ts          unified local vs Collections search
│       └── search-backend.test.ts     S8
│
├── # Local-index (flat — target: local-index/)
├── profile-qa-generator.ts            runLocalIndexQa — default path
├── retrieve.ts                        hybrid RRF retrieval
├── load-index.ts, embed-query.ts      index loader + query embedding
├── qa-router.ts, qa-prompts.ts        strategy + Ollama prompts
├── qa-cache.ts                        repeat-question cache
├── suggested-questions.ts             curated prompts for UI
│
├── # Agentic core (flat — target: agentic/)
├── runProfileQA.ts                    public reactor delegate
├── persona-reactor.ts                 defense → streamText → tool loop
├── persona-compiler.ts                ProfilePacket from src/data/*
├── persona-tools.ts                   6 specialized search tools
├── abuse-defense.ts                   4-layer gate + golden re-exports
├── golden-fallback.ts                 on-block answers (Q6 tone)
├── xai-collections.ts                 Collections search client
├── durable-retry.ts                   lightweight retry wrapper
│
└── *.test.ts                          colocated unit tests
```

**Six persona tools** (Collections-backed or local keyword): `profileSearch`, `workExperience`, `skills`, `projects`, `educationAndBackground`, `principlesAndPhilosophy`.

---

## Data sources

| Asset | Used by |
|-------|---------|
| `src/data/qa-index.json` | Local-index retrieval (built via `pnpm qa:pipeline`) |
| `src/data/persona/ps-profile-v1.md` | Compiler, local search, Collections ingest |
| `src/data/golden-qa.md`, `casual-qa.md`, `top-three-achievements.md` | Compiler, golden match, local search |
| `src/data/cvdata.json` | Compiler structured snapshot |
| xAI Collection (`XAI_PROFILE_COLLECTION`) | Agentic search (read-only at runtime) |

---

## Environment

| Variable | Path | Effect |
|----------|------|--------|
| `ENABLE_XAI_REACTOR=true` | gateway | Switch to agentic pipeline |
| `USE_LOCAL_PROFILE_DATA=true` | agentic tools | File keyword search instead of Collections |
| `XAI_API_KEY` | Grok + Collections search | Chat and `POST api.x.ai/v1/documents/search` |
| `XAI_MANAGEMENT_API_KEY` | optional | Management API (create/list only; not used in prod read-only path) |
| `XAI_PROFILE_COLLECTION` | agentic | Collection ID for scoped search |
| `XAI_MODEL` | agentic | Grok model id (e.g. `grok-4.3`) |
| `XAI_MAX_OUTPUT_TOKENS` | agentic | Completion cap per step (default **400**; clamp 128–2048). Essence-length answers, not essays. |
| `XAI_REASONING_EFFORT` | agentic | `low` (default) or `high` → `providerOptions.xai.reasoningEffort` |
| `XAI_TEMPERATURE` | agentic | Default **0.45** for crisp copy |
| `OLLAMA_BASE_URL` | local-index | Optional local LLM generation |
| `ABUSE_*` | agentic | Rate limits and behavioral thresholds |

Full list: [`.env.example`](../../../.env.example).

### Local development modes

| Goal | Env |
|------|-----|
| Default portfolio (no xAI cost) | omit `ENABLE_XAI_REACTOR` |
| Full reactor + real Collections | `ENABLE_XAI_REACTOR=true`, `XAI_API_KEY`, `XAI_PROFILE_COLLECTION` |
| Reactor tool loop without Collections | `ENABLE_XAI_REACTOR=true`, `USE_LOCAL_PROFILE_DATA=true` (still needs `XAI_API_KEY` for Grok chat) |

---

## Production (deployed `main`) vs this branch

| | **Production today** ([peramanathan-sathyamoorthy-cv.vercel.app](https://peramanathan-sathyamoorthy-cv.vercel.app)) | **This branch** (`refactor/qa-bdd-colocated` + uncommitted placeholder fix) |
|---|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Deployed code** | `origin/main` (~PR #51 merge) | Not merged yet |
| **`package.json` `"type": "module"`** | Yes → risk of `ERR_REQUIRE_ESM` on `/api/cv/qa` and RSC routes | Removed (`0f8ffbf`) |
| **QA route** | Inline reactor/simple split in `route.ts` | Thin `route.ts` → `handleQaRequest` |
| **Golden panel/answer alignment** | No `golden-routing.ts` | `cf9b957` + retrieval gate |
| **Preflight `profileSearch`** | No | Yes (before `streamText`) |
| **Placeholder → local fallback** | No (placeholder returned as success) | Yes (`handle-qa-request.ts`) |
| **Chunk synthesis when Grok silent** | No | Yes (`reactor-answer-fallback.ts`) |
| **Live probe** (2026-05-31) | `X-QA-Reactor: 1`, `details: []`, placeholder on every question | Run locally after `pnpm dev` + env below |

### Same Vercel env for both (until you change them)

Production and local branch read the **same variable names**. Set these in **Vercel → Project → Environment Variables** (Production + Preview) and mirror in `.env.local`:

| Variable | Production impact |
|----------|-------------------|
| `ENABLE_XAI_REACTOR=true` | Agentic path (currently on — causes placeholder when Grok/tools empty) |
| `XAI_API_KEY` | Required for Grok `streamText` |
| `XAI_MODEL` | **Set explicitly** on Vercel and locally. If unset, defaults to `grok-4-1-fast-reasoning` (`constants.ts`); wrong/unavailable model → empty Grok text + placeholder |
| `XAI_PROFILE_COLLECTION` + read key | Collections search; if missing, code falls back to **local profile files** in the bundle |
| `USE_LOCAL_PROFILE_DATA=true` | Force local files for tool/preflight search (good for preview) |

**Immediate production relief (no deploy):** set `ENABLE_XAI_REACTOR=false` on Vercel and redeploy env only → site uses **local-index** path (hybrid retrieval + template/Ollama), no Grok placeholder.

**Proper production fix:** merge this branch (at least `0f8ffbf` + golden + placeholder fixes), redeploy, keep reactor env vars aligned with `.env.local`.

### Verify after deploy

```bash
curl -sS -X POST "https://peramanathan-sathyamoorthy-cv.vercel.app/api/cv/qa" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is your email?"}' | jq '.answer, .details | length'
```

Expect a real answer (or local-path template), and `details` length &gt; 0 when reactor + retrieval work.

---

## Troubleshooting: “wasn't able to generate a complete narrative answer” (all questions)

### Symptom

Every agentic question returns:

> I used my specialized profile tools to look up information, but wasn't able to generate a complete narrative answer this time. The tool results may contain relevant details.

That string is **`REACTOR_EMPTY_NARRATIVE_PLACEHOLDER`** in `shared/reactor-answer-fallback.ts`, set in `persona-reactor.ts` only when **all** of the following fail:

1. Grok `result.text` is empty or very short
2. No tool results in AI SDK `steps` (and no manual collector rows when `XAI_PROFILE_COLLECTION` is set)
3. No synthesis from **retrieved chunks** or golden routing

### Common causes

| Cause | What to check |
|-------|----------------|
| Grok never calls tools | Logs: `toolResultsInLastStep: 0`, `stepCount` low. Fix: **preflight** `profileSearch` before `streamText` (wired in reactor); set `XAI_MODEL` to a model your account supports (e.g. `grok-4.3`). |
| Collections search empty | `XAI_PROFILE_COLLECTION`, `XAI_MANAGEMENT_API_KEY` or `XAI_API_KEY` with read scope; collection populated in console.x.ai. |
| Reactor completes but gateway still shows placeholder | Gateway now **falls back to local-index** when the placeholder is returned (`handle-qa-request.ts`). Redeploy after this fix. |
| Embeddings unavailable on serverless | `@huggingface/transformers` may fail on Vercel; early golden short-circuit uses BM25-only fallback — preflight/local search still fills chunks. |

### Env checklist (agentic)

```bash
ENABLE_XAI_REACTOR=true
XAI_API_KEY=...
XAI_MODEL=grok-4.3   # or another model your account has
XAI_PROFILE_COLLECTION=...   # optional; without it, local profile files are used for search
```

For local reactor dev without Collections: `USE_LOCAL_PROFILE_DATA=true` (still needs `XAI_API_KEY` for chat).

### Logs

Search server logs for `[persona-reactor][generation]`:

- `preflight retrieval` — chunk count should be &gt; 0 for most questions
- `synthesized answer from retrieved chunks` — fallback succeeded without Grok text
- `no usable text produced after tools — using placeholder` — still broken; check keys, model, collection

---

## Troubleshooting: generic intro answer vs Golden Q&A panel

### Symptom

The main answer sounds like generic LLM/CV copy:

> Hello! I'm Peramanathan Sathyamoorthy, a Senior Software Engineer with 11+ years… Oneflow AB… TypeScript… 70% reduction… Uppsala… What would you like to know more about my experience, skills, or specific projects?

Meanwhile **Retrieved information** shows a curated **Golden Q&A** card (e.g. “next chapters” / Dad mode in Tamil Nadu) at something like **67.9% match**.

That mismatch is confusing but explainable: **answer** and **details** are produced by different code paths with different thresholds.

### Why the answer is the legacy intro template (not Grok “voice”)

On the **local-index** path (`profile-qa-generator.ts` → `@/utils/qa-utils`), that hello block is almost always **`generateIntroductionAnswer()`** in `src/utils/qa-utils.ts`, not Grok and not your golden markdown.

It runs when `generateAnswer()` classifies the question as an introduction, for example:

- “tell me about yourself”
- “who are you”
- “your background”
- “describe yourself”

```303:315:src/utils/qa-utils.ts
  if (isIntroductionQuestion) {
    return enhanceNaturalFlow(generateIntroductionAnswer(cvdata));
  }
```

That function stitches **`cvdata.json`** (name, years, Oneflow responsibilities, degree, Stockholm) into a fixed template ending with “What would you like to know more about my experience, skills, or specific projects?”

So it can sound “LLM-like” even though it is **deterministic template text** from the CV JSON.

On the **agentic** path (`persona-reactor.ts` + Grok), the model *can* produce similar generic intros when it leans on the system prompt / packet identity instead of tool output. That is a different mechanism but looks the same in the UI.

**BYOK / AI Gateway does not cause this.** Gateway only affects chat billing/routing if you wire the app to it. This symptom is about **which generator ran** (template vs golden vs Grok), not xAI Collections.

### Why the panel still shows Golden Q&A at ~67.9%

`details[]` comes from **hybrid retrieval** over `qa-index.json` (`retrieve.ts`: BM25 + cosine RRF), or from **tool search** on the agentic path (`persona-tools` → `search-backend`).

Golden rows in the index look like:

```text
Question: You recently posted about “getting ready for next chapters”…
Answer: ** After joining Oneflow in April 2017…
```

The UI label **Golden Q&A** is the chunk `section` from `scripts/build-qa-chunks.mjs`. The **67.9%** is **retrieval relevance** for that chunk (normalized in `map-search-to-details.ts`), not “we chose this as the final answer.”

Historically, the **main answer** only used curated golden text when **question ↔ golden question** similarity was **≥ 0.87** (`QA_ROUTER.GOLDEN_MATCH_THRESHOLD`). A chunk at **67.9%** was shown in the panel but **did not** override the intro template — hence the split brain.

### Two pipelines (split brain)

```mermaid
flowchart TB
  Q[Visitor question]
  Q --> R[retrieve / tools → details panel]
  Q --> A[answer generator]
  R --> D["details[] e.g. Golden Q&A 67.9%"]
  A --> T{golden-match ≥ 0.87?}
  T -->|yes| G[curated idealAnswer]
  T -->|no| I{isIntroductionQuestion?}
  I -->|yes| H["generateIntroductionAnswer() ← generic hello"]
  I -->|no| O[template / Ollama / Grok]
```

| Piece | Source | Typical output |
|-------|--------|----------------|
| **Retrieved information** | `retrieveFromIndex` or tool `searchProfile` | Top chunks, any section, similarity for display |
| **Main answer** | `resolveGoldenAnswer` → else `generateAnswer` / Grok | Curated golden, intro template, or synthesized text |

They were not wired together until **`golden-routing.ts`** added a **retrieval gate** (`GOLDEN_RETRIEVAL_MIN_SIM` = 0.65): if the best **Golden Q&A** chunk clears that bar, the same `idealAnswer` is used for the body, not only the panel.

### How to tell which path ran

In DevTools → Network → `POST /api/cv/qa`:

| Signal | Local index | Agentic reactor |
|--------|-------------|-----------------|
| Response header `X-QA-Reactor: 1` | Absent | Present |
| JSON `strategy` | `golden-match` / `template` / `ollama` | Often `reactor` |
| Answer starts with `Hello! I'm…` + “What would you like to know more about my experience…” | Very likely **template** intro | Unusual unless Grok mimics it or local fallback |

### Fix in this repo

See [`golden-routing.ts`](golden-routing.ts):

- `resolveGoldenAnswer()` — question embed, keyword, or retrieval-backed golden
- `persona-reactor.ts` — after tools, prefer `idealAnswer` when retrieval surfaced Golden Q&A
- `profile-qa-generator.ts` — same before template/Ollama

Regression tests: [`golden-routing.test.ts`](golden-routing.test.ts) (next-chapters / 67.9% case).

---

## Testing strategy

### Pyramid

```
  Playwright E2E (thin)          tests/e2e/qa.spec.ts, qa-reactor.spec.ts
           ▲                     real browser; reactor tests env-gated
  BDD acceptance (Vitest)        features/*.feature.test.ts  ← write first
           ▲
  Colocated unit tests             *.test.ts beside implementation
           ▲
  Golden eval (retrieval quality)  pnpm test:golden — recall@5 gate
```

No Cucumber — Vitest `describe`/`it` with scenario titles and optional `test/bdd.ts` helpers (`feature`, `scenario`).

### Visitor scenarios (source of truth)

| ID | Outcome | Primary tests |
|----|---------|---------------|
| **S1** | Non-empty answer + valid shape | `features/ask-question.feature.test.ts` |
| **S2** | Suggested question works | `features/ask-question.feature.test.ts` |
| **S3** | `details[]` with grounding | `features/ask-question.feature.test.ts`, `retrieve.test.ts` |
| **S4** | Cache hit on repeat | `features/cache.feature.test.ts` |
| **S5** | Answer when Ollama fails | `features/local-fallback.feature.test.ts` |
| **S6** | Reactor same JSON + headers | `features/agentic-parity.feature.test.ts`, `run-pipeline.test.ts` |
| **S7** | Abuse → golden, no model spend | `features/safe-refusal.feature.test.ts`, `defense.test.ts` |
| **S8** | Local files without Collections keys | `features/local-profile-data.feature.test.ts`, `search-backend.test.ts` |

E2E files document matching scenario IDs in comments.

### Commands

```bash
pnpm test:qa          # lib/qa scenarios (S1–S8) + colocated unit tests + route
pnpm test:unit        # all Vitest tests under src/
pnpm test:unit:watch  # develop scenarios first
pnpm test:unit:cov    # coverage on src/lib/qa/** + route
pnpm test:golden      # retrieval quality (HF index; optional CI job)
pnpm type-check && pnpm lint
```

E2E (Brave Beta only):

```bash
pnpm test:e2e --project=brave-beta -g qa
ENABLE_XAI_REACTOR=true XAI_API_KEY=... pnpm test:e2e --project=brave-beta -g qa-reactor
```

See [`tests/e2e/README.md`](../../../tests/e2e/README.md).

### Mocking conventions

| Concern | Pattern |
|---------|---------|
| Reactor / Grok | Hoisted `vi.mock("ai")` + `vi.mock("@ai-sdk/xai")` in `run-pipeline.test.ts` |
| Gateway agentic | Mock `../runProfileQA` in feature tests (S6–S8) |
| Collections HTTP | Mock `globalThis.fetch` in `xai-collections.test.ts` |
| Abuse state | `resetAbuseStateForTests()` in `beforeEach` |
| Defense isolation | `defense.test.ts` uses real `checkAbuse` + fixture packet |

**Rule:** add a colocated unit test only when a scenario needs finer decomposition — not before the acceptance test exists.

### Contract helpers

```typescript
import { assertQaResponseForVisitor } from "@/lib/qa/test/contracts";

assertQaResponseForVisitor(body); // answer + details shape for ProfileQA
```

---

## Public API (barrel)

```typescript
import {
  handleQaRequest,
  isQARectorEnabled,
  resolveQaMode,
  checkAbuse,
  compileProfilePacket,
  collectionsClient,
  runLocalIndexQa,
} from "@/lib/qa";
```

Prefer `handleQaRequest` for new integrations; route and server actions delegate to it.

---

## Verify before merge

```bash
pnpm type-check
pnpm lint
pnpm test:unit
# when retrieve.ts or qa-index changed:
pnpm test:golden
```

---

## Related docs

- [`.cursor/plans/qa_workflow_refactor_0b9c7b12.plan.md`](../../../.cursor/plans/qa_workflow_refactor_0b9c7b12.plan.md) — BDD refactor plan
- [`.grok/plans/grok-design-doc-7f04db24.md`](../../../.grok/plans/grok-design-doc-7f04db24.md) — technical depth (property tests, CI)
- [`.grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md`](../../../.grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md) — original reactor design
- [`docs/phase-1-xai-agentic-profile-qa-reactor.md`](../../../docs/phase-1-xai-agentic-profile-qa-reactor.md) — rollout status

---

## Roadmap (not blocking current use)

- Physical folder moves (`local-index/`, full `agentic/` layout)
- Split `persona-reactor.ts` into pipeline stages
- Wire hard-cap abuse layer; optional Edge middleware
- `RetrievalSurface` shared type for dual-path chunk mapping
- Property tests (`fast-check`) and golden eval in CI
