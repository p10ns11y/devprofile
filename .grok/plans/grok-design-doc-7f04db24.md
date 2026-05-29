# Design: Automated Testing, Coverage & Regression Prevention for devprofile QA Domain

**Author:** Systems Architect (Grok-assisted)  
**Date:** 2026-05-28  
**Status:** Draft  
**Target Project:** devprofile (Next.js 16 + TypeScript + pnpm portfolio + AI experimentation)  
**Primary Critical Domain:** `/qa` user flow + entire `src/lib/qa/` (2689 LOC)

---

## Overview

This document provides a concrete, implementable plan to establish reliable automated testing, meaningful coverage, and regression prevention for the highest-risk, highest-value area of the devprofile codebase: the Profile Q&A experience.

The plan directly follows the user's binding constraints and philosophy:
- 100% coverage is **not** the goal. The goal is **100% coverage of critical parts** (long-lived, frequently-changed, center-of-the-app server-side logic).
- The primary critical center is the entire `/qa` interaction flow and `src/lib/qa/` domain (persona reactor, 4-layer abuse defense, hybrid retrieval, Collections tools, golden fallback, persona compiler, xai-collections substrate).
- E2E covers only the golden critical user path + 2-4 most frequent flows. This is a portfolio/information site, not a SaaS product.
- UI/UX components are subject to frequent visual/copy change; no deep component-level testing for simple elements. Only complex interactions if any.
- No brittle assertions on labels or text that change frequently.
- Strong emphasis on property-based checks and contract tests for the subtle, high-blast-radius abuse defense layers and retrieval scoring logic.
- The existing 1360 LOC of hand-written unit tests in `__tests__/qa/` (abuse-defense, persona-compiler, persona-tools, xai-collections, persona-reactor, types) represent real investment but are currently **orphaned** (no `pnpm test` target executes them; they use raw `node:assert/strict` + manual `tsx` invocation via argv guards and post-import mutation for mocks).
- The golden QA eval pipeline (`qa:pipeline`, `qa:eval`, 50-item `tests/qa/qa-golden.jsonl`, `recall@5 ≥ 85%` gate controlled by `QA_EVAL_STRICT`) is currently the strongest regression mechanism and must be elevated to a reliable automated gate.
- E2E is very thin (29 `test()` invocations / ~404 LOC in specs + helpers across 5 spec files in `tests/e2e/`; verified grep 2026-05-28). The complex reactor has minimal coverage without real `XAI_API_KEY`. `qa-reactor.spec.ts` and `qa.spec.ts` already contain volatile copy asserts (button names containing "Ask AI Questions", headings with "Peramanathan", "Thinking...", placeholder text) that the stable-selector rules in this plan will require cleaning up.
- No test runner, no coverage reporting, no CI enforcement exist today.
- The most complex/risky code (`src/lib/qa/` = 2689 LOC including `persona-reactor.ts` (401 LOC with streaming + tool calling + durable retry + heavy observability), `persona-tools.ts` (435 LOC, 6 Collections-backed tools), `xai-collections.ts` (468 LOC), `abuse-defense.ts` (stub + `golden-fallback.ts`), `retrieve.ts` + `profile-qa-generator.ts` (hybrid RRF + golden match + Ollama routing)) has the weakest automated safety net relative to blast radius and regression risk.

The solution is a realistic solo/personal-project plan: scoped Vitest runner + coverage only on critical modules, adaptation (not rewrite) of the 1360 LOC investment into proper runnable tests with property/contract augmentation, minimal high-signal E2E using stable selectors, elevation of the existing golden eval into CI, and a minimal GitHub Actions pipeline. All delivered via small, independently reviewable PRs.

---

## Background & Motivation

### Current State (Evidence from Codebase Exploration)

- **Package scripts** (`package.json:26-33`):
  - `"test:e2e"`, `"test:e2e:ui"`, `"test:e2e:headed"`, `"test:e2e:debug"` (Playwright + system Brave Beta only, per `playwright.config.ts` + `playwright.brave.ts` + AGENTS.md).
  - `"qa:eval"`, `"qa:pipeline"` (parse + index build + eval), `"parse-golden-qa"`, `"build-qa-index"`.
  - **No `"test"`, `"test:unit"`, or coverage command.** `type-check` and Biome (`lint`/`format`/`imports:fix` recently separated) are the only quality gates.
- **Unit tests** (`__tests__/qa/*.test.ts`, exactly 1360 LOC):
  - `abuse-defense.test.ts` (173 LOC, 12 cases exercising 4-layer heuristics, rate limiting via headers (Q4), behavioral repetition, config/env, golden fallback with real PR2 packet + Q6 tone).
  - `persona-reactor.test.ts` (238 LOC, mocks AI SDK `streamText`, tools, abuse, compiler, collections; validates defense-first non-bypass + tool wiring + fallback synthesis).
  - `persona-tools.test.ts` (316 LOC, 6 tools + registry + `__TEST_ONLY_*` helpers + pure `formatSearchResults`).
  - `xai-collections.test.ts` (318 LOC), `persona-compiler.test.ts` (237 LOC), `types.test.ts` (78 LOC).
  - Style: `import assert from "node:assert/strict"`, manual `if (process.argv[1]?.endsWith(...)) { (async () => { ... })() }`, `export { runXXXTests }`, post-import module mutation for mocks (see `persona-reactor.test.ts:140-147` comments explicitly calling out pain: "in real harness: use vi.doMock/jest.mock hoisting").
  - Invoked only manually via `npx --yes tsx __tests__/qa/xxx.test.ts`. Never wired to pnpm.
- **E2E** (`tests/e2e/`, ~412 LOC total, 5 spec files, ~29 `test(` cases):
  - `qa.spec.ts` (24 LOC, 2 tests: load /qa + suggested, submit + answer + "Retrieved information").
  - `qa-reactor.spec.ts` (134 LOC, 8 tests: legacy UI when flag off, reactor headers when on, defense triggers, API shape compatibility; heavily skipped/conditional without `ENABLE_XAI_REACTOR` + keys).
  - `homepage.spec.ts`, `x.spec.ts`, `global.spec.ts` + tiny helpers.
  - Uses Playwright + Brave Beta exclusively (globalSetup asserts binary). Stable roles + placeholder locators in places; some text asserts.
  - Web server: `bun run dev` (mixed package manager).
