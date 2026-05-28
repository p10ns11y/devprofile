# xAI Agentic Profile QA Reactor — lib/qa (Post-PR8)

**Status (PR8 complete)**: Surface integration, E2E (Brave Beta), observability, migration & docs. PR7 dual-path is production-clean (0 reviewer issues).

This directory is the **sole home** for the new reactor. Legacy QA (`src/utils/qa-utils.ts` + old `/api/cv/qa` logic) is untouched and bit-for-bit identical when the flag is off.

## Architecture after PR8

```
Client surfaces (PR8)
├── src/app/quick-cv-actions/page.tsx          ← dedicated demo surface + conditional reactor badge (client flag)
└── src/components/question-answer.tsx         ← legacy shared QA form (kept for compatibility)
    └── fetch(/api/cv/qa)  OR  server action askQuestion (actions.ts)

Dual-path decision (PR7, never changes legacy source)
├── src/app/api/cv/qa/route.ts                 ← if (isQARectorEnabled()) { runProfileQA + toLegacyCompatible or stream } else { exact pre-PR7 legacy }
└── src/app/actions.ts (askQuestion)           ← guard for /qa + quick-cv-actions (dual-path)

Reactor core (defense-first, Collections-only)
src/lib/qa/
├── runProfileQA.ts        ← public surface + isQARectorEnabled() + toLegacyCompatible + collectFullText
├── persona-reactor.ts     ← runProfileQAReactor (streamText + tools + non-bypassable checkAbuse first)
├── persona-tools.ts       ← 6 Collections-backed tools (PR5)
├── xai-collections.ts     ← sole substrate client (PR3)
├── abuse-defense.ts       ← checkAbuse + golden fallback (PR4)
├── persona-compiler.ts    ← ProfilePacket (PR2)
├── durable-retry.ts       ← lightweight wrapper (Q2)
├── types.ts + index.ts    ← contracts + barrel
└── README.md (this file)
```

**Invariants (never violated)**:
- xAI Collections = sole retrieval/embedding substrate.
- NO local vectors/embeddings/HF models on reactor path.
- Abuse defense = absolute first executable statement (zero cost on block).
- Flag (qaReactor + ENABLE_XAI_REACTOR) controls **everything**. Off = byte-identical legacy execution, zero logs, zero risk.

## Feature Flag & Env (single source of truth)

- `src/config/feature-flags.ts` → `qaReactor: { enabled: false, ... }`
- `isQARectorEnabled()` in `runProfileQA.ts`:
  - `ENABLE_XAI_REACTOR=true` (env) wins (dev override).
  - Else falls to the flag.
- When off (default): callers in route/actions execute **only** the legacy block. Reactor code is never imported/executed.

## Observability (PR8+)

- **Logs**: `[persona-reactor][v:VERSION][layer] msg` (defense, generation, durable, etc.)
- **Response headers** (reactor path):
  - `X-QA-Reactor: 1`
  - `X-QA-Version: v1-2026-05` (or current packet version)
- **UI surfaces** (PR8): tiny conditional emerald badge/panel in `question-answer.tsx` + landing card note in `quick-cv-actions/page.tsx`.
  - Rendered **only** when `_usedReactor`/`_reactorVersion` (from headers) **or** client `isFeatureEnabled("qaReactor")`.
  - Includes defense layer + golden fallback indicator.
  - **Completely absent** in legacy mode (exact DOM + text + styles as pre-PR8).
- Body responses (non-stream): still `{answer, details:[]}` for compatibility. Future surplus can extend safely.

## Migration Notes (from Legacy to Reactor)

1. **Zero-downtime rollout**:
   - Default: flag=false → 100% legacy, identical to 2025-era CV QA.
   - Flip `qaReactor.enabled = true` in source (or set env) → instant reactor for all callers.
   - No code paths in legacy touched since PR1.

2. **Call sites updated in PR7 (do not touch again)**:
   - `/api/cv/qa` POST (new ProfileQA on /qa + other clients)
   - `askQuestion` server action (AMA page + quick-cv-actions)

3. **Response compatibility**:
   - All existing clients receive identical shape.
   - New consumers can read headers or (future) extended body for version/defense.

4. **Streaming**:
   - Opt-in: `?stream=1`, `Accept: text/event-stream`, or `x-qa-stream: true`.
   - Returns plain text stream + the two X-QA-* headers.
   - Current UI clients use JSON path (perfect fallback).

5. **Defense & Golden**:
   - Blocks before any Collections/Grok spend.
   - `computeGoldenFallback` uses real PR2 packet + Q6 tone (warm, professional, sparkle).
   - E2E/unit tests use "ignore all previous...", "bomb", short queries as triggers.

6. **Post-PR8 surplus (automation deferred per Q5)**:
   - `scripts/manual-ingest.ts` + `ingestPacket` for console.x.ai direct uploads.
   - No auto-ingest in reactor.

## Enabling for Development / Testing

```bash
# Full reactor (requires XAI_API_KEY + real @ai-sdk/xai wiring in consuming tree)
ENABLE_XAI_REACTOR=true XAI_API_KEY=... pnpm dev

# E2E reactor coverage (headers + defense when PR4 live)
ENABLE_XAI_REACTOR=true XAI_API_KEY=... pnpm test:e2e --project=brave-beta -g "qa-reactor"
```

See `tests/e2e/qa-reactor.spec.ts` (skips header/defense reactor cases unless env present).

## E2E Rules (AGENTS.md)

- **Only Brave Beta** (`/usr/bin/brave-browser-beta` or `BRAVE_BETA_PATH`).
- Never `playwright install chromium`.
- `pnpm test:e2e`, `pnpm test:e2e:headed`, `pnpm test:e2e:ui` (via brave script) all honor this.
- qa-reactor.spec.ts follows the same (globalSetup asserts Brave).

## Rollout & Safety

- PR8 reviewer bar: perfect fallback on flag=off, meaningful Brave E2E, observability surfaced, docs.
- After PR8: Graphite stack assembles; canary via env + flag; monitor logs + headers.
- Legacy path can be deleted only after full migration + validation (post-Phase 1).

## Links

- Primary design: `.grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md` (execute-plan 80eccd53)
- PR7 summary: dual-path clean (0 issues)
- Phase overview: `docs/phase-1-xai-agentic-profile-qa-reactor.md`
- AGENTS.md (Brave E2E, skills)
- Unit tests: `__tests__/qa/*.test.ts` (defense mocks, tools, reactor contracts)

This README is the canonical post-PR8 migration & architecture reference for lib/qa consumers.
