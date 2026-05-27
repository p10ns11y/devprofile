# Design: xAIGrokAgenticPersonaReactor (Phase 1)

**Author**: Systems Architect (per Phase 0 synthesis)  
**Date**: 2026-05-27  
**Branch Target**: `feature/xai-agentic-profile-qa-reactor` (clean from main)  
**Status**: Draft — Ready for review and `/execute-plan`  
**Related**: Phase 0 artifacts in `docs/phase-0-*.md` and `.agents/plans/phase-1-xai-agentic-profile-qa-reactor.md`; AGENTS.md connected skills (fusion-sage primary for this architecture work)

---

## Overview

This document expands the Phase 1 synthesis & implementation plan into a complete, implementation-ready design for `xAIGrokAgenticPersonaReactor`. The goal is a high-quality, professional-grade Profile Q&A experience on the existing `/qa` surface (exposed via `quick-cv-actions` and `QuestionAnswer` component) that:

- Delivers the proven agentic 6-tool + durable streaming pattern extracted from the canary (origin/canary, PR #33 patterns in `src/utils/cv-tools.ts` and chat routes on that branch).
- Uses **xAI Collections as the sole embeddings/retrieval/caching substrate** (hard invariant; eliminates the canary's OpenAI `text-embedding-3-small` + Google `text-embedding-005` contamination documented in `docs/phase-0-xai-agentic-qa-reactor.md:42-60` and `src/utils/cv-embedding.ts` on canary).
- Introduces a first-class, early, non-bypassable minimal-service 4-layer Abuse Defense Layer (exact implementation of the sketch in `docs/phase-0-abuse-defense-sketch.md`).
- Keeps the footprint tiny (Cursor + X Premium+ / Grok access only; no new paid services or dependency explosions; builds on existing Next.js 16 + React 19 stack in `package.json`).
- Ships behind a feature flag with instant fallback to the current legacy reactor (`src/app/api/cv/qa/route.ts` + `src/utils/qa-utils.ts` using `@huggingface/transformers` Xenova/all-MiniLM-L6-v2 + distilgpt2 + 400+ lines of heuristic `generateAnswer`).

**Primary deliverable for follow-on work**: The `## PR Plan` DAG at the bottom (8 PRs, foundational compiler/client/defense first, fully reviewable/mergeable units with explicit file paths and dependencies). After approval, this document is intended for direct consumption by `/execute-plan`.

The reactor is wired at `src/app/api/cv/qa/route.ts:3` (current POST handler) and surfaces through `src/components/question-answer.tsx:30` (fetch) and `src/app/actions.ts:3` (used by both CV QA and AMA surfaces), with data sources `src/data/cvdata.json`, `src/data/golden-qa.md`, `src/data/casual-qa.md`, `src/data/top-three-achievements.md`, and the canonical `data/persona/ps-profile-v1.md` (v1-2026-05, 108 lines of high-signal narrative + structured snapshot).

---

## Background & Motivation

### Current State (Grounded in Codebase Inspection)
- **Legacy reactor** (`src/app/api/cv/qa/route.ts:13-57` + `src/utils/qa-utils.ts`):
  - `prepareData()` (called on every request) loads HF models + **flattens the entire cvdata.json** (work_experience, skills, projects, education, courses, certifications, technologies, social_links, etc.) + basic fields into `chunks: Chunk[]` with local embeddings (lines 232-244).
  - Query path: local embed of question + cosine similarity (custom impl at 248-258 and route:68-78) + topK=3.
  - Generation: `generateAnswer` (261-378) — 100+ lines of regex heuristics for `isAchievementsQuestion`/`isCareerOverviewQuestion`/`isWhyHireQuestion`/`isIntroductionQuestion` etc., plus section-grouped template functions (`generateWhyHireAnswer`, `generateAchievementsAnswer`, etc.) that hard-code lists and pull from cvdata. Falls back to generic stitching. No tool calling, no streaming, no durability.
  - Cache: in-memory `qaCache: Map` (17) — per-process, lost on cold start / scale.
  - UI: `QuestionAnswer` (question-answer.tsx) shows answer + raw "Retrieved Information" chunks with similarity % (120-133). Text claims "local AI models. No external providers used." (74).
  - Exposed at `/quick-cv-actions` (page.tsx:54-79, "Ask AI Questions" button) and reused via `askQuestion` server action in `ama/page.tsx`.
- **Pain points** (from Phase 0):
  - Low quality on narrative/reflective questions (the exact cases the 45-question validation set targets; see `docs/phase-0-xai-collections-validation.md:55-98`).
  - Cold-start latency and cost from loading HF models + embedding everything on every request.
  - Zero abuse defense (open to flooding, off-topic, session abuse — directly addressed by the 4-layer sketch).
  - No versioning, no reusability of persona packet.
  - Canary experiment proved the 6-tool agentic shape + Workflow DevKit durability + streaming (`streamText`, `stepCountIs`, `toUIMessageStreamResponse`) delivers "professional-grade" grounded answers, but was contaminated (exact file references in Phase 0 report).
- **xAI Collections** (external substrate, confirmed via current xAI docs 2026): fully-managed collection + auto-embed/chunk/index (grok-embedding models) + native `collections_search` / `file_search` tool for Grok. Upload via management API (`client.collections.create` + `upload_document`, poll status). Query via AI SDK tools or direct. Built-in caching + citations (`collections://...`). This is the only allowed substrate per invariants.
- **Constraints** (enforced Day 1, per Phase 0 + user goal):
  - xAI Collections **only** for embeddings/retrieval/primary caching (no local vectors in reactor path; abuse gate may use temporary isolated heuristics only).
  - Abuse defense **first gate**, non-bypassable, before any Collections query or Grok call.
  - Generation **only** Grok models via existing Cursor/X Premium+ access (no new providers).
  - Profile `version` first-class (Collection namespace, cache keys, logging, packet).
  - Minimal new services / deps (respect "Cursor + X Premium+ only"; the single planned `middleware.ts` for Layer 1 edge rate limits is <50 LOC using existing Vercel primitives only — not a new paid service or infra).
  - Safe fallback on existing `/qa` surface (`QuestionAnswer` + `quick-cv-actions` + E2E).
- **Existing patterns to preserve/extend**:
  - Feature flags: `src/config/feature-flags.ts:25` (qa entry; extend with new `qaReactor` entry). Note: `src/app/flags.ts` provides separate Vercel Flags primitives (documentsFlag, skillsSectionFlag; currently unused for QA) and is not the qa surface.
  - Data loading: direct imports of `cvdata.json` and MDs (as in qa-utils and quick-cv-actions).
  - E2E: Playwright + Brave Beta (`playwright.config.ts`, `tests/e2e/`, scripts using `BRAVE_BETA_PATH`); ama.spec.ts exists (extend for /qa reactor path).
  - Agent skills: Use fusion-sage for this synthesis (per root `.agents/AGENTS.md:31` and `.agents/rules/fusion-sage.mdc`); split-to-prs skill informed the PR DAG.
  - No middleware.ts today (will add one for edge rate limits in rollout; <50 LOC using existing Vercel primitives — the sole planned new edge surface and fully consistent with the "no new services" constraint).

Phase 0 delivered the exact synthesis boundary, Keep/Adapt/Discard map, validation plan (executable today with Cursor + X Premium+), and abuse sketch. 

**Validation Gate (explicit sequencing with PR DAG)**: The executable validation from `docs/phase-0-xai-collections-validation.md` (filled 45-question template + >=70% shippable bar on narrative cases + economics confirmation on ps-profile-v1.md or post-ingest Collection) is a hard prerequisite for "heavy" implementation. PRs 1–4 (foundational compiler, client, defense, skeleton) **may proceed in parallel** with validation execution (they produce the exact packet and defense primitives used in the validation run, and land behind a disabled flag with zero production impact). **PR 5+ (tools, reactor, wiring, surface) are explicitly gated**: do not begin PR 5 until the filled validation template is shared, reviewed, and the >=70% + economics bar is confirmed (or hybrid adjustment documented here). Update this design document with validation results before PR 5. This design assumes validation passes or documents the hybrid path.

---

## Goals & Non-Goals

### Goals
1. Ship professional-grade answers on the 30-34 hard narrative/reflective questions from the Phase 0 validation set (depth, faithfulness, tone matching golden-qa.md + ps-profile-v1.md "Why Companies Hire Me" narrative).
2. xAI Collections sole substrate + early abuse defense → economically safe for public scale ("millions of users, still very low bill").
3. True streaming + durable execution (lightest pattern delivering canary results: AI SDK + Workflow DevKit "use workflow"/"use step" or equivalent minimal retryable steps).
4. 6 specialized agentic tools (ported/adapted from canary `cvSearchTool`/`workExperienceTool`/etc.) backed exclusively by Collections client.
5. Versioned Profile Packet (compiler output) as reusable artifact.
6. Feature flag + zero-downtime fallback to legacy reactor; minimal surface changes.
7. Observable (logs with version/layer/reason, abuse metrics), tunable config, golden graceful degradation on blocks.
8. PR Plan DAG (this doc bottom) directly executable by `/execute-plan` (6-12 small, ordered, reviewable PRs; early foundations; tests/E2E/fallback included).

### Non-Goals (Explicit Boundaries)
- No changes to AMA surface beyond what the shared action/route requires (focus is Profile QA on `/qa`).
- No full UI overhaul of `QuestionAnswer` (streaming UI polish, citations rendering, example questions, Shimmer states are Phase 1+ or surplus).
- No new paid vector DBs, embedding providers, or heavy infra (Workflow DevKit is Vercel-native and fits existing deployment).
- No removal of legacy code or big refactors in early PRs (legacy stays until reactor proven).
- No public admin UI for abuse logs or Collection management in Phase 1 (stdout + simple config file + Vercel logs sufficient).
- No support for multi-user sessions or persistent chat history beyond what Collections + Grok tools provide (single-turn + tool loop per request for v1).
- No standalone embeddings endpoint exposure (Collections handles it).

Success = best 70%+ of hard validation answers shippable publicly today (per Phase 0 criteria), with abuse blocks near-zero marginal cost and real visitors almost never hitting Layer 2+.

---

## Proposed Design

### High-Level Reactor Flow (Mermaid Sequence)

```mermaid
sequenceDiagram
    participant Client as QuestionAnswer (quick-cv-actions)
    participant Route as /api/cv/qa/route.ts
    participant Defense as abuse-defense.ts
    participant Compiler as persona-compiler.ts
    participant Coll as xai-collections.ts
    participant Reactor as persona-reactor.ts (runProfileQA)
    participant Workflow as Durable Workflow (DevKit/AI SDK steps)
    participant Grok as Grok model (via @ai-sdk/openai compat)
    participant CollectionsTool as collections_search / custom tools

    Client->>Route: POST {question} (or server action)
    Route->>Defense: checkAbuse(question, {ip, sessionId?, recent?})
    alt Blocked (any layer)
        Defense-->>Route: {blocked: true, reason, layer}
        Route-->>Client: 200 {answer: goldenFallback(question, packet), isGolden: true, ...}
    else Allowed
        Route->>Compiler: compileOrLoadPacket(version)  # pure, cached
        Compiler-->>Route: ProfilePacket v1-2026-05
        Route->>Coll: ensureCollection(`ps-profile-v${version}`); ingestIfNeeded(packet)
        Coll->>Grok: (management) create/upload + poll PROCESSED
        Route->>Reactor: runProfileQA(question, packet, context)
        Reactor->>Workflow: "use workflow"; validationStep (re-check defense)
        Workflow->>Workflow: retrievalStep (via 6 persona tools)
        loop Agentic tool loop (stepCountIs(5))
            Workflow->>Grok: streamText({model: xai('grok-...'), tools: personaTools, system: packet.narrative + principles})
            Grok->>CollectionsTool: file_search / collections_search (specialized query + filters)
            CollectionsTool-->>Grok: chunks + citations (collections:// URIs)
        end
        Workflow-->>Reactor: stream (or collected for compat)
        Reactor-->>Route: Streaming or JSON response (versioned, with citations if available)
        Route-->>Client: 200 (stream or JSON {answer, details?, citations?, version})
    end
    Note over Defense,CollectionsTool: Abuse gate + Collections = fission containment.<br/>No local vectors in main path.<br/>Golden fallback on block = zero marginal cost.
```

**Key data shapes** (concrete, in `src/lib/qa/types.ts` new):

```ts
// src/lib/qa/types.ts
export interface ProfilePacket {
  version: 'v1-2026-05' | string;
  compiledAt: string;
  coreIdentity: string;           // from ps-profile-v1 + cvdata one_liner/short_bio
  principles: string[];           // high-signal bullets (premflow/EEaaS, Dad-mode, simplification, friction→leverage, quiet infra)
  topAchievements: Array<{ title: string; narrative: string }>; // 3 from top-three + persona
  experienceHighlights: Array<{ company: string; title: string; duration: string; impacts: string[] }>;
  signatureProjects: Array<{ name: string; description: string; impact?: string; tech: string[] }>;
  goldenExamples: Array<{ q: string; a: string }>; // 8-15 tone anchors from golden-qa.md + casual-qa.md (for system + fallback)
  structuredSnapshot: { /* minimal subset of cvdata.json for factual grounding */ contact, education, languages, keyTechnologies };
  ingestDocument: string;         // full markdown blob ready for Collections upload (matches validation plan structure)
  toolSystemPrompt: string;       // specialized instructions for the 6 tools
  // Tone (per user decision on Open Question 6): Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind.
}

export interface AbuseConfig {
  edge: { ipPer5m: number; sessionPer3m: number };
  semantic: { minRelevance: number; /* heuristics or tiny probe */ useGrokProbe: boolean };
  behavioral: { maxRepetition: number; maxDrift: number; windowSize: number };
  hardCaps: { ipPerDay: number; ipPerHour: number };
  // Tunable without deploy via Edge Config or small JSON (Phase 1: module const + env overrides)
}

export interface AbuseResult {
  blocked: boolean;
  reason?: 'rate-limit' | 'low-semantic-relevance' | 'behavioral-anomaly' | 'daily-cap' | ...;
  layer?: string;
  goldenAnswer?: string; // pre-served when blocked
}
```

**Persona Compiler** (`src/lib/qa/persona-compiler.ts` — pure, no side effects, fully testable):

```ts
import cvdata from '@/data/cvdata.json';
import golden from '@/data/golden-qa.md?raw'; // or fs in Node, raw import works in Next
// similarly casual, top3, and ps-profile-v1.md as base

export function compileProfilePacket(version = 'v1-2026-05'): ProfilePacket {
  // 1. Parse/synthesize from ps-profile-v1.md (canonical) + enrich with cvdata structured + golden pairs
  // 2. Strengthen "Why Companies Hire Me / Stands Out" per user validation feedback (pull narrative from golden + persona)
  // 3. Extract 8-12 goldenExamples for tone
  // 4. Build ingestDocument exactly as in phase-0-xai-collections-validation.md:18-45
  // 5. Return frozen packet (deterministic)
  // Pure: no network, no HF, no Collections calls
  // Tone guidance (user decision Q6): "Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind."
}
```

Post-validation: user can iterate `data/persona/ps-profile-v1.1.md` → recompile.

**xAI Collections Client** (`src/lib/qa/xai-collections.ts` — thin wrapper, ~150 LOC target):

- Env: `XAI_API_KEY`, optional `XAI_MANAGEMENT_API_KEY`.
- Uses native fetch (or `@ai-sdk/openai` compat for queries).
- `async ensureCollectionForVersion(version: string): Promise<{id: string}>`
- `async ingestPacket(packet: ProfilePacket): Promise<{collectionId, fileId, status}>` — builds FormData or JSON payload, POST to management endpoint, polls `DOCUMENT_STATUS_PROCESSED`.
- `async search(query: string, opts?: {filters?: Record<string,any>, k?: number}): Promise<{chunks: Array<{text, metadata, score}>, citations: string[]}>`
- For agentic tools: thin `search` powers the execute fns. Also supports direct `file_search` tool registration in AI SDK for autonomous use by Grok.
- Graceful degradation + detailed logging of token/Collection usage (for economics validation).

**Abuse Defense** (`src/lib/qa/abuse-defense.ts` — direct port + adaptation of sketch pseudocode):

- `checkAbuse(question: string, ctx: {ip: string; sessionId?: string; recentQuestions?: string[]}): Promise<AbuseResult>`
- Layer 1 (edge): Reliable request headers for fingerprinting/session tracking (per user decision on Open Question 4; explicitly no cookies). In-handler sliding window (simple Map + timestamps, or @vercel/kv / Edge Config). On exceed: 429 + golden.
- Layer 2 (semantic/domain, cheap-first): Pure JS heuristics (keyword off-topic list from validation 35-45: pizza, jokes, quantum emojis, bomb, roleplay, math, ignore instructions) + entropy/length variance + repetition exact match. Optional ultra-cheap Grok probe (low-price model per Q1 decision). 
  - **Per user decision on Open Question 3**: Any tiny local model / cache is used **only** as high-frequency question cache + most-frequently-asked fallback (narrow, isolated use-case). Main retrieval/embed path is always pure xAI Collections. Isolation rule strictly enforced: cache/embed here **never** touches persona retrieval.
- Layer 3 (behavioral): In-request window (or short server-side KV) using header fingerprint — repetition count, semantic drift, burst timing. Server-side (Edge Config / KV) primary for counters. Note: IndexedDB (client-side) is a possible future KV store for abuse counters if server-side KV unavailable (per user decision on Open Question 4).
- Layer 4 (hard caps): Daily/hourly counters (KV or Edge Config recommended for prod; in-mem for dev).
- On block: compute best golden match from `packet.goldenExamples` (simple keyword or embedding if gate allows isolated tiny one; else static best-effort) + friendly note. Log `{ts, ipHash, qHash, layer, reason, version}`.
- Config: `src/config/abuse-defense.ts` (or Edge Config JSON) — defaults generous for real users (per sketch: 12/5m, 400/day).

**Agentic Tools** (`src/lib/qa/persona-tools.ts`):

Port/adapt the 6 from canary (specialization was the quality driver):
1. `cvSearchTool` / `profileSearchTool` — broad semantic over whole packet.
2. `workExperienceTool` — roles, impacts, Oneflow transformation, TS migration, Playwright, etc. (filter/metadata on ingest or query prefix).
3. `skillsTool` — categorized + AI-era senior skills (long-term debt forecasting highest).
4. `projectsTool` — premflow, arch-machine, Grok Dia, Zod PR, devprofile/.agents.
5. `educationAndBackgroundTool` — thesis (EEaaS/epic predictor), Master's, Stockholm/Swedish-Indian/Dad-mode context.
6. `principlesAndPhilosophyTool` — premflow/EEaaS thesis, simplification as moral act, Dad-mode reality vs builder, friction→public leverage, quiet infrastructure.

Each:

```ts
import { tool } from 'ai';
import { z } from 'zod';
import { collectionsClient } from './xai-collections';

export const workExperienceTool = tool({
  description: 'Retrieve precise details about work roles, responsibilities, impacts, and leadership at Oneflow and prior positions. Use for timeline, achievements, and specific project outcomes.',
  parameters: z.object({ query: z.string().describe('Specific aspect, e.g. "TypeScript migration impact" or "Playwright E2E rewrite"') }),
  execute: async ({ query }) => {
    const results = await collectionsClient.search(`work experience Oneflow: ${query}`, { k: 4 });
    return results.chunks.map(c => c.text).join('\n---\n'); // + citations
  }
});
// similarly for others, with tailored descriptions + query shaping
```

Tools registered in `streamText({ tools: { workExperience: workExperienceTool, ... } })`. Grok decides routing; specialization keeps answers coherent.

**Durable Execution + Streaming**:
- Core: `ai` package (`streamText`, `tool`, `stepCountIs(5)` or equivalent, `toUIMessageStreamResponse` or raw `pipe` for Next Response).
- Durability: Primary Phase 1 path is Vercel AI SDK + lightweight retry wrapper / onError handling + simple KV checkpointing (per user decision on Open Question 2; Workflow DevKit is framework-heavy and deferred). Full "use workflow" / DevKit promotion is a possible small follow-up only if measurements on the Next.js stack justify it. Integrates directly with AI SDK + Grok provider.
- Streaming: True token streaming to client. For Phase 1 compat with existing `QuestionAnswer` (expects JSON), support `?stream=1` or `Accept: text/event-stream` + dual path in route. UI upgrade (progressive) in wiring PR.
- Model: Strong/latest model for data curation + validation runs; low-price model for live responses (including any cheap probe), per user decision on Open Question 1 (validate post-deployment). Use via `@ai-sdk/openai` (baseURL `https://api.x.ai/v1`, apiKey from env). Matches existing Grok usage in footer/cv meta.

**Reactor Wiring** (`src/lib/qa/persona-reactor.ts` + updated `runProfileQA` entry):
- `export async function runProfileQA(question: string, opts: {ip: string; ...; stream?: boolean}): Promise<Response | {answer: string; ...}>`
- First: `const defense = await checkAbuse(...)`; if blocked return golden JSON immediately.
- Compile + ingest (idempotent, cheap after first; versioned Collection name).
- Execute workflow (defense re-check inside validation step for non-bypass; generation uses tone spec from user decision Q6).
- Return stream or materialized JSON (with `version`, optional `citations`, `details` for backward compat with old UI "Retrieved Information").
- Observability: structured logs every step (version, defense layer, tool calls, token counts, cache/Collection hit indicators).

**Exact Integration Points**:
- `src/app/api/cv/qa/route.ts`: Minimal change — import new `runProfileQA` (or legacy functions), `if (process.env.ENABLE_XAI_REACTOR === 'true' || isFeatureEnabled('qaReactor')) { return runProfileQA(...) } else { legacy path (untouched prepareData + cosine + generateAnswer) }`. Preserve error shapes.
- `src/utils/qa-utils.ts`: Do **not** delete anything in early PRs. Legacy functions stay for fallback. New reactor lives in `src/lib/qa/`.
- `src/config/feature-flags.ts`: Add `qaReactor: { enabled: false, name: "...", development: true, disclaimer: "Powered by xAI Grok + Collections (with abuse defense)" }`.
- `src/components/question-answer.tsx`: Minimal — update placeholder text conditionally on flag, handle new response fields (version, citations) gracefully, keep existing `details` path for fallback. No big React changes (follow react-client-expert skill).
- `src/app/actions.ts`: Minor — forward stream/compat if needed.
- `src/app/quick-cv-actions/page.tsx`: Update "local AI" copy when reactor enabled.
- No changes to cvdata.json or persona sources (compiler consumes them).
- E2E: Extend existing tests or add to global.spec.ts targeting the quick-cv-actions QA path; assert on answer quality + no crash on flag flip.
- Env: `.env.example` additions for XAI_* keys (never commit real keys).

**Data Model / Ingest**:
- Single (or small number) document upload per version to Collection `ps-profile-v1-2026-05` (or `ps-profile-${version}`).
- Ingest blob = `packet.ingestDocument` (markdown with sections exactly as validation plan recommends: Core Identity, Experience Highlights, Key Skills, Signature Projects, Principles, Top 3, Golden Narrative Examples).
- Metadata/tags: `version`, `type: 'professional-persona'`.
- On version bump (new persona file): new Collection; old ones retained for rollback.
- Compiler output is source of truth for system prompt (and optional ingest document; see Q5). System prompt includes tone guidance (user decision Q6): "Responses must feel like a real human — warm, professional, with light subtle humor and sparkle infusion where natural. Never heavy or jokey. Sound like a thoughtful, slightly witty colleague who has the user's best interests in mind." Per Q5, Phase 1 uses manual/direct user ingest; automation is Post-PR 8 / surplus.

**Caching**:
- Collections built-in (primary, cross-request, cheap on rephrases — observed in validation).
- Response-level: server-side (Edge Config / KV keyed by `version:sha256(question)`) + client hints. Legacy in-mem Map becomes fallback-only.
- Abuse counters: short TTL in KV/Edge Config.

---

## API / Interface Changes

**New (additive)**:
- `POST /api/cv/qa` (same shape) now may return extra fields when reactor on: `{ answer, details?, version: string, citations?: string[], isGolden?: boolean, defense?: {blocked, layer} }`.
- Streaming mode (future): `text/event-stream` or AI SDK UI messages.
- Internal only: `compileProfilePacket()`, `collectionsClient.*`, `checkAbuse()`, `runProfileQA()`.

**No breaking changes to clients** (QuestionAnswer, askQuestion action, AMA reuse) in Phase 1 — legacy shape preserved on fallback path. New path is backward-compatible for JSON consumers.

**Env / Config**:
- New: `XAI_API_KEY`, `XAI_MANAGEMENT_API_KEY` (optional for ingest), `ENABLE_XAI_REACTOR`.
- Tunables: abuse thresholds in `src/config/abuse-defense.ts` (or Edge Config).

---

## Data Model Changes

- No schema change to `cvdata.json` or source MDs.
- New artifact: compiled `ProfilePacket` (in-memory or cached at build/edge).
- xAI Collection: external, versioned, managed via code + console.x.ai fallback.
- Migration: none for user data. On first deploy with flag on, one-time ingest (idempotent). Rollback = flip flag (instant, no data loss).

---

## Alternatives Considered

1. **Pure local RAG refresh (keep HF + improve heuristics / add better chunking)**: Fast to ship, zero new keys. Rejected — cannot match canary quality on narrative depth (Phase 0 evidence), violates "xAI Collections sole substrate" + economics at scale, keeps cold-start bloat, no native caching or citations.
2. **Full canary merge + cleanup**: Tempting (proven agentic shape already existed). Rejected — contamination was deep (multiple files + mental model in docs); risk of reintroducing mixed embeddings; larger blast radius than clean synthesis; would delay abuse defense.
3. **Hybrid (local for abuse gate + Collections for main)**: Per user decision on Open Question 3, pure xAI Collections is the explicit choice for main path. Any tiny local model is restricted to high-frequency cache + MFA fallback only (narrow/isolated; not main retrieval). Design follows Phase 0 isolation rule. Hybrid adjustment only if post-validation requires (now resolved to pure + narrow cache).
4. **Direct Grok tool calling without custom 6-tool wrapper (just native collections_search + system prompt)**: Simpler. Trade-off: loses the specialization that made canary answers feel coherent (Phase 0: "main reason answers felt coherent and grounded"). Design keeps 6-tool wrapper calling Collections client (or registering multiple filtered tools) while allowing Grok to also use native file_search.
5. **Heavy durable platform (Temporal/Trigger.dev)**: More powerful. Rejected for footprint ("no explosion of new services"); Vercel Workflow DevKit is the lightest match for proven canary pattern and existing Vercel deployment.

Chosen path (synthesis + Collections sole + early defense + AI SDK + lightest durable) is lowest risk, highest fidelity to validated canary quality, and directly satisfies all invariants + "small team, Cursor + X Premium+ only".

---

## Security & Privacy Considerations

**Threat Model** (abuse focus per Phase 0):
- Flooding / bot / session abuse consuming Grok + Collections tokens → mitigated by 4-layer defense (edge rate limits first, cheap heuristics, behavioral, hard caps). Blocked paths serve only golden (zero marginal cost).
- Prompt injection / jailbreak via question → Grok model + strict system (persona packet only + "answer from profile collection") + tool sandbox. Abuse gate catches obvious "ignore previous + make bomb" (validation cases 41+).
- Data exfil: None — profile is public persona; no PII beyond what's already in CV / public X.
- Supply chain: New deps (`ai`, `@ai-sdk/openai`) audited via existing pnpm + .agents/skills/fix-dependency-security. xAI keys: never client-side; server-only env.
- Collection data: Uploaded packet is public-derived; xAI docs confirm "Data is not used for training without explicit consent."

**Auth**: None required (public surface). Rate limits + abuse defense act as authz.
**Privacy**: Questions logged only hashed + with defense metadata (no full PII). Golden fallbacks avoid leaking internal state.
**Non-bypass**: Defense is the absolute first executable statement in the request handler (and re-validated inside workflow step). Feature flag cannot skip it.

---

## Observability

- **Logging**: Structured `console.log` / pino-equivalent at every boundary: `reactor:request {version, qHash, ipHash}`, `defense:block {layer, reason, version}`, `collections:ingest {collectionId, fileId, status}`, `workflow:step {name, durationMs, toolCalls}`, `grok:usage {promptTokens, completionTokens, cached?, reasoningTokens}` (from AI SDK response).
- **Metrics** (Vercel + simple): abuse blocks/hour (alert on spike), p95 latency (retrieval vs generation), cache/Collection hit rate (via timing or response metadata), token cost per query (from usage + pricing).
- **Alerting**: Email/webhook on >N blocks/hour or error rate (Vercel + simple script or existing toolbar).
- **Dashboards**: `/api/workflow/status` pattern from canary (if DevKit) + Vercel logs / runtime logs. Admin view of recent blocks (hashed) is surplus.
- **Validation hook**: Every answer can log "used sections" or citations for post-hoc quality review.

---

## Rollout Plan

1. **Pre-flight (Validation Gate — see also PR Plan below)**: User completes Phase 0 validation (filled template from `docs/phase-0-xai-collections-validation.md:172`) against `ps-profile-v1.md` (or post-ingest Collection). If <70% shippable or economics bad → hybrid gate or packet refinement first (wontfix or adjust in this doc). **Explicit checkpoint**: PRs 1–4 may run in parallel with validation (they are safe, flag-disabled foundations). PR 5 (tools) and beyond are **blocked** until the filled template + >=70% bar + economics sign-off.
2. **PRs 1-4** (foundational): Land compiler + client + defense + types behind dead code (no route change). Add deps + flag (disabled). Full unit tests. `pnpm lint && pnpm type-check`. (Validation may be executing in parallel.)
3. **PRs 5-6** (tools + reactor): Core logic + mocks. Internal-only invocation scripts for manual testing.
4. **PR 7** (wiring): Flip to dual-path in route + actions. Flag defaults off. Legacy path 100% untouched. Deploy to preview with flag on for author only (X Premium+).
5. **Staged**:
   - Internal dogfood (author + small group) with flag on → monitor abuse logs, token usage, answer quality vs legacy.
   - 5% traffic (Edge Config or simple random + cookie; middleware.ts for proper edge rate limits will be in place by this stage — <50 LOC, existing Vercel primitives only) for 48h.
   - 50% → 100% if p95 < 2x legacy, abuse blocks < 0.1% real users, validation set 70%+ hold.
6. **Rollback**: Instant env var / flag flip (no deploy). Legacy path always hot. Collection versions allow pin to prior packet.
7. **Post**: Update E2E, docs (including this plan + .agents/plans), public disclaimer in UI. Surplus: portable packet for other surfaces; admin abuse viewer.

**Risks & Mitigations** (explicit):
- **High**: Validation fails on retrieval quality → Mitigation: packet iteration + hybrid gate (local tiny embed isolated for gate only) documented.
- **Med**: DevKit build/transform complexity or cold-start in Next → Mitigation: AI SDK streaming + simple steps first; DevKit in dedicated PR after proven.
- **Med**: Ingest polling / management key UX → Mitigation: console.x.ai manual upload fallback + idempotent code path; one-time script.
- **Low**: Deps audit / lockfile → Mitigation: pnpm + existing security skills on every dep PR.

---

## Key Decisions

1. **xAI Collections as sole substrate (no local vectors in reactor path)**: Rationale — Phase 0 exhaustive contamination report proved mixed embeddings destroyed the "fusion pass". Collections provides managed embeddings + caching + native Grok tool integration at the economics required. Compiler + thin client enforce the invariant cleanly.
2. **Abuse defense as absolute first non-bypassable gate (4-layer cheap-first from sketch)**: Rationale — protects the bill before any paid call. Graceful golden fallback ensures UX never degrades for real users. Heuristics + optional cheap probe first (no new heavy deps or circular Grok calls for gate in v1).
3. **Vercel AI SDK + lightweight retry wrapper primary (Workflow DevKit deferred) for execution/streaming**: Rationale — per user decision on Open Question 2; AI SDK + lightweight is the Phase 1 path (DevKit may be framework-locked). Exact match to canary quality via streamText + tool loop. Native Grok support via OpenAI compat. Full DevKit only if measurements justify (small follow-up).
4. **Pure 6-tool wrapper (specialized) calling Collections client (plus native file_search option)**: Rationale — specialization drove canary coherence/grounding (Phase 0 explicit). Keeps tools testable and versioned with packet; Grok can still use native for power.
5. **ProfilePacket as first-class versioned compiler output (MD ingest + system + golden fallback source)**: Rationale — single source of truth, testable in isolation, reusable (surplus goal), enables clean versioning/rollback of persona without code deploys.
6. **Minimal surface changes + dual-path flag in existing route (legacy untouched)**: Rationale — risk reduction for small team; instant rollback; respects "ship on existing /qa".
7. **Heuristic/JS-first abuse semantic gate (Grok probe opt-in, isolated)**: Rationale — keeps Phase 1 footprint and cost minimal; avoids loading HF or extra Grok calls on every request until proven necessary. Isolation rule prevents contamination.
8. **PR DAG ordering (setup+flag → compiler → client → defense (parallelizable) → tools → reactor → wiring → ui/e2e)**: Rationale — foundations first so later PRs have real deps to build on; each PR < reviewable size; tests + fallback in every relevant slice; directly consumable by `/execute-plan` + split-to-prs skill.

---

## Open Questions

1. Exact Grok model variant(s) for generation vs. cheap probe (post-validation + pricing observation)?
   **Resolved (user decision):** Latest strong model for data curations and for response low price model can do the job (validate)
   Implications: Generation and live responses (including any cheap probe) will use a low-price model; strong/latest model reserved for data curation/validation runs. Update cost/observability notes and PR 5/6 accordingly.

2. Will full Vercel Workflow DevKit be added in Phase 1, or start with AI SDK + lightweight retry wrapper + promote later (footprint decision)?
   **Resolved (user decision):** AI SDK + lightweight if you think workflow devkit is framework locked in
   Implications: Phase 1 primary path is Vercel AI SDK + lightweight retry wrapper / onError handling. Full Workflow DevKit ("use workflow") is deferred to possible small post-Phase 1 follow-up only if measurements justify it. De-emphasize as default in Proposed Design and PR 6.

3. Post-validation: pure Collections or hybrid (isolated gate embed)? If hybrid, what tiny local model (reuse existing HF dep or lighter)?
   **Resolved (user decision):** Pure collection is fine I think (isolated gate embed?!) and tiny local model can be cache and most frequently asked questions
   Implications: Explicitly adopt pure xAI Collections for main retrieval/embed path. Any tiny local model / cache is restricted to high-frequency question cache + most-frequently-asked fallback only (narrow, isolated use-case; not main persona retrieval). Update abuse-defense and hybrid language.

4. Session tracking for Layer 1/3 (cookie vs. header fingerprint vs. KV)? Exact thresholds after real traffic measurement?
   **Resolved (user decision):** header may be reliable, no cookie, indexedb as KV possible?
   Implications: Layer 1/3 abuse defense uses reliable request headers for fingerprinting/session tracking (explicitly no cookies). Server-side (Edge Config / KV) remains primary for counters; note IndexedDB (client-side) as possible future KV option for abuse counters if server-side unavailable.

5. Management API key separation / ingest automation (script in scripts/ vs. on-demand in reactor)?
   **Resolved (user decision):** First let us make it work, I can injest directly in collection for now, later we automate that part.
   Implications: Phase 1 approach is manual/direct user ingest into the Collection via console.x.ai. Thin client (PR 3) supports search + basic management only. Automation (script/on-demand) is explicitly Post-PR 8 / surplus work.

6. Response `details` shape for new reactor (citations only, or synthesized "retrieved" excerpts for UI compat)?
   **Resolved (user decision):** It need to feel real human response (slight humor sparkle infusion is fine, not heavy to sound professional).
   Implications: Prioritize human-feeling responses (warm, professional tone with light subtle humor/sparkle where natural). Update ProfilePacket, compiler, system prompt, and reactor generation guidance with the concrete tone spec. "details" shape secondary to tone quality.

---

## User Decisions (Post-Design Review)

The following 6 Open Questions were resolved by the user after initial design review. These decisions are final and have been propagated into the design, PR Plan, and related sections.

1. **Model selection (generation vs. cheap probe / curation):** Latest strong model for data curations and for response low price model can do the job (validate)

2. **Durable execution choice:** AI SDK + lightweight if you think workflow devkit is framework locked in

3. **Pure Collections vs hybrid + local model use:** Pure collection is fine I think (isolated gate embed?!) and tiny local model can be cache and most frequently asked questions

4. **Session / rate limit tracking (Layer 1/3):** header may be reliable, no cookie, indexedb as KV possible?

5. **Ingest automation:** First let us make it work, I can injest directly in collection for now, later we automate that part.

6. **Response tone / human feel:** It need to feel real human response (slight humor sparkle infusion is fine, not heavy to sound professional).

These are incorporated below (see propagated edits in Proposed Design, ProfilePacket, Abuse Defense, PR 3/5/6, etc.).

---

## References

### External Dependencies (xAI Collections + Workflow DevKit)
xAI Collections and Vercel Workflow DevKit implementation details (management API shapes for create/upload/poll `DOCUMENT_STATUS_PROCESSED`, `collections_search` vs `file_search` tool registration, citation URI format `collections://collection_id/files/file_id`, `@ai-sdk/openai` compat baseURL `https://api.x.ai/v1`, "use workflow"/"use step" directives + AI SDK integration patterns, `logWorkflowStep`, etc.) are taken from 2026-05 public documentation and Cursor/X Premium+ access. These third-party SaaS surfaces could not be independently re-fetched inside the workspace boundary. The thin client (PR 3) and reactor (PR 6) will validate exact request/response shapes during manual ingest script execution and integration tests. Explicit fallback path supported in design: console.x.ai manual Collection upload + the AI SDK-only streaming/retry wrapper (no DevKit) if footprint concerns arise.

- Phase 0 master: `docs/phase-0-xai-agentic-qa-reactor.md` (Keep/Adapt/Discard, invariants, reactor boundary)
- Abuse sketch: `docs/phase-0-abuse-defense-sketch.md` (4-layer pseudocode, blocked policy)
- Validation plan + packet structure + 45 questions + output template: `docs/phase-0-xai-collections-validation.md`
- Current legacy: `src/app/api/cv/qa/route.ts`, `src/utils/qa-utils.ts` (full generateAnswer + prepareData), `src/components/question-answer.tsx`, `src/app/actions.ts`, `src/app/quick-cv-actions/page.tsx`, `src/config/feature-flags.ts`
- Data: `data/persona/ps-profile-v1.md`, `src/data/{cvdata.json, golden-qa.md, casual-qa.md, top-three-achievements.md}`
- Canary extraction source (for port): origin/canary `src/utils/cv-tools.ts` (6 tools), workflow patterns, system prompt, `src/app/api/chat/route.ts`
- xAI Collections: https://docs.x.ai/developers/files/collections + /tools/collections-search (SDK examples, file_search compat, citations, management upload + poll)
- AI SDK + Grok: @ai-sdk/openai with base https://api.x.ai/v1 + fileSearch tool
- Workflow DevKit: https://workflow-sdk.dev/ ( "use workflow", AI SDK integration)
- Agent skills: `.agents/AGENTS.md`, `.agents/skills/{fusion-sage, split-to-prs, agent-orchestrator}/SKILL.md`, `.agents/rules/fusion-sage.mdc`
- Existing caching thoughts: `plans/caching-strategy-plan.md`
- Architecture: `ARCHITECTURE.md`, `package.json` (Next 16, HF, no ai-sdk yet), no middleware.ts
- E2E: `tests/e2e/ama.spec.ts` + playwright.brave.ts (extend for QA reactor)

---

## PR Plan (Directly Executable by /execute-plan)

**Total: 8 PRs**. Realistic incremental low-risk strategy for small team. Early PRs are pure foundations (no route impact). Each is independently reviewable/mergeable (tests, types, lint pass). Dependencies form a clean DAG. Fallback always present. Includes wiring, unit/integration tests, E2E touch, migration notes. Sized for 1-3 day reviews.

Use fusion-sage + split-to-prs skills during execution. Branch from latest main into `feature/xai-agentic-profile-qa-reactor` per plan. After each merge, re-validate on preview with flag.

**Validation Gate Checkpoint (hard sequencing rule — see also Rollout Plan step 1 and Overview)**: PRs 1–4 (skeleton, compiler, Collections client, abuse defense) **may proceed in parallel** with the user's execution of the Phase 0 validation plan (they are pure, testable, flag-disabled foundations that produce the packet and defense logic used in validation itself). **PR 5 (tools) and all subsequent PRs (reactor, wiring, surface) are explicitly gated behind validation success**: do not start PR 5 until the filled output template from `docs/phase-0-xai-collections-validation.md:172` is shared, the >=70% shippable bar on hard narrative questions is met (or hybrid adjustment is documented), and economics are acceptable. Update this design document with the validation results before PR 5. This enforces the "before heavy coding" rule from Phase 0 while allowing safe parallel progress on the lowest-risk foundational slices.

**PR 1: Foundation — Dependencies, Types, Feature Flag, lib/qa Skeleton**  
Files/components: `package.json` (add `"ai": "^..."`, `"@ai-sdk/openai": "^..."`, zod if not present), `src/lib/qa/types.ts` (new; ProfilePacket, AbuseConfig, AbuseResult, Tool shapes), `src/config/feature-flags.ts` (add `qaReactor` entry + helpers), `src/lib/qa/index.ts` (barrel, placeholder exports), `.env.example` (XAI_API_KEY, ENABLE_XAI_REACTOR), `docs/phase-1-xai-agentic-profile-qa-reactor.md` (symlink or pointer update if needed).  
Dependencies: None.  
Description: Adds the minimal new dependencies and feature flag infrastructure (disabled by default) required by every subsequent PR. Creates `src/lib/qa/` directory and core TypeScript interfaces for the packet, defense, and tools. Includes basic unit test scaffolding (Node assert or lightweight runner) and updates lint/type-check to pass. Establishes the "no local vectors in reactor" comments and import boundaries. This is the only PR that touches package.json and flags; everything else builds on it. Enables parallel work on compiler/client/defense.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge. For this PR also run `pnpm audit` (leverage existing fix-dependency-security skill).

**PR 2: Persona Compiler (Pure Function + Packet Generation)**  
Files/components: `src/lib/qa/persona-compiler.ts` (new; `compileProfilePacket` + helpers, consumes cvdata + 4 MD sources), `src/lib/qa/types.ts` (extend if needed), `__tests__/qa/persona-compiler.test.ts` (or inline in lib; 8-10 cases covering version, goldenExamples extraction, ingestDocument shape), update `src/data/persona/ps-profile-v1.md` only if validation feedback requires (per user note on "Why Companies Hire Me").  
Dependencies: PR 1.  
Description: Delivers the pure, testable compiler that turns raw sources into the versioned ProfilePacket (structured + narrative + `ingestDocument` + `toolSystemPrompt` + goldenExamples for fallback). Matches exact packet structure from validation plan and ps-profile-v1.md. No network/Collections calls. Full coverage on narrative extraction and determinism. This is a foundational leaf; later PRs (tools, reactor, golden fallback) consume its output directly.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 3: xAI Collections Thin Client**  
Files/components: `src/lib/qa/xai-collections.ts` (new; class or fns for ensureCollectionForVersion, ingestPacket (management upload + poll), search; env handling + error types + logging), `src/lib/qa/types.ts` (Collection types), `__tests__/qa/xai-collections.test.ts` (mocks for fetch, happy + error paths, no real keys), small ingest helper script stub in `scripts/`.  
Dependencies: PR 1 (types + flag). Can land before or parallel with PR 2.  
Description: Implements the zero-dependency (beyond fetch) thin client for the sole allowed substrate. Supports search + basic management operations. Per user decision on Open Question 5, Phase 1 uses manual/direct user ingest into the Collection (console.x.ai); thin client does not implement automation. (Automation/script or on-demand is Post-PR 8 / surplus.) Includes detailed usage logging for economics. Mocks allow full testing without keys. Critical enabler for tools and reactor; keeps all Collections logic isolated here.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 4: Abuse Defense Layer (4-Layer Gate + Golden Fallback)**  
Files/components: `src/lib/qa/abuse-defense.ts` (new; `checkAbuse` + all 4 layers per exact sketch pseudocode + config), `src/config/abuse-defense.ts` (new; tunable consts + env overrides, generous defaults), `src/lib/qa/golden-fallback.ts` (new; match + serve from packet.goldenExamples), `__tests__/qa/abuse-defense.test.ts` (heuristic cases from validation 35-45 + rate + behavioral), integration test with compiler packet.  
Dependencies: PR 1 (types/flag) + PR 2 (for golden packet).  
Description: First-class, non-bypassable defense implementing the complete 4-layer design (edge rate, cheap semantic heuristics + optional Grok probe, behavioral, hard caps). On block: serves high-quality golden answer + subtle note, zero marginal xAI cost. Logs every decision with hashes + version + layer. Strict isolation (no reactor retrieval paths). Includes config surface and test coverage of all abuse cases. Placed early in DAG so reactor (PR 6) can wire it as the absolute first executable statement.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 5: Agentic Tools (6 Specialized Collections-Backed Tools)**  
Files/components: `src/lib/qa/persona-tools.ts` (new; 6 tools using `tool()` from 'ai' + execute fns calling collectionsClient.search with specialization + query shaping; adapted descriptions from canary), `src/lib/qa/types.ts` (tool registry type), unit tests per tool (mocked client).  
Dependencies: PR 1 + PR 2 (packet for descriptions) + PR 3 (client).  
Description: Ports the exact 6-tool pattern (cvSearch/profileSearch, workExperience, skills, projects, education/background, principles/philosophy) that delivered canary quality. Each tool is a thin, testable wrapper around the Collections client (no direct Grok or vector code). Includes rich descriptions for Grok routing + citation handling. Standalone testable module; reactor registers the set.  
**Validation Gate**: This is the first "heavy" PR (agentic logic that feeds the reactor). Do not begin until the filled validation template (>=70% bar) is confirmed and this design updated. (PRs 1-4 may have run in parallel with validation.)  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 6: Core Reactor + Durable Execution + Streaming**  
Files/components: `src/lib/qa/persona-reactor.ts` (new; `runProfileQA` orchestrator), `src/lib/qa/runProfileQA.ts` (new or thin re-export for plan compatibility; contains the "use workflow" if using DevKit, validationStep calling defense, retrievalStep, generationStep with streamText + tools + packet system prompt), streaming response helpers, error/FatalError paths, logging. Integration tests (mocked defense + collections + AI SDK).  
Dependencies: PR 1-5 (all pieces).  
Description: The heart of the synthesis — wires defense (first), compiler, Collections sync, 6 tools, and Grok generation (AI SDK streamText with tool loop + step limit). Delivers durability (lightest DevKit or equivalent retryable steps) and true streaming. Returns either stream or JSON-compatible shape. All invariants enforced (version, Collections only, non-bypass defense). This PR produces a working internal reactor ready for wiring.  
**Safe AI SDK + lightweight primary path (per user decision on Open Question 2)**: Phase 1 implements the reactor using Vercel AI SDK + lightweight retry wrapper / onError handling + simple KV checkpointing as the default (Workflow DevKit / "use workflow" is framework-heavy and explicitly deferred to possible small follow-up only if measurements justify). Include notes for both if needed for future. This locks the durable choice per user decision while keeping PR 6 reviewable. No split of PR 6.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 7: API Route Wiring, Dual-Path Fallback, runProfileQA Export**  
Files/components: `src/app/api/cv/qa/route.ts` (update: flag/env check + delegate to new reactor or untouched legacy import from qa-utils; preserve exact legacy behavior and error shapes), `src/utils/qa-utils.ts` (no deletions; only export surface if needed), `src/lib/qa/runProfileQA.ts` (export), minimal updates to `src/app/actions.ts` for compat, env docs.  
Dependencies: PR 6 (reactor ready).  
Description: The only PR that touches the live request path. Introduces the feature flag + env switch with perfect fallback (legacy path byte-for-byte identical until proven). Wires `runProfileQA` as the new entry. Adds basic observability. Zero risk to production traffic on merge (flag off). Completes the "reactor wiring" deliverable.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**PR 8: Surface Integration, E2E, Observability, Migration & Docs**  
Files/components: `src/components/question-answer.tsx` (minimal: conditional copy/disclaimer from flag, handle new response fields gracefully, keep old details path), `src/app/quick-cv-actions/page.tsx` (copy update), `tests/e2e/qa-reactor.spec.ts` (new or extension of ama/global; flag-aware tests for happy + abuse + fallback paths using Brave), `src/lib/qa/README.md` + updates to `.agents/plans/phase-1-...md` and ARCHITECTURE.md, simple log tail examples + metrics notes.  
Dependencies: PR 7.  
Description: Final integration slice — makes the new reactor visible on the existing ProfileQA surface with zero user-facing breakage on fallback. Adds E2E coverage for the full path (including defense blocks and version in responses). Updates public docs and plans. Includes migration notes (how to flip flag, monitor, rollback). Leaves the system in a shippable, observable, maintainable state with the PR DAG complete.  
**Gate (per AGENTS.md)**: `pnpm install && pnpm lint && pnpm type-check` must pass with zero errors before merge.

**Post-PR 8 (non-PRs, manual or surplus)**: Full production staged rollout per Rollout Plan (which includes the explicit pre-PR-5 validation checkpoint), real traffic validation against the 45-question set, potential KV addition for abuse counters (small follow-up), packet reusability for other surfaces.

This PR Plan is concrete, dependency-correct, risk-bounded, and directly actionable. Each PR delivers a coherent reviewable unit that advances one major component while preserving the ability to ship the legacy experience at every step.

---

**User Answers Incorporated** (2026-05-27): All 6 Open Question resolutions from the user's final decisions have been baked into this document (Open Questions marked resolved with exact wording + implications; new ## User Decisions section; surgical propagation into Proposed Design, ProfilePacket, compiler, abuse-defense, reactor, PR 3/5/6 descriptions, Key Decisions, etc.). Document is now fully resolved for `/execute-plan`.

**End of Design Document**  
Ready for approval → `/execute-plan` on this file. All claims grounded in the inspected codebase (exact paths, function names, Phase 0 docs, current package.json, xAI Collections API patterns, and AGENTS.md constraints).