- **Golden eval pipeline** (strongest current mechanism):
  - 50-item `tests/qa/qa-golden.jsonl` (curated from `src/data/golden-qa.md` + `casual-qa.md` via `scripts/parse-golden-qa.mjs` which adds `expectedSections` heuristics).
  - `scripts/qa-eval.mjs` (~300 LOC): loads `src/data/qa-index.json` (87 chunks, Xenova/all-MiniLM-L6-v2), runs hybrid RRF (cosine + BM25, identical logic to `src/lib/qa/retrieve.ts`), `recall@5` on tagged items, context faithfulness via salient terms, writes `tests/qa/last-eval-report.json` + `last-failures.json`.
  - Gate: `recall@5 ≥ 85%` on tagged subset. `QA_EVAL_STRICT=1` sets `process.exitCode = 1`.
  - `pnpm qa:pipeline` = parse + build-index + eval. Currently manual.
- **Feature / kill switch** (post-PR #48 simplification):
  - Purely `ENABLE_XAI_REACTOR=true` env var (no longer the `flags` package or `src/config/feature-flags.ts` which was removed).
  - Dual-path decision in `src/app/api/cv/qa/route.ts:50` (dynamic `import("@/lib/qa/runProfileQA")` only when set; otherwise `profile-qa-generator.ts` legacy path + `qaCache`).
  - `src/lib/qa/runProfileQA.ts:88` (`isQARectorEnabled()`), `toLegacyCompatible()`, `collectFullText()`.
  - Legacy path (`src/utils/qa-utils.ts` + old generator) remains **bit-identical** when off. Reactor never imported/executed.
  - `src/app/flags.ts` exists but only for unrelated `documentsFlag`/`skillsSectionFlag`.
- **Critical code (risk surface)**:
  - `src/lib/qa/` exactly 2689 LOC across **20 files** (verified `ls src/lib/qa/*.ts` on 2026-05-28; see `src/lib/qa/README.md` for post-PR8 architecture).
    - `persona-reactor.ts:140` (`runPersonaQA` / exported as `runProfileQAReactor`): defense **first executable statement** (`checkAbuse`), packet load, `streamText` (AI SDK, `stopWhen: stepCountIs(5)`, tools), `withLightweightRetry`, heavy step/tool result inspection + synthesis fallbacks, observability (`[persona-reactor][v:${version}][${layer}]`).
    - `persona-tools.ts:230` (`aiPersonaTools` + 6 thin Collections tools + registry + manual collector for SDK quirks).
    - `xai-collections.ts:468` (sole substrate client, error hierarchy).
    - `abuse-defense.ts` (current stub shim per its header; real 4-layer + `resetAbuseStateForTests` expected by tests lives on PR4 branch per comments; `golden-fallback.ts` is real and used).
    - `profile-qa-generator.ts:253` (legacy default: `findGoldenMatch`, hybrid RRF via `retrieveFromIndex`, Ollama routing via `qa-router.ts`, `top-achievements`).
    - `retrieve.ts:173` (hybrid logic, duplicated in `qa-eval.mjs`).
    - `persona-compiler.ts` (60 LOC stub; real PR2 on sibling branch).
    - Barrel `index.ts`, `types.ts` (contracts: `AbuseConfig`, `AbuseResult`, `ProfilePacket`, `QAIndex` etc.), `qa-cache.ts`, `durable-retry.ts`, `embed-query.ts`, `load-index.ts`, `qa-prompts.ts`, `qa-router.ts`, `suggested-questions.ts`, `top-achievements.ts`, `constants.ts`.
  - Invariants (enforced in docs + code): Collections-only (no local vectors/HF in reactor), defense non-bypassable + zero-cost golden, response compatibility, versioned observability (`X-QA-Reactor`, `X-QA-Version`).
- **Other context**: Strict TS, Biome 2.4 (lint vs format separated per recent work), pnpm, Next 16 App Router, `@playwright/test`, no Jest/Vitest. Portfolio site (info + layout heavy). CV PDF generation, certificate verification, content-hub, X search also exist but lower regression risk / blast radius per user guidance.
- **Pain points**: Orphaned high-quality tests = zero automated regression detection on the novel high-maintenance reactor. Golden eval is powerful but manual. E2E too thin for the complex path. No CI = silent breakage on refactor. Subtle scoring/defense logic is exactly where property + contract tests shine (user explicitly agrees).

The reactor (defense-first, Collections-only, feature-flagged) is the novel, high-regression-risk area. Legacy must stay bit-identical.

---

## Goals & Non-Goals

### Goals
- Achieve effective **100% coverage of critical server logic**: entire `src/lib/qa/` (all modules, including when full PR2/PR4 implementations land) + `src/app/api/cv/qa/route.ts` (dual-path decision + error paths) + key retrieval/defense surfaces.
- Make the existing 1360 LOC unit tests **runnable and enforced** (`pnpm test:unit`).
- Add **property-based** (fast-check or equivalent generators for abuse triggers, repetition sequences, malformed input) and **contract tests** (tool registry shape, retrieval scoring invariants, response contracts, Collections client error taxonomy) focused on abuse-defense and hybrid scoring.
- Elevate the golden eval (`recall@5 ≥ 85%` on 50-item curated set) to a **reliable automated gate** (via `QA_EVAL_STRICT=1` + dedicated script target + CI).
- E2E: cover the golden critical user path (`/qa` submit → answer + retrieved panel + defense headers when enabled) + 2-4 frequent flows (e.g. quick-cv-actions, homepage → QA, perhaps CV view). Use stable selectors only.
- Add minimal but real **CI enforcement** (GitHub Actions) for type-check + lint + unit + golden-eval (strict). E2E optional/scheduled due to Brave + key requirements.
- Deliver via **small, independently reviewable + mergeable PRs** (incremental, no big-bang).
- Preserve all existing invariants (legacy bit-identical, defense-first, Collections-only, no new heavy deps in prod path).
- Realistic for solo maintainer with limited time: favor high-ROI (critical server logic + golden eval) over exhaustive UI.

### Non-Goals
- 100% (or even 70%) coverage on the whole project (UI components, client-only, PDF generation, content-hub, etc.).
- Deep component/unit tests for simple presentational UI (`src/components/ui/*`, hero, timeline, etc.). "The site is mostly information + layout."
- Brittle text/label assertions on copy that changes frequently.
- Visual regression / screenshot diffing (high maintenance, low value here).
- Full legacy QA path deletion or major refactor.
- Integration of heavy external test services or visual tools.
- Making E2E run the full reactor without keys (keep conditional/skip patterns).
- Adding Jest (too heavy for this stack).
- Requiring real `XAI_*` keys or Ollama for default local test runs.
- Over-investing in testing the simple/legacy path beyond parity contracts (it is the "boring" path by design).

---

## Proposed Design

### Test Pyramid for This Project (Realistic for Portfolio + AI Core)

```
          E2E (thin, high signal)
          ~8-12 cases total
          (golden /qa path + 3 freq flows)
                  ▲
                  │ stable roles + testids (sparing)
    Integration / Contract (API route dual-path, tool contracts)
                  ▲
   Unit + Property + Golden Eval (heavy investment here)
   - 1360 LOC adapted + augmented (abuse property, retrieval contracts)
   - Full src/lib/qa/ (2689 LOC target)
   - qa-eval.mjs recall@5 gate (50 curated items)
                  ▲
         TypeScript + Biome (existing)
```

**Core principles applied**:
- Fission (speed): run unit + type + lint + golden-strict in <2-3 min locally/CI.
- Fusion (value): property tests catch subtle defense/scoring regressions that example-based tests miss; golden eval protects the "center of the app" retrieval quality.
- Defense in depth: unit (logic) + contract (interfaces) + property (edges) + golden (end-to-end retrieval fidelity) + thin E2E (user path + killswitch).

### Test Infrastructure Proposal

1. **Runner**: Vitest (recommended).
   - Why: Excellent ESM + TS + Next support, native `vi.mock` hoisting (directly solves the documented pain in `persona-reactor.test.ts:127-139`), built-in coverage via `@vitest/coverage-v8` (no extra istanbul), fast watch, great reporters, JUnit/HTML output for CI. Minimal config. Plays nicely with pnpm + existing Playwright (no conflict).
   - Install: `pnpm add -D vitest @vitest/coverage-v8`.
   - `vitest.config.ts` (new, at root):
     ```ts
     import { defineConfig } from 'vitest/config';
     import path from 'path';

     export default defineConfig({
       test: {
         globals: false, // explicit imports preferred for clarity
         environment: 'node',
         include: ['__tests__/**/*.test.ts'],
         exclude: ['tests/e2e/**'],
         coverage: {
           provider: 'v8',
           reporter: ['text', 'html', 'json'],
           reportsDirectory: './coverage',
           // CRITICAL SCOPE ONLY (per user philosophy)
           include: [
             'src/lib/qa/**',
             'src/app/api/cv/qa/route.ts',
           ],
           exclude: [
             '**/node_modules/**',
             'src/lib/qa/**/__mocks__/**',
             // Stubs while full PR2/PR4 land (re-evaluate post-merge)
             'src/lib/qa/persona-compiler.ts', // 60 LOC shim today
             'src/lib/qa/abuse-defense.ts',    // stub shim
           ],
           thresholds: {
             // High bar on critical server logic only
             'src/lib/qa/**': { statements: 90, branches: 85, functions: 90, lines: 90 },
             'src/app/api/cv/qa/route.ts': { statements: 85, branches: 80 },
           },
         },
       },
       resolve: {
         alias: { '@': path.resolve(__dirname, './src') }, // match tsconfig + existing tests
       },
     });
     ```
   - Scripts in `package.json`:
     - `"test:unit": "vitest run"`,
     - `"test:unit:cov": "vitest run --coverage"`,
     - `"test:unit:watch": "vitest"`,
     - Consider `"test": "pnpm type-check && pnpm lint && pnpm test:unit"` (keep E2E + golden separate; they are heavier/slower).
   - `"test:golden": "QA_EVAL_STRICT=1 pnpm qa:pipeline"` (new, for explicit local gate).

2. **Adapting the 1360 LOC orphaned tests (heterogeneity-aware conversion)**:
   The suite is **not uniform**. Verified patterns on 2026-05-28:
   - **5 files** use the classic manual pattern: `import assert from "node:assert/strict"`, top-level `if (process.argv[1]?.endsWith("xxx.test.ts")) { (async () => { ... tests ... console.log("✅ ...") })(); }`, `export { runXXXTests }`. Examples: `abuse-defense.test.ts`, `persona-compiler.test.ts`, `persona-tools.test.ts` (also explicitly documents "zero new test runner"), `types.test.ts`, `xai-collections.test.ts`.
   - **1 file** (`persona-reactor.test.ts`, 238 LOC) already uses `import { describe, it, mock } from "node:test";` + real `describe("PR6 Persona Reactor...")` / `it(...)` blocks (see its header and lines 127-147). However, it still relies on post-import mutations + `(globalThis as any).__mockedStreamText` hacks + dynamic import ordering comments that explicitly call out the pain ("in real harness: use vi.doMock/jest.mock hoisting").

   **Conversion recipe (PR 1)**:
   - For the 5 argv/IIFE files: delete the `if (argv)` guard + IIFE wrapper; wrap the body in `describe("... (from manual tsx runner)", () => { ... it("case name", async () => { ... }) })`. Replace any top-level side-effect setup with `beforeEach`/`afterEach`. Replace direct module mutation with `vi.mock` (hoisted at top of file) or `vi.spyOn` after import.
   - For `persona-reactor.test.ts`: change the `node:test` imports to Vitest equivalents (`import { describe, it, vi, beforeEach } from 'vitest'`), remove globalThis + post-import mutation blocks, convert the `mock.fn` setups to `vi.fn()` + proper hoisted mocks for `@ai-sdk/xai`, `ai`, abuse-defense, etc. Keep the excellent real-data + packet compilation logic and the documented assertions.

   **Before/after example (typical argv file, e.g. types.test.ts or abuse-defense.test.ts style)**:

   ```ts
   // BEFORE (manual, 5 files)
   if (process.argv[1]?.endsWith("types.test.ts")) {
     (async () => {
       // 20 lines of setup + 8 asserts
       console.log("✅ types tests passed");
     })();
   }
   export { runTypesTests };
   ```

   ```ts
   // AFTER (Vitest, PR 1)
   import { describe, it, beforeEach } from 'vitest';
   import assert from 'node:assert/strict';

   describe('types (migrated from manual tsx runner)', () => {
     beforeEach(() => { /* reset state */ });
     it('exports the expected surface', () => {
       // original assert bodies become it() bodies
       assert.ok(...);
     });
   });
   ```

   **Before/after example (persona-reactor.test.ts — the node:test file)**:

   ```ts
   // BEFORE (already has describe/it but mutations)
   import { describe, it, mock } from "node:test";
   // ... 40 lines of mock definitions ...
   import * as abuseDefense from "...";
   (abuseDefense as any).checkAbuse = mockCheckAbuse;  // post-import mutation + globalThis hack
   describe("PR6 Persona Reactor...", () => { it("non-bypassable defense", ...); });
   ```

   ```ts
   // AFTER (clean Vitest)
   import { describe, it, vi, beforeEach } from 'vitest';
   import * as abuseDefense from ".../abuse-defense";
   vi.mock(".../abuse-defense", () => ({ checkAbuse: vi.fn(...) })); // hoisted
   // similar hoisted mocks for ai, collections, etc.
   describe("PR6 Persona Reactor (migrated)", () => {
     it("non-bypassable defense", async () => { ... });
   });
   ```

   Keep all real data loading, packet compilation, and `resetAbuseStateForTests` helpers (strengths). One-time cost is front-loaded in PR 1; the heterogeneity is now explicitly documented so the implementer does not have to discover it.

3. **Property-based & Contract Tests (high ROI per user)**:
   - Add `fast-check` as devDep (lightweight, excellent for this).
   - In `abuse-defense.test.ts` (once real impl lands or via the shim surface): generators for abuse-trigger families (jailbreak prefixes, off-topic mixes, repetition sequences for behavioral layer, header variations for L1 fp isolation, rate-limit edge counts).
   - In retrieval-related tests (`retrieve.test.ts` new or added to existing) + `qa-eval.mjs` parity: property checks that hybrid RRF always produces stable top-k ordering, that BM25 + vector fusion scores are monotonic, that `sectionMatches` is reflexive/symmetric within tolerance.
   - Contracts: 
     - `aiPersonaTools` keys exactly match the 6 documented names (`profileSearch`, `workExperience`, ...).
     - Every tool in registry returns `{ result: string }` shape (enforced via `__TEST_ONLY_formatSearchResults`).
     - `AbuseResult`, `ProfileQAResponse`, legacy shape always conform (zod schemas in test or simple structural asserts; keep light).
     - Error taxonomy from `xai-collections.ts` (XaiCollections*Error subclasses).
   - Place new files under `__tests__/qa/` or co-located `*.contract.test.ts`. Run as part of `test:unit`.

   **Concrete fast-check examples (copy-paste ready for PR 2)**:

   ```ts
   // Example 1: Behavioral abuse window (repetition + drift) — extends abuse-defense tests
   // (matches logic exercised in abuse-defense.test.ts:126-130 for maxRepetition)
   import * as fc from 'fast-check';
   import { checkAbuse, resetAbuseStateForTests } from '@/lib/qa';
   import { getAbuseConfig } from '@/config/abuse-defense';

   it.prop([
     fc.array(fc.string({ minLength: 8, maxLength: 60 }), { minLength: 3, maxLength: 7 }),
     fc.integer({ min: 2, max: 6 })
   ])('behavioral layer blocks on repetition within window', async (questions, windowSize) => {
     resetAbuseStateForTests();
     process.env.ABUSE_MAX_REPETITION = String(windowSize);
     let last: any;
     for (const q of questions) {
       last = await checkAbuse(q, { ip: '198.51.100.99' });
     }
     // Property: if more repeats than configured window, last must be blocked at behavioral layer
     if (questions.length > windowSize) {
       expect(last.blocked).toBe(true);
       expect(last.layer).toBe('behavioral');
     }
     delete process.env.ABUSE_MAX_REPETITION;
   });
   ```

   ```ts
   // Example 2: RRF / retrieval contract (stable top-k + parity seed with qa-eval.mjs)
   // Uses the public export `retrieveFromIndex` (src/lib/qa/retrieve.ts:122).
   // For a pure property test on the internal hybrid scoring, add a 1-line test-only
   // wrapper in __tests__/qa/helpers.ts (or inline) that calls the private implementation
   // via a barrel re-export for tests only. The parity intent with qa-eval.mjs remains.
   import * as fc from 'fast-check';
   import { retrieveFromIndex } from '@/lib/qa/retrieve'; // public surface
   // (In practice for this property: import the hybrid fn via a test-only re-export
   //  or test the observable contract on retrieveFromIndex + fixture index.)

   it.prop([fc.string({ minLength: 10 }), fc.integer({ min: 3, max: 7 })])(
     'hybrid RRF always returns k results sorted by fused score (stable under small token noise)',
     (question, k) => {
       const index = loadTestIndex(); // fixture with known chunks (same shape as qa-index.json)
       const r1 = retrieveFromIndex(index, /* queryVec */, question, k); // or thin wrapper
       // ... (assert length, non-increasing scores, parity with qa-eval seeds)
     }
   );
   ```

   A third simple contract test (exact 6 tool names) can be written with ordinary Vitest + `Object.keys(aiPersonaTools)` assertions (no fast-check needed). These examples are deliberately short, use the existing test helpers (`resetAbuseStateForTests`, `sectionMatches`, real packet data), and run in <50ms each.

4. **Golden Eval Elevation**:
   - Already excellent (`scripts/qa-eval.mjs:283`: strict gate, report artifacts, faithfulness + recall).
   - Add `test:golden` script.
   - In CI: always run with `QA_EVAL_STRICT=1`. Fail the pipeline on regression of the 50 curated items (protects hybrid retrieval quality, golden matching, salient term faithfulness).
   - Keep `qa:pipeline` for dev (parse when golden-qa.md changes).
   - Note duplication: hybrid logic in `retrieve.ts` vs `qa-eval.mjs`. Future fission PR could extract shared `hybrid-retrieve.ts`, with contract tests proving parity. Not required for this plan.

**Golden-in-CI Operational Notes (added for Issue 5/6 feedback)**:
   - **Wall time on GHA free tier (typical)**: First run ~45-90s (HF MiniLM download + 50 embeds + hybrid scoring). Cached runs: 8-15s.
   - **Cache strategy (critical)**: Use `actions/cache` on `~/.cache/huggingface` (or the transformers default `~/.cache/huggingface/hub`). Key: `hf-transformers-${{ runner.os }}-${{ hashFiles('src/data/qa-index.json') }}` (or fixed model name). This eliminates the "tens of MB on every cold runner" problem.
   - **Per-PR vs scheduled decision (recommended for solo)**: Run the strict golden job on every PR/push (it is the strongest regression signal for the center of the app and is fast once cached). Add a nightly scheduled job (`cron: '0 3 * * *'`) as a safety net for drift. If transient embed variance ever appears (rare with fixed Xenova/all-MiniLM-L6-v2 + deterministic seeds), temporarily relax that job to warning-only for 1-2 weeks while investigating (documented escape hatch; do not weaken the gate long-term).
   - **Mixed package manager note**: The E2E webServer still uses `bun run dev` (playwright.config.ts:36). The golden job (and unit) run under pnpm only — no conflict.
   - **Artifact policy**: Always upload `tests/qa/last-eval-report.json` + coverage/ as workflow artifacts (30-day retention). Failures automatically surface the `last-failures.json` sample in the job log.

   **Minimal realistic ci.yml skeleton** (place at `.github/workflows/ci.yml`; the critical golden job is shown in full; other jobs abbreviated for brevity):

   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     quality:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
           with: { version: 8 }
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: 'pnpm' }
         - run: pnpm install --frozen-lockfile
         - run: pnpm type-check
         - run: pnpm lint
         - run: pnpm test:unit -- --coverage
         - uses: actions/upload-artifact@v4
           with: { name: coverage, path: coverage/ }

     golden-eval:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: 'pnpm' }
         - name: HF transformers cache (critical for cold runners)
           uses: actions/cache@v4
           with:
             path: ~/.cache/huggingface
             key: hf-${{ runner.os }}-${{ hashFiles('src/data/qa-index.json') }}
             restore-keys: hf-${{ runner.os }}-
         - run: pnpm install --frozen-lockfile
         - name: Golden eval (strict gate)
           run: QA_EVAL_STRICT=1 pnpm test:golden
           # On failure, the job log + uploaded last-eval-report.json contain the recall numbers and sample failures
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: qa-eval-report
             path: |
               tests/qa/last-eval-report.json
               tests/qa/last-failures.json

     e2e:
       # Optional / expensive: only on workflow_dispatch, label, or schedule
       if: github.event_name == 'workflow_dispatch' || contains(github.event.pull_request.labels.*.name, 'e2e')
       runs-on: ubuntu-latest
       steps:
         - ... (install Brave Beta via apt or container, pnpm, pnpm test:e2e --project=brave-beta)
   ```

   This skeleton + the cache + the operational notes make the "minimal but real CI enforcement" implementable in one focused session without further invention.

5. **E2E Strategy (Portfolio Constraints Respected)**:
   - Keep 100% Playwright + system Brave Beta (`playwright.config.ts`, `tests/e2e/global-setup.ts`, `playwright.brave.ts`, AGENTS.md rules). Never change this.
   - **Golden critical path** (must always pass):
     - `/qa` loads with suggested questions (role selectors).
     - Submit question (use stable `getByLabel("Your question")` or add one `data-testid="qa-input"` to the complex form in `src/components/profile-qa.tsx` if needed; prefer existing). **Note**: `profile-qa-state.ts` is pure reducer/state logic with zero DOM — it is never the target of selector changes.
     - Assert `getByRole("heading", { name: "Answer" })` visible (timeout for AI), `getByText("Retrieved information")` visible.
     - Direct API: POST `/api/cv/qa`, assert shape + when reactor enabled: `X-QA-Reactor: 1` + `X-QA-Version` headers (already partially in `qa-reactor.spec.ts`).
   - **2-4 additional frequent flows** (examples; pick the real highest-traffic from analytics if available):
     - quick-cv-actions page + Ask AI flow (already partially covered; ensure legacy UI exact when flag off + reactor badge only when on).
     - Homepage → navigation to /qa or /quick-cv-actions.
     - CV view/download (light, stable).
     - (Optional) X search page if frequently used.
   - **Selector rules** (binding):
     - Prefer `getByRole`, `getByLabel`, `getByPlaceholder` (already used).
     - Add `data-testid` **only** for the QA form input/submit and answer container (complex interaction surface). Document in `tests/e2e/README.md`.
     - **Never** assert on volatile copy ("Ask AI Questions", specific suggested question text, etc.) unless the test is explicitly for that content (rare).
     - Use `toBeVisible`, `toHaveText` (short stable phrases), response shape, headers, status.
   - **PR 4 work includes a mandatory "stable selector hardening pass"**: The existing volatile asserts in `qa-reactor.spec.ts` and `qa.spec.ts` (button names, headings, "Thinking...") must be updated or guarded as part of delivering the thin golden path. PR 4 is not "add new tests only"; it cleans the surface so the portfolio rules are actually followed.
   - Reactor cases: keep conditional on env (as today). Full defense/golden E2E requires keys + post-PR4 real `checkAbuse`.
   - Total new E2E LOC: <150. Focus on signal, not quantity.
   - `qa-reactor.spec.ts` and `qa.spec.ts` become the primary maintained files.

6. **Other Server Logic**:
   - Secondary critical (after QA domain): certificate hash verification (`src/app/api/certificates/[id]/hash/route.ts`, `src/lib/certificate-hash.ts`), CV generate/download. Add light contract tests if time (response shapes, hash determinism). Not in "critical 100%" scope for phase 1 of this plan.

### Architecture Diagram (Current Dual-Path + Test Insertion Points)

```mermaid
flowchart TD
    Client["Client ( /qa, quick-cv-actions, profile-qa.tsx )"] 
    -->|"POST /api/cv/qa"| Route["src/app/api/cv/qa/route.ts"]
    
    Route -->|ENABLE_XAI_REACTOR=true| Dynamic["dynamic import(@/lib/qa/runProfileQA)"]
    Route -->|default (bit-identical legacy)| Simple["profile-qa-generator.ts (hybrid + golden match + Ollama)"]
    
    Dynamic --> Reactor["runProfileQAReactor (persona-reactor.ts)"]
    Reactor -->|1st stmt| Defense["checkAbuse (abuse-defense.ts + config/abuse-defense.ts)"]
    Defense -->|blocked| GoldenFB["computeGoldenFallback (golden-fallback.ts)"]
    Defense -->|pass| Packet["getOrLoadProfilePacket (persona-compiler)"]
    Packet --> Tools["aiPersonaTools (persona-tools.ts) + collectionsClient (xai-collections.ts)"]
    Tools -->|"streamText + durable-retry"| Grok["@ai-sdk/xai + Grok model"]
    
    subgraph "Test Insertion (this plan)"
        Unit["Vitest: __tests__/qa/* (1360 LOC + property/contract)"]
        Unit -->|mocks| Reactor
        Unit -->|contracts| Tools
        Unit -->|property| Defense
        Golden["qa:eval / test:golden (50-item, recall@5 gate)"]
        Golden -->|uses| Index["src/data/qa-index.json + retrieve logic"]
        E2E["Playwright E2E (thin golden + freq flows)"]
        E2E -->|real or skipped| Route
    end
    
    style Defense fill:#ffcccc
    style GoldenFB fill:#ccffcc
```

---

## API / Interface Changes

**No breaking changes to production APIs or public exports.**

- New dev/test-only surfaces:
  - `vitest.config.ts` (root).
  - Updated `package.json` scripts (additive).
  - `test:golden` convenience script.
  - Optional: lightweight Zod schemas or structural contracts exported from `__tests__/qa/contracts.ts` (test-only; not imported in src).
- Existing test exports (`runAbuseDefenseTests` etc.) can be removed or kept as no-ops after conversion.
- E2E may add 1-3 `data-testid` attributes to `src/components/profile-qa.tsx` (or the input in quick-cv-actions) — documented, minimal, and removable.
- `src/lib/qa/index.ts` barrel unchanged (already exports the right surface for tests).

---

## Data Model Changes

None. 

- `tests/qa/qa-golden.jsonl` remains the source of truth (git-tracked, curated).
- Generated artifacts (`src/data/qa-index.json`, `tests/qa/last-eval-report.json`) already ignored by Biome and (will be by) git or CI as appropriate.
- No schema evolution for `ProfilePacket`, `AbuseResult`, etc.

---

## Alternatives Considered

### 1. Test Runner Choice

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Vitest (recommended)** | Fast, excellent ESM/TS/paths support, hoisted `vi.mock` solves exact pain documented in `persona-reactor.test.ts:127`, native v8 coverage with per-glob thresholds, great DX for solo, minimal config, works alongside Playwright. | One new devDep (~few MB). | **Chosen**. Highest ROI for the exact problems (orphaned tests + need for property + cov on 2689 LOC critical). |
| Pure Node `test` runner + `tsx` | Zero new deps, uses built-ins, matches current manual style. One file (`persona-reactor.test.ts`) already successfully uses Node's built-in `node:test` (describe/it + `mock.fn`) and documents the future "vitest/jest when added" path. | No coverage support worth using, poor watch/reporters, manual hoisting impossible for the other five files (current mutation hacks remain painful), hard to add fast-check ergonomically, no JUnit for CI. | Rejected for this scale of investment (Vitest still wins on hoisting + coverage + DX even though one file has proven the built-in runner can express the tests). |
| Jest | Mature ecosystem, snapshotting. | Heavy, slower, ESM/Next config hell (especially with Turbopack + pnpm), more deps, overkill for Node-only server logic focus. | Rejected (stack mismatch). |

### 2. Coverage Strategy

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Critical-only + high thresholds (90/85 on src/lib/qa/** + route)** | Directly implements user's "100% of *critical parts*" philosophy. Avoids gaming on low-risk UI. Actionable reports. | Requires explicit include/exclude globs. | **Chosen**. Matches risk surface (reactor blast radius). |
| Project-wide 70-80% | Simple single number. | Wastes effort on throwaway components; numbers become meaningless. | Rejected. |
| "Just the golden eval + manual" | Zero new infra. | Leaves 2689 LOC + 1360 LOC tests unexercised in automation. | Rejected (current state). |

### 3. E2E Depth

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Thin golden path + 2-4 freq flows, stable selectors only** | Respects portfolio nature + user explicit rules. Low maintenance. Fast runs. | Misses some visual/copy regressions (acceptable). | **Chosen**. |
| Broad component + visual regression | Catches layout drift. | High maintenance on frequently changing info site; contradicts "do not go deep on component-level" and "no brittle text". | Rejected. |
| Keep exactly as-is (very thin) | Zero work. | Reactor (highest risk) has almost no E2E safety net. | Rejected. |

### 4. Golden Eval Integration

- **As strict CI gate + `test:golden` (chosen)**: Protects the single strongest regression asset (50 curated items + recall@5 + faithfulness) without slowing every `pnpm test`.
- Run inside default `test` (rejected): HF model download + 50 embeds makes local iteration slow; first-run friction.
- Leave fully manual (current): wastes the investment.

### 5. Property-Based Tooling

- **fast-check (lightweight, chosen for abuse + scoring edges)** vs hand-rolled + chance/faker (simpler, one less dep) vs none. fast-check is small and the exact use case (generators for jailbreaks, repetition windows, header fp variants) justifies it for the "subtle breakage risks" the user called out.

---

## Security & Privacy Considerations

- **Test keys & secrets**: E2E reactor cases already conditional on `ENABLE_XAI_REACTOR` + real keys (see `qa-reactor.spec.ts`). CI will never run them without explicit secrets (recommend: separate optional job or `workflow_dispatch`). Never hardcode keys.
- **Abuse defense testing**: Property generators must not accidentally create real high-volume attack traffic. All tests run locally or against test-mode (rate limits env-overridable). `resetAbuseStateForTests()` already exists for isolation.
- **Data in golden set**: Curated public profile content only. `qa-golden.jsonl` is safe to commit.
- **No new attack surface**: Adding Vitest/CI does not expose new endpoints. Coverage reports are local/CI artifacts only.
- **Supply chain**: Pin devDeps (Vitest, fast-check) via pnpm-lock. Run `pnpm audit` as part of existing hygiene (see AGENTS.md skills).
- **Threat model for gates**: A failing golden eval or unit test on abuse path is a **feature** (blocks bad deploys). CI failure is the desired outcome on regression of defense or retrieval quality.

---

## Observability

- **Unit / coverage**: Vitest text + HTML + JSON reports. `coverage/` dir (gitignored). Threshold failures surface clearly in CI logs + PR comments.
- **Golden eval**: Already writes `tests/qa/last-eval-report.json` + `last-failures.json` (rich: recall numbers, faithfulness flags, sample failures). CI artifacts these + console summary. `QA_EVAL_STRICT=1` makes failure loud (`exitCode=1`).
- **E2E**: Existing Playwright HTML reporter (`playwright-report/`). Trace on retry. Add GitHub summary step for key assertions (headers present, defense layer surfaced).
- **CI logs**: Structured `[persona-reactor]...` logs already excellent for reactor path; tests inherit this.
- **New metrics (lightweight)**: Track in CI summary: "Unit tests: X passed", "Golden recall@5: Y% (gate: 85%)", "Critical coverage: Z% (threshold 90%)". No new telemetry in prod.
- **Alerting (solo)**: GitHub Actions failure notifications (email / Slack if configured). Local: failing `pnpm test:unit` or `test:golden` is the signal.

---

## Rollout Plan

**Canary / Kill Switches**:
- All new test infrastructure is additive and off-by-default for prod.
- Reactor itself remains controlled by `ENABLE_XAI_REACTOR` (zero risk when off).
- New `data-testid` attributes are inert.
- Coverage thresholds start lenient (or reporting-only) in early PRs, tighten in later PR.

**Staged Rollout (tied to the authoritative 4-PR plan below)**:
1. PR 1: Vitest + full unit conversion (the highest-value atomic deliverable: `pnpm test:unit` now runs the 1360 LOC investment).
2. PR 2: Property/contract augmentation (fast-check examples for abuse + retrieval).
3. PR 3: Golden elevation + concrete CI (with yaml skeleton + HF cache + operational notes).
4. PR 4: E2E stable-selector hardening (including cleanup of existing volatile asserts) + docs + threshold enforcement + Future Script Policy decision.
Post-merge: Optional scheduled golden job + E2E (label or manual) once Brave + keys are available in the personal CI environment. All changes remain additive and independently revertible.

**Rollback**:
- Any PR is independently revertible (additive changes).
- If Vitest causes install pain: remove in one revert + restore old manual commands (documented in CONTRIBUTING or a `TESTING.md`).
- Golden gate too strict on a content update: relax temporarily via PR or `QA_EVAL_STRICT=0` (explicit).

**Solo Time Estimate (realistic)**:
- Total: 8-15 hours spread over 1-3 weeks (small PRs).
- Highest value first: runner + unit adaptation + golden elevation.

---

## Open Questions

1. Exact final coverage thresholds (90/85 proposed; confirm after first full run on real PR4/PR2 code)?
2. Include `fast-check` now, or start with hand-written property cases + add later?
3. Should `test` script eventually include `test:golden` (making HF a dev requirement) or keep strictly separate? **Explicit policy decision (PR 4)**: Keep strictly separate on `test:golden` + scheduled/label CI job only. Documented in "Future Script Policy" note and Golden-in-CI Operational Notes. This is the recommended long-term stance for solo/portfolio realism.
4. Deduplicate hybrid retrieval logic (`retrieve.ts` ↔ `qa-eval.mjs`) in a follow-up fission PR? (Strongly recommended for long-term maintainability.)
5. When full PR4 abuse-defense lands (replacing shim), do we backfill any additional edge cases discovered during property testing into the golden set?
6. Add a lightweight "smoke" contract test for the legacy path in `profile-qa-generator.ts` to guarantee bit-identical shape forever?

---

## References

- `src/lib/qa/README.md` (canonical post-PR8 architecture + invariants + env controls).
- `AGENTS.md` (E2E/Brave Beta rules, skill system).
- `docs/phase-1-xai-agentic-profile-qa-reactor.md` and prior design in `.grok/plans/`.
- `tests/e2e/README.md` + `playwright.config.ts` + `playwright.brave.ts`.
- `scripts/qa-eval.mjs` (the recall@5 gate implementation).
- `tests/qa/qa-golden.jsonl` + `scripts/parse-golden-qa.mjs`.
- `__tests__/qa/persona-reactor.test.ts:127` (explicit callout for future proper mocking).
- `src/app/api/cv/qa/route.ts` (current dual-path + dynamic import).
- `src/lib/qa/runProfileQA.ts` (isQARectorEnabled, toLegacyCompatible).
- `src/config/abuse-defense.ts` + `src/lib/qa/abuse-defense.ts` (stub) + `golden-fallback.ts`.
- `src/lib/qa/types.ts` (AbuseConfig, ProfilePacket, contracts).
- `persona-tools.test.ts:271` (example of pure helper coverage already present).
- Biome 2 primitives (lint vs format separation), recent `imports:fix` script.
- Prior memory: ~1360 LOC unit investment, golden as strongest mechanism, reactor as primary risk.

---

## Key Decisions

1. **Vitest as the unit runner (with v8 coverage)**: Directly addresses the documented hoisting/mutation pain in the existing 1360 LOC tests, provides native per-glob thresholds for "critical only" scope, and has the best DX/ speed for a TS/ESM Next project. Alternatives (pure Node test, Jest) were rejected for insufficient power or excess weight.

2. **Coverage strictly scoped to `src/lib/qa/**` + `src/app/api/cv/qa/route.ts` with high thresholds (90/85 stmts/branches)**: Implements the user's explicit philosophy ("100% coverage of *critical parts*") and risk assessment (2689 LOC reactor has highest blast radius). Avoids diluting signal on low-risk UI/layout code.

3. **E2E remains thin, Playwright + system Brave only, focused on golden path + 2-4 flows with stable selectors and minimal testids**: Strict adherence to portfolio constraints, AGENTS.md, existing `playwright.config.ts`, and the "no brittle text / no deep components" rule. Adds just enough signal for the dual-path killswitch and reactor headers.

4. **Golden eval elevated to first-class automated gate (`test:golden` + `QA_EVAL_STRICT=1` required in CI)**: The 50-item curated `tests/qa/qa-golden.jsonl` + `scripts/qa-eval.mjs` recall@5 + faithfulness is already the strongest regression tool in the repo. This plan makes it impossible to regress silently without being a deliberate, reviewable choice.

5. **Convert (don't discard) the 1360 LOC orphaned tests + augment with property/contract for abuse + retrieval**: Honors the real investment while fixing the infrastructure gap. Property-based testing on the 4-layer defense and RRF scoring is the highest-leverage addition for "subtle breakage risks" per explicit user guidance.

6. **Reactor killswitch and dual-path remain unchanged (pure `ENABLE_XAI_REACTOR` env)**: The current post-PR#48 design in `route.ts` and `runProfileQA.ts` is simple, effective, and low-risk. No need to re-introduce the removed feature-flags system for testing.

7. **4 realistic consolidated PRs with early high-value deliverable in PR 1**: Directly addresses solo maintainer reality (fewer review cycles, context switches, and branch management than a 7-PRs split). PR 1 delivers the single most important outcome ("pnpm test:unit now runs the full 1360 LOC investment") atomically. Later PRs layer property depth, concrete CI with operational notes, and E2E hardening. Still incremental and reviewable.

8. **No new production dependencies; test-only additions are lightweight and pinned**: Vitest + optional fast-check add minimal install/CI time. All heavy AI work (Grok, Collections, HF in eval) stays behind existing guards or explicit scripts.

---

## PR Plan

The implementation is broken into **4 realistic, ordered, independently reviewable and mergeable PRs** for a solo maintainer on a personal portfolio project. This consolidation directly responds to feedback that a 7-PRs split creates excessive process and context-switching for limited personal time. Each PR still delivers clear, early runnable value. Total estimated solo effort: 8-14 hours spread across sessions.

**PR 1: Vitest infrastructure + full conversion of all 6 unit test files (deliver "pnpm test:unit works")**  
- **Files affected**: `package.json` (devDeps: vitest + @vitest/coverage-v8; new scripts `test:unit`, `test:unit:cov`, `test:golden`), new `vitest.config.ts` (critical-only globs `src/lib/qa/**` + `src/app/api/cv/qa/route.ts`, thresholds 90/85 on critical, alias for `@/*`), all 6 files in `__tests__/qa/` (see detailed per-file conversion notes + before/after snippets in the "Adapting the 1360 LOC" section below), `.gitignore` (`/coverage`, `.vitest*`), update `CONTRIBUTING.md` (first testing guidance) and `tests/qa/README.md` (pnpm `test:golden` example).  
- **Dependencies**: None.  
- **Description**: Atomic high-value PR. After merge, `pnpm test:unit` executes the entire 1360 LOC investment cleanly (with hoisted mocks). Coverage reports are generated for the critical paths only. This is the single most important early deliverable for a solo effort. Includes the heterogeneity-aware conversion (5 argv/IIFE files + 1 already-on-node:test file). ~3-4 hours.

**PR 2: Property-based + contract test augmentation (fast-check examples for abuse + retrieval)**  
- **Files affected**: `package.json` (add `fast-check` devDep), new or extended test files under `__tests__/qa/` (`abuse-defense.property.test.ts` or additions to existing, `persona-tools.contract.test.ts`, `retrieve.contract.test.ts` or parity tests), minor updates to existing test files for shared generators.  
- **Dependencies**: PR 1 (needs the runner + full conversion).  
- **Description**: Delivers the explicit user-endorsed "property-based checks and contract tests for the subtle, high-blast-radius abuse defense layers and retrieval scoring logic." Includes 1-2 copy-pasteable fast-check examples (behavioral repetition window + RRF stability contract). Runs automatically in `test:unit`. ~2 hours.

**PR 3: Golden elevation + realistic minimal CI (with yaml skeleton + Golden-in-CI Operational Notes)**  
- **Files affected**: `package.json` (add/refine `test:golden`), `.github/workflows/ci.yml` (new — the repository currently has **zero** GitHub Actions workflows or Dependabot configuration; pnpm setup + cache, type/lint/unit + `QA_EVAL_STRICT=1 test:golden` job with HF transformers cache for `~/.cache/huggingface`, coverage artifacts, optional E2E behind `workflow_dispatch` or label; see full skeleton in "Proposed Design §5"), `scripts/qa-eval.mjs` (minor polish), `tests/qa/README.md` (update the existing "CI gate" example from `npm run qa:eval` to pnpm `test:golden`), `CONTRIBUTING.md` (currently contains only high-level E2E mentions and zero unit/golden/testing guidance — this PR seeds the first real content) + root docs (how to run gates locally/CI).  
- **Dependencies**: PR 1 (so the unit + golden scripts exist and pass).  
- **Description**: First automated enforcement. Adds the concrete ~60-line ci.yml skeleton (pnpm + HF cache strategy) and the new "Golden-in-CI Operational Notes" subsection. E2E job explicitly conditional. ~2.5 hours.

**PR 4: E2E stable-selector hardening + docs + threshold enforcement + script policy decision**  
- **Files affected**: `tests/e2e/qa.spec.ts` + `qa-reactor.spec.ts` (stable selector hardening pass on existing volatile text asserts such as button names, "Thinking...", "Peramanathan" headings, plus golden path expansion), other specs lightly if needed for the 2-4 frequent flows, `src/components/profile-qa.tsx` / quick-cv-actions (1-3 `data-testid` **only** on the complex QA interaction surface), `vitest.config.ts` (tighten thresholds after real run on full PR4/PR2 code), `package.json` + docs (explicit "Future Script Policy" note — see detailed recommendation in the Golden-in-CI Operational Notes subsection: golden stays on its own `test:golden` + scheduled or label-triggered CI job; **never** in the hot-path `pnpm test` or the default per-PR CI job. This preserves the "<2-3 min fission" local iteration claim and avoids forcing HF as a dev requirement for every contributor), `tests/e2e/README.md` + `CONTRIBUTING.md` (full testing guidance).  
- **Dependencies**: PR 3 (CI exists to exercise E2E).  
- **Description**: Closes the loop. PR6-style work (hardening existing brittle asserts + thin expansion) happens here in the final PR so that all prior PRs stay focused on the critical server logic (user constraint). Coverage thresholds become hard gates. Explicit policy decision on golden inclusion (kept separate per solo realism). ~2-3 hours.

**Total**: 4 PRs. PR 1 delivers the highest-ROI outcome ("the 1360 LOC tests now run and are covered") immediately and in one atomic review. Later PRs add property depth, the real CI gate with operational details, and the portfolio-appropriate E2E hardening. Every PR preserves the dual-path legacy invariant and respects critical-parts-only scope. Each is reviewable/mergeable in a single focused session.

---

**End of Design Document**

*This plan is concrete, cites real files and line numbers from the 2026-05-28 codebase state, quantifies LOC and targets, uses diagrams, lists risks/mitigations, and provides a realistic incremental path for a solo maintainer.*
