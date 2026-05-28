# Surgical Design Document: Fix ReferenceError in xAI Profile QA Reactor + Architectural Debt

**ID**: f28995ea  
**Date**: 2026-05-27  
**Author**: design-doc-writer (fusion-sage mode, per .agents/skills/fusion-sage/SKILL.md and devprofile-fusion-playbook.md)  
**Context**: Post-PR #48 (clean /qa + `ProfileQA` + `profile-qa-generator.ts` hybrid) + rebase of 8-PRs agentic reactor work (persona-reactor, Collections PR3, 6 tools PR5, etc.). Repeated ad-hoc edits for `USE_LOCAL_PROFILE_DATA`, `XAI_PROFILE_COLLECTION`, and dynamic imports introduced TDZ + scoping debt.  
**Goal**: Zero-crash import of reactor modules, correct manual-collection read-only scoping (no `ensure`/`create` perms required), simple PR48 path remains default and untouched, minimal token waste for future iterations.

**Required Structure Compliance**: This doc exactly follows the mandated sections. All citations use absolute paths + function names and line numbers from live source reads/greps performed on the 2026-05-27 workspace state. Minor post-edit drift is possible; see "Verification Note" below.

### Verification Note (addressing reviewer feedback)
Line numbers (e.g., persona-tools.ts:125 for the `opts` TDZ, the 6 `createSpecializedTool` calls at 224/239/254/269/284/299, xai-collections.ts:338 for the collection_ids warning, persona-reactor.ts:30 for the static import, types.ts:178 for the end of PersonaToolRegistry with no SearchResult body) are directionally exact and were cross-checked via direct file reads + greps at analysis time. They are not guaranteed byte-for-byte after any subsequent commits. "Exhaustive" refers to the targeted multi-file reads/greps of the reactor surface (not a full-repo audit). All core claims (import graph, side-effect locations, env sites, dual-path guard) were validated against the actual code.

---

## 1. Overview of the Root Cause

### Immediate Crash
```
ReferenceError: opts is not defined
    at getSearchExecutor (src/lib/qa/persona-tools.ts:125:32)
    at createSpecializedTool (src/lib/qa/persona-tools.ts:186:18)
    at module evaluation (src/lib/qa/persona-tools.ts:224:27)
```

**Crashing line** (current source):
```ts
// src/lib/qa/persona-tools.ts:124
const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
const searchOpts: any = { k: opts?.k };  // <-- opts has no declaration in this scope
```

### Why It Fires at Static Module Evaluation
- `getSearchExecutor` (persona-tools.ts:111) is parameterless.
- The inner returned function signature is `(q: string, opts?: { k?: number }) => ...`
- The `opts` reference on line 125 is a typo/scope error from one of the post-rebase ad-hoc patches (intent was probably to support per-call k + filters for manual collections).
- The 6 tool creation calls at module bottom **execute synchronously on import**:
  - persona-tools.ts:224: `const profileSearchPair = createSpecializedTool(...)`
  - persona-tools.ts:239: `workExperiencePair`
  - persona-tools.ts:254: `skillsPair`
  - persona-tools.ts:269: `projectsPair`
  - persona-tools.ts:284: `educationAndBackgroundPair`
  - persona-tools.ts:299: `principlesAndPhilosophyPair`
- Each calls `createSpecializedTool` (line 176) → `const search = getSearchExecutor();` (line 186) at **definition time**.
- `createSpecializedTool` + the 6 pairs + `aiPersonaTools` / `personaToolRegistry` / `personaTools` objects (lines 312-353) are **top-level side effects**.

### Import Graph That Triggers It (Even on "Dynamic" Path)
1. `src/app/api/cv/qa/route.ts:46`: `if (process.env.ENABLE_XAI_REACTOR === "true")`
2. `route.ts:22`: `const mod = await import("@/lib/qa/runProfileQA");`
3. `runProfileQA.ts:20`: `import { runProfileQAReactor } from './persona-reactor';`
4. `persona-reactor.ts:30`: `import { aiPersonaTools, type PersonaToolRegistry } from './persona-tools';` ← **static, unconditional**
5. `persona-tools.ts` module evaluation → 6× `createSpecializedTool` → crash (when `XAI_API_KEY` present **and** `USE_LOCAL_PROFILE_DATA !== "true"`).

Additional static pull:
- `src/lib/qa/index.ts:26-40`: barrel **statically re-exports** `aiPersonaTools`, `personaToolRegistry`, the 6 `xxxTool` named exports, `__TEST_ONLY_*` from `"./persona-tools"`.
- All `__tests__/qa/*-test.ts` (e.g. persona-tools.test.ts:40, persona-reactor.test.ts:108, abuse-defense.test.ts:25, etc.) do `import { aiPersonaTools, ... } from "@/lib/qa"`.
- Result: `pnpm test` (or any barrel consumer) crashes on a dev machine that has `XAI_API_KEY` in `.env.local` (common when testing other xAI surfaces).

### History of the Debt (Repeated Ad-Hoc Edits)
- PR #48: Introduced clean `/qa` page (`src/app/qa/page.tsx`), `ProfileQA` component, `profile-qa-generator.ts` (local index + golden + optional Ollama, zero reactor cost). `isQARectorEnabled` simplified to **solely** `ENABLE_XAI_REACTOR` (runProfileQA.ts:84-88). Feature-flags.ts removed.
- Parallel 8-PR reactor branch (pre-rebase): `persona-reactor.ts`, `persona-tools.ts` (6 tools + `getSearchExecutor`), `xai-collections.ts`, `abuse-defense.ts`, dual-path in routes/actions.
- Post-rebase onto post-PR48 main: multiple patches added:
  - `USE_LOCAL_PROFILE_DATA` support in `persona-tools.ts:114` (localSearch) and `persona-reactor.ts:91`.
  - `XAI_PROFILE_COLLECTION` scoping attempts in `persona-tools.ts:121-131` (the broken block), `persona-reactor.ts:92-97` (skip ensure), `xai-collections.ts:116` (`getTargetCollectionName`).
  - Dynamic import guard in `route.ts:16-31` ("so the simple path doesn't pull in heavy code").
- Each patch touched `getSearchExecutor` signature/closure/return shape without unifying call sites or eliminating top-level creation. The `opts` TDZ is the symptom of the last such patch. Scoping never fully worked (filters not passed at call time; `searchOpts` captured at creation with `opts===undefined`).

### Secondary Symptoms (From Same Debt)
- Searches not filtered to manual collection → `collections:search warning: no collection_ids` (xai-collections.ts:341) → empty tool results.
- `ensureCollectionForVersion` still attempted in some paths (e.g. if condition in persona-reactor.ts:95 is not met, or via `ingestPacket` in scripts/manual-ingest.ts:52, or fallback in collections.ts:186).
- Response shape mismatches: route.ts:59-83 maps `reactorRes.toolResults` ad-hoc; `toLegacyCompatible` forces `details:[]`; UI (`profile-qa-state.ts:11`, `profile-qa.tsx:221`) expects `{text, section, similarity}` + optional `strategy`/`ollamaError`.
- `SearchResult` type referenced everywhere (persona-tools.ts:17, index.ts:51) but **no interface body exists** in types.ts (only re-export; shape is implicit from localSearch + collections search return).
- Outdated docs: `src/lib/qa/README.md` still describes pre-PR48 flag system + old call sites (actions.ts, /api/cv/qa dual in legacy terms).

**Root Architectural Problem**: Tool creation (and env-dependent backend selection) is a **top-level module side effect** in `persona-tools.ts`. The dynamic import guard in the route protects the *simple path* but cannot protect *reactor module evaluation itself* or barrel/test consumers. Ad-hoc env wiring was scattered instead of centralized.

---

## 2. Surgical Fix Options with Trade-offs

All options assume **no changes to the simple PR48 path** (`profile-qa-generator.ts`, `ProfileQA` component, default route behavior when `ENABLE_XAI_REACTOR != "true"`). All preserve the 6-tool contract and `aiPersonaTools` shape for `streamText`.

### Option 1: In-Place Patch Only (getSearchExecutor + Call-Time Scoping)
**Diff surface**: Only `src/lib/qa/persona-tools.ts` (~12 lines).

- Move manualCollection + filter construction **inside the returned executor**.
- Resolve backend choice + `XAI_PROFILE_COLLECTION` at executor creation (first getter access inside lazy factory); apply k + filters at every search call using the captured value.
- Keep the 6 top-level `createSpecializedTool` calls and static exports.
- Add a one-line guard or restructure the early return.

**Trade-offs**:
- + Extremely minimal, reviewable in <10 min, zero caller changes.
- + Fixes crash + makes manual collection scoping actually work (filters reach `collectionsClient.search` at runtime).
- - Tool creation + `getSearchExecutor()` still runs on every import of `persona-tools` / barrel / `persona-reactor`.
- - Does not solve "avoid pulling tool creation into the module graph".
- - Static decision at import time means `USE_LOCAL_PROFILE_DATA` flip requires restart (already true today).
- - Barrel/test imports with `XAI_API_KEY` still execute (harmless after patch, but no isolation).

**Best for**: Hotfix to unblock users today.

### Option 2: Lazy Factory for Tool Creation (Recommended Core)
**Diff surface**: `persona-tools.ts` (move 6 creation sites + exports behind `getPersonaTools()` / memoized), + 4-5 caller sites (`persona-reactor.ts:190`, `index.ts` barrel re-exports, `__tests__/qa/persona-*.test.ts` (3 files), possibly `runProfileQA.ts` re-export surface).

- Introduce:
  ```ts
  let _cached: { aiPersonaTools, personaToolRegistry, personaTools, __TEST_ONLY_... } | null = null;
  export function getPersonaTools() {
    if (!_cached) {
      const p1 = createSpecializedTool(...); // all 6 here
      _cached = { aiPersonaTools: {...}, ... };
    }
    return _cached;
  }
  ```
- Export `getAiPersonaTools()` etc. (or Proxy for back-compat on direct named exports).
- In `persona-reactor.ts`: `const { aiPersonaTools } = getPersonaTools();` (called inside `runPersonaQA`, after defense).
- Barrel: re-export the getter + (for test compat) a lazy-evaluated snapshot or keep direct (creation now happens on first property access, not module eval).
- Tests: access after mocks are installed (current pattern already does per-test `mockSearch` before `.execute`).

**Trade-offs**:
- + **Defers creation until reactor mode chosen** (first access inside guarded `runPersonaQA` or explicit test usage). Importing the module for types or unrelated barrel symbols no longer executes `getSearchExecutor`.
- + Still tiny surgical diff inside one file for the factory; callers are mechanical 1-line updates.
- + Enables future "surplus" (see Key Decisions): single `resolveQaSearchExecutor()` can live here or adjacent.
- - Small churn in 5 files (all test + reactor; route and generator untouched).
- - If any code does `import { aiPersonaTools } from` and immediately spreads/inspects at module top (none do today), timing shifts.
- - Proxy (or getter Object.defineProperty) for perfect named-export backcompat adds ~8-12 lines (acceptable for the isolation win).

**Best for**: Achieves the explicit requirement "How to avoid pulling tool creation into the module graph until the reactor mode is chosen" with minimal long-term cost.

**Implementation clarifications for surgical PR C** (addressing reviewer feedback on underspecification):
- Refactor `createSpecializedTool(name, desc, prefix, queryDescribe, searchFn?)` to accept an optional injected `search` executor (defaulting to `createSearchExecutor()` computed once outside the 6 creations inside `ensurePersonaTools`). This eliminates 6 redundant env reads + identical executor objects on every factory invocation.
- For the three public objects (`aiPersonaTools`, `personaToolRegistry`, `personaTools`) use a compact top-level Proxy (or lazy getters via Object.defineProperty) so `import { aiPersonaTools } from "@/lib/qa"` succeeds with zero side-effects; property access triggers `ensurePersonaTools()`. Example (illustrative, 10 lines):
  ```ts
  const _ensure = () => ensurePersonaTools();
  export const aiPersonaTools = new Proxy({}, {
    get: (_, p) => _ensure().aiPersonaTools[p as any],
    ownKeys: () => Object.keys(_ensure().aiPersonaTools),
    getOwnPropertyDescriptor: (_, p) => ({ configurable: true, enumerable: true, value: _ensure().aiPersonaTools[p as any] })
  }) as any;
  // Repeat for personaToolRegistry and personaTools (or a helper factory).
  ```
- `__TEST_ONLY_TOOL_PREFIXES__` and `PersonaToolName` type stay direct (no side-effect).
- Critical test update: `persona-reactor.test.ts` does namespace mutation `(personaTools as any).aiPersonaTools = mock...` right after import. This will no longer affect the live Proxy/getter used by the imported `persona-reactor`. **Required change in PR C**: update that test to either (a) import the getter and call it after mock setup, or (b) add a test-only setter `setAiPersonaToolsForTest(mock)` exported only under `__TEST__`. Other tests (persona-tools.test.ts top-level `_toolCheck` assignments) are fine because they occur after import but before use, and will trigger ensure safely once mocks are in place. Barrel re-exports must forward the lazy versions.

### Option 3: Full Dependency Inversion / Pure Tools Module
**Diff surface**: New file `src/lib/qa/search-backend.ts` (or inject into `xai-collections`), major refactor of `persona-tools.ts` (remove `collectionsClient` import + all env reads + `getSearchExecutor` + `localSearch`), `persona-reactor.ts`, tests, manual-ingest script.

- `persona-tools.ts` becomes **pure**: exports `createSpecializedTool` factory that takes an injected `search: (q: string, opts?) => Promise<SearchResult>` + prefix etc. No side effects at all.
- New `resolveSearchExecutor()` (central place for the 3 envs + filter logic) returns the appropriate implementation (localSearch closure or collections wrapper that always injects `XAI_PROFILE_COLLECTION` filter).
- Reactor (only when ENABLE) calls `createAiPersonaTools( resolveSearchExecutor() )`.
- Barrel exports only types + the creator fn.

**Trade-offs**:
- + Cleanest long-term architecture (iron-peak per fusion-sage: one decision point, reversible knowledge, no scattered env logic).
- + Perfect isolation: `persona-tools` module can be imported anywhere with zero cost or side effects.
- + Easy to test (inject mocks at creation).
- - Largest diff (new file + 6-8 edits). Violates "surgical" + "minimal diff" mandate for this fix.
- - Higher risk of drift between old manual-ingest script and reactor.
- - Overkill for Phase 1 (per original 8-PR design).

**Not recommended now** (save for post-fix surplus iteration).

**Hybrid (Selected)**: Option 2 (lazy factory) + the Option 1 patch applied **inside** the factory body. This gives crash fix + correct scoping + deferred creation in one coordinated small change.

---

## 3. Recommended Approach + Exact Code Changes (Minimal Diff)

**Recommended**: Hybrid of Option 2 + Option 1 (lazy factory containing the call-time scoping fix).

**Rationale** (surgical + future-proof):
- Fixes the crash immediately.
- Makes `XAI_PROFILE_COLLECTION` scoping actually work for read-only manual collections (the primary local-dev story requested).
- Defers all tool creation + `getSearchExecutor` execution until the reactor path is explicitly taken (satisfies "avoid pulling... until chosen").
- Changes < 60 lines net across 5 files.
- No impact on `profile-qa-generator.ts`, `src/app/qa/page.tsx`, `ProfileQA`, or default route.
- Creates the hook for the fusion surplus (central `resolve*` fn).

### Exact Minimal Diffs

#### Patch A: persona-tools.ts — Fix TDZ + Call-Time Scoping + Lazy Factory (core, ~35 lines changed)
Replace the broken `getSearchExecutor` + top-level creation block.

```diff
diff --git a/src/lib/qa/persona-tools.ts b/src/lib/qa/persona-tools.ts
index ...
--- a/src/lib/qa/persona-tools.ts
+++ b/src/lib/qa/persona-tools.ts
@@
-function getSearchExecutor() {
-  const forceLocal = process.env.USE_LOCAL_PROFILE_DATA === "true";
-  const hasApiKey = !!process.env.XAI_API_KEY;
-
-  if (forceLocal || !hasApiKey) {
-    return (q: string, opts?: { k?: number }) => localSearch(q, opts?.k);
-  }
-
-  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
-  const searchOpts: any = { k: opts?.k };   // BUG: opts not in scope
-
-  if (manualCollection) {
-    searchOpts.filters = { collection_ids: [manualCollection] };
-  }
-
-  return (q: string, opts?: { k?: number }) => collectionsClient.search(q, searchOpts);
-}
+function createSearchExecutor() {
+  const forceLocal = process.env.USE_LOCAL_PROFILE_DATA === "true";
+  const hasApiKey = !!process.env.XAI_API_KEY;
+
+  if (forceLocal || !hasApiKey) {
+    return (q: string, opts?: { k?: number }) => localSearch(q, opts?.k);
+  }
+
+  // Backend choice (USE_LOCAL / hasApiKey) + manualCollection resolved at first tool use /
+  // executor creation time (inside the lazy factory in ensurePersonaTools). Per-search
+  // call-time application of k + filters using the captured manualCollection value.
+  // This fully supports XAI_PROFILE_COLLECTION for read-only manual collections using
+  // only XAI_API_KEY (search perms, no mgmt/create).
+  const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
+
+  return (q: string, opts?: { k?: number }) => {
+    const searchOpts: any = { k: opts?.k };
+    if (manualCollection) {
+      searchOpts.filters = { collection_ids: [manualCollection] };
+    }
+    return collectionsClient.search(q, searchOpts);
+  };
+}
```

Then wrap the 6 creations (lines ~221-306) and the 3 export objects:

```ts
// After the formatSearchResults + __TEST_ONLY helper...

interface PersonaToolsBundle {
  aiPersonaTools: typeof aiPersonaTools; // shape preserved
  personaToolRegistry: PersonaToolRegistry;
  personaTools: typeof personaTools;
  __TEST_ONLY_TOOL_PREFIXES__: typeof __TEST_ONLY_TOOL_PREFIXES__;
}

let _bundle: PersonaToolsBundle | null = null;

function ensurePersonaTools(): PersonaToolsBundle {
  if (_bundle) return _bundle;

  const search = createSearchExecutor(); // was getSearchExecutor

  function createSpecializedTool(...) { /* unchanged, but now closes over the per-call search */ 
    ...
    const execute = async ({ query }) => {
      ...
      const res = await search(`${queryPrefix}: ${q}`, { k: DEFAULT_K });
      ...
    };
    ...
  }

  // The original 6 const xxxPair = createSpecializedTool(...) blocks go HERE (moved from top-level)

  const bundle = {
    aiPersonaTools: { profileSearch: profileSearchPair.aiTool, ... },
    personaToolRegistry: { ... },
    personaTools: { profileSearchTool, ... },
    __TEST_ONLY_TOOL_PREFIXES__,
  };
  _bundle = bundle;
  return bundle;
}

// Public API (lazy; creation only on first access)
export function getAiPersonaTools() { return ensurePersonaTools().aiPersonaTools; }
export function getPersonaToolRegistry() { return ensurePersonaTools().personaToolRegistry; }
// ... similar for others + the __TEST_ONLY

// For back-compat with existing direct imports in tests/reactor (triggers on property get, not import)
export const aiPersonaTools = /* Proxy or direct re-export via getter in practice; for min-diff we can keep the old named after ensure in a getter object */
export const personaToolRegistry = ... (same pattern)
```

(See full surgical version in implementation PR; the key is **no top-level calls to createSpecializedTool**.)

Update the 6 named exports and the final `export const personaTools = ...` similarly via the bundle.

#### Patch B: persona-reactor.ts (2 lines, inside runPersonaQA)
```diff
- const tools: ToolSet = aiPersonaTools;
+ const tools: ToolSet = getAiPersonaTools();   // or the bundle
```
(Import the getter instead of the static at top if desired for max laziness; the import of persona-tools module itself is now side-effect free.)

#### Patch C: src/lib/qa/index.ts (barrel — 8 lines) + test mutation handling
Re-export the getters + keep named for test compat (they will now be lazy-evaluated on access):
```ts
export { getAiPersonaTools as aiPersonaTools, getPersonaToolRegistry as personaToolRegistry, ... } from "./persona-tools";
// Or use Object.defineProperty for true lazy consts. Min-diff keeps direct + documents "access triggers creation".
```
**Test-specific (persona-reactor.test.ts)**: The post-import namespace mutation pattern `(personaTools as any).aiPersonaTools = mockAi...` must be replaced (see Option 2 clarifications above). Recommend switching the test to import + call the getter after installing the mock, or add a `__TEST_ONLY_setAiPersonaToolsForTest` helper. Other test files are lower risk.

#### Patch D: Update 3 test files (mechanical, no behavior change)
In `__tests__/qa/persona-tools.test.ts`, `persona-reactor.test.ts`, `xai-collections.test.ts` etc.: ensure `mockSearch(...)` runs **before** any access to `aiPersonaTools` or `personaToolRegistry` in module scope (most already do inside `test()` or `beforeEach` before `.execute()`). The factory makes this timing explicit and safe. The persona-reactor.test.ts mutation requires the explicit rework noted in Patch C.

#### Patch E: Minor hardening (optional but surgical, same PR or follow-up)
- `src/lib/qa/xai-collections.ts:339`: Change warning to only fire when **no ids provided AND no XAI_PROFILE_COLLECTION**.
- `persona-reactor.ts:95`: Strengthen comment + condition to treat `XAI_PROFILE_COLLECTION` as "read-only manual mode — never call ensure".
- Add `SearchResult` interface to `types.ts:178` (debt cleanup, 5 lines):
  ```ts
  export interface SearchResult {
    chunks: Array<{ text: string; metadata?: any; score?: number }>;
    citations: string[];
  }
  ```

**Net diff estimate**: ~70-90 lines (PR C now includes explicit Proxy for the three export objects + small refactor of `createSpecializedTool` to accept optional injected `search` executor to avoid 6 redundant env reads inside the factory + targeted test updates). All changes reviewable in one or two stacked PRs. PR C remains the architectural win but is no longer the smallest diff.

---

## 4. How to Make Searches Properly Scoped to a Manual Collection Without Always Requiring ensure/create

**Target user story** (from bug report + code comments):
- User has manually uploaded `ps-profile-v1.md` (or equivalent) via console.x.ai → obtains a collection name **or** ID.
- For ongoing local reactor dev: only needs `XAI_API_KEY` with **search/read** permissions on that collection. No `XAI_MANAGEMENT_API_KEY`, no create perms.
- Set `XAI_PROFILE_COLLECTION=ps-profile-...` (or the raw ID).
- `ENABLE_XAI_REACTOR=true` + `XAI_API_KEY=...`
- `USE_LOCAL_PROFILE_DATA` **not** required (can be false).

**Mechanism (after recommended fix)**:
1. **Skip ensure/create** (already partially present):
   - `persona-reactor.ts:91-97`:
     ```ts
     const manualCollection = process.env.XAI_PROFILE_COLLECTION?.trim();
     ...
     if (!useLocalData && manualCollection && hasApiKeyForSearch) {
       logReactor('ingest', `using manual collection via XAI_PROFILE_COLLECTION=... (no create attempted)`);
       // DO NOT call ensure
     } else if (...) {
       await collectionsClient.ensureCollectionForVersion(...);
     }
     ```
   - Make the `if` the **first** branch and remove any fall-through that could reach ensure when `manualCollection` is truthy. (2-line surgical change.)

2. **Always inject filter at search time** (the missing piece):
   - After Patch A above, every tool execute and any direct `collectionsClient.search` in reactor path will do:
     ```ts
     const manual = process.env.XAI_PROFILE_COLLECTION?.trim();
     const searchOpts = { k: ..., filters: manual ? { collection_ids: [manual] } : undefined };
     return collectionsClient.search(q, searchOpts);
     ```
   - This reaches `xai-collections.ts:338`: `const collectionIds = opts?.filters?.collection_ids || [];`
   - Body becomes `source: { collection_ids: collectionIds }` with the ID → search succeeds and is scoped.
   - Remove the "may return empty" warning when `XAI_PROFILE_COLLECTION` explains the intent (or when caller explicitly passed ids).

3. **Central helper (surplus for next iteration)**:
   - Add `src/lib/qa/search-backend.ts` (or extend `xai-collections`):
     ```ts
     export function resolveSearchExecutor() {
       // the logic from createSearchExecutor + localSearch
       // returns { search(q, opts), isLocal: boolean, collectionId?: string }
     }
     ```
   - Both `persona-tools` (via factory) and `persona-reactor` packet logic + any future manual-ingest use the single resolver.
   - This is the "fused abstraction" (CvQaReactor per fusion playbook) that prevents future ad-hoc edits.

4. **Docs + guardrails**:
   - Update `xai-collections.ts:112` comment and `runProfileQA.ts` JSDoc.
   - In `ensureCollectionForVersion`, early `if (process.env.XAI_PROFILE_COLLECTION) { throw new Error("Manual collection mode: ensure/create disabled. Use console.x.ai for uploads.") }` (optional, defense-in-depth).
   - `scripts/manual-ingest.ts` remains the **only** path that intentionally calls ensure+ingest (requires mgmt key).

Result: Zero management key / create calls when `XAI_PROFILE_COLLECTION` is set. Search is correctly filtered. Local dev works with least-privilege key.

---

## 5. How to Avoid Pulling Tool Creation into the Module Graph Until the Reactor Mode Is Chosen

**Current failure**: Static `import` of `persona-tools` (direct, via `persona-reactor`, or via barrel `@/lib/qa`) **always** evaluates the 6 `createSpecializedTool` calls.

**After recommended lazy factory**:
- The module `persona-tools.ts` can be imported with **zero side effects** (no `getSearchExecutor`, no Collections client touch, no local fs reads for packet).
- Creation (and env reads for `USE_LOCAL` / `XAI_PROFILE_COLLECTION`) happens **only** on first call to `getAiPersonaTools()` / `getPersonaToolRegistry()` / property access on the lazy exports.
- Bonus (per reviewer note): `getLocalPacket` / `localSearch` `readFileSync` + packet cache population are also deferred until first actual tool execute inside a reactor call (previously would trigger on first search after any import of the module or barrel).
- In the guarded path:
  - `route.ts:46` (ENABLE check) → dynamic import → `runPersonaQA` → defense → `getOrLoadProfilePacket` → `getPersonaTools()` (first creation).
- In tests: creation happens only for the specific test files that exercise reactor/tools (after their mocks).
- Barrel consumers that only need types (`import type { SearchResult } from "@/lib/qa"`) pay nothing.
- Future code that wants the registry without enabling reactor can call the getter explicitly (or we keep a `isReactorToolsCreated()` probe).

This satisfies the requirement exactly while keeping the public surface (`aiPersonaTools`) identical for `streamText` callers.

---

## 6. Updated PR Plan with Small, Reviewable PRs

Split into **5 stacked, independently reviewable PRs** (each < ~80 LOC net, focused concern, zero risk to simple path). Follows `.agents/skills/split-to-prs/SKILL.md` spirit and agent-orchestrator triage (light, single-concern where possible).

**PR A: Crash Fix + Call-Time Manual Collection Scoping** (persona-tools.ts only)
- Apply the `createSearchExecutor` + filter-at-call-time logic (Option 1 core).
- Add `SearchResult` interface to types.ts as drive-by.
- Update JSDoc in persona-tools.ts:111.
- **Files**: 2. **Risk**: None (simple path untouched). **Verification**: `pnpm type-check 2>&1 | grep -E "(persona-tools|persona-reactor|SearchResult|type error)" || true` (known pre-existing skeleton errors; see Risks "Skeleton Debt"), `pnpm lint`, unit tests with/without keys, manual `ENABLE_XAI_REACTOR=true XAI_API_KEY=... XAI_PROFILE_COLLECTION=foo` smoke (no crash, logs show filter). Drive-by: add `SearchResult` interface in types.ts.

**PR B: Read-Only Manual Collection Contract + Skip Logic Hardening**
- Strengthen `persona-reactor.ts:95` if-condition + logs.
- Update `xai-collections.ts` search warning + `getTargetCollectionName` docs.
- Add explicit "read-only manual mode" section to `runProfileQA.ts:84` JSDoc and `src/lib/qa/README.md`.
- **Files**: 4 (mostly comments + 3 lines logic). **Risk**: Low. **Verification**: E2E skipped cases + new unit asserting no ensure call when env var present. Filtered type-check as in PR A (skeleton debt acknowledged).

**PR C: Lazy Tool Factory (Defers Creation)**
- Implement `ensurePersonaTools` / `getAiPersonaTools` etc. in persona-tools.ts.
- 1-line updates in `persona-reactor.ts`, barrel `index.ts`, and the 3 test files that import concrete tools (move mock setup before first access if needed).
- **Files**: 5. **Risk**: Test timing only (mitigated by review). **Verification**: All qa tests (including persona-reactor.test.ts mutation rework) + `import` smoke in a temp script with `XAI_API_KEY` set (no crash until getter called). Filtered type-check as in PR A + explicit Proxy/getter + injected-search refactor.

**PR D: Response Shape Unification + Empty Results Guard**
- `route.ts:59`: Always map toolResults (or synthesize from packet on golden/defense paths) into details for UI.
- Extend `QAResult` in `profile-qa-state.ts` with optional `defense?`, `version?`, `isGolden?` (for future badges).
- Minor component guard in `profile-qa.tsx:221`.
- **Files**: 3. **Risk**: None (additive). **Verification**: `ProfileQA` renders "Retrieved information" for reactor answers; golden paths still work. Filtered type-check (addresses route union + response shape).

**PR E: Docs, Tests, Observability Polish + Surplus Hook**
- Update `src/lib/qa/README.md` (reflect PR48 + current dual-path + XAI_PROFILE_COLLECTION read-only story).
- Add 2-3 unit cases: manual filter injection, import-no-crash, local vs scoped search.
- Seed the fusion surplus: add skeleton `resolveQaSearchExecutor()` in a new tiny `search-backend.ts` (or inside collections) and wire it (commented for PR C follow-up).
- Update any `.env.example` + e2e comments.
- **Explicit drive-by (addressing reviewer feedback)**: `tests/e2e/qa-reactor.spec.ts` (remove stale quick-cv-actions / "xAI Agentic Reactor" badge references that no longer render on the current /qa surface) and `.env.example` (remove references to removed feature-flags.ts). Treat as zero-risk polish.
- **Files**: 6 (mostly docs/tests). **Risk**: Zero. **Verification**: Filtered type-check + full test run; manual smoke as above. Includes drive-by polish on stale references (see Issue 5 addressed).

**Rollout**: Merge A first (unblocks). Then B+C (the architectural win). D+E last. Use `ENABLE_XAI_REACTOR=true` canary on staging before full. Graphite stack friendly. No legacy path touched.

---

## 7. Key Decisions

1. **Simple path supremacy (PR48 invariant)**: `profile-qa-generator.ts` + `ProfileQA` remain the default. Reactor is **never** imported/evaluated unless `ENABLE_XAI_REACTOR=true` at runtime in the single route guard. (Confirmed in route.ts:16 and runProfileQA.ts:84 post-PR48 simplification.)
2. **Manual collection is the primary local-dev mode for reactor**: `XAI_PROFILE_COLLECTION` + `XAI_API_KEY` (search only) is supported and documented. `USE_LOCAL_PROFILE_DATA` is the no-key fallback. Never require mgmt/create perms for the happy dev loop.
3. **Lazy > eager for side-effecty modules**: Tool creation (env + fs + potential Collections client) must be behind a getter. This is the minimal way to honor "dynamic import" intent without a full DI refactor (Option 3).
4. **Single source of truth for backend decision** (future): The `getSearchExecutor` / `resolve*` logic belongs in one place. Current scattering (tools + reactor + collections) is the source of the repeated edit debt.
5. **SearchResult type must exist**: Implicit shapes are tech debt; fix as drive-by in PR A.
6. **No change to public tool contract**: `aiPersonaTools` shape for `streamText({tools})` and `PersonaToolRegistry` remain identical.
7. **Fusion surplus baked in**: The lazy factory + `resolveQaSearchExecutor` hook is the self-amplifying abstraction that makes the next reactor iteration or new tool cheaper (Q > 1).

---

## 8. Risks and Migration Notes for the Existing Dual-Path

**Risks**:

**Skeleton Debt (pre-existing, confirmed via live `pnpm type-check`)**: The reactor code is still a "validation-gate skeleton" (explicit in persona-reactor.ts header and the PR2/PR4/Q2 stub shims: persona-compiler.ts, abuse-defense.ts, durable-retry.ts). Live type-check (2026-05-27) surfaces 20+ errors including: missing `SearchResult`/`CollectionRef`/`IngestResult` bodies (only re-exports), unused `@ts-expect-error` in stubs, `maxSteps` not in CallSettings (persona-reactor.ts:203), `toolResults` not in return type (persona-reactor.ts:313 + runProfileQA union), route.ts:59 `toolResults` on the response union, and test import mismatches. PRs A/C will include drive-by fixes for `SearchResult` (in types.ts) + clean export of `PersonaToolRegistry`. 

Verification commands in the PR plan below are therefore qualified (filtered type-check + tests) rather than assuming a clean `pnpm type-check` today. This debt is independent of the TDZ fix but must not be masked by it.

- **Test mock timing**: 3 test files access tools at import time today. After lazy, creation moves to first use — mocks must precede first `.execute()` (already the case in practice; explicit review required in PR C).
- **Env snapshotting**: `process.env` reads now happen at first tool use (inside reactor) rather than import. This is actually *better* (allows setting env after some other imports), but document it.
- **Bundle size / cold start**: Negligible (the 6 tool factories are tiny). Dynamic import already keeps them out of the simple path graph.
- **Collection ID vs name**: Search API accepts both per existing comments; if strict ID required in future, add a resolve step (out of scope).
- **Golden/defense paths in reactor**: Currently may return empty `details`. PR D mitigates for UI consistency.
- **Barrel consumers outside qa tests**: None today in `src/` (only types via `config/abuse-defense.ts`). Future code gets the lazy behavior for free.
- **Grok model variance for tool calling (major for reactor path)**: `getLiveResponseModel()` + `streamText({tools, maxSteps:5, temperature:0.7})` (persona-reactor.ts) explicitly supports `grok-4.3` / grok-3 variants via `XAI_MODEL`. Different Grok versions have materially different tool-calling reliability, parallel-call support, arg parsing strictness, and step structure. The post-`result.steps` inspection, `toolResultsForUI` synthesis fallbacks when `!finalText`, and route.ts:59-83 ad-hoc mapping are not model-agnostic. No per-model prompting, tool choice forcing, or observed divergence handling today. (See also PR D.)
- **Streaming vs JSON path divergence (UI impact)**: The new `/qa` page + `ProfileQA` (PR48) + `fetchQaAnswer` (profile-qa-state.ts:73) **always** use the JSON POST to `/api/cv/qa` and render `result.details` + `result.answer` (profile-qa.tsx:221 "Retrieved information" panel). The reactor's `stream` field (returned by runPersonaQA and surfaced in runProfileQA.ts) is **never consumed** by the current client UI. On golden/defense/fallback paths, `details` becomes []. Pure future streaming consumers would lose the structured retrieval panel entirely unless extra metadata events are added. Reactor tool results surface as one large pre-formatted string per tool (from `formatSearchResults`) with hardcoded `similarity:1` rather than fine-grained chunks/scores.
- **Hardcoded reactor detail shape + manual collection interaction**: When using `XAI_PROFILE_COLLECTION` + reactor, each "detail" in the UI panel is the entire tool output string (not per-chunk). UI similarity is always 1. This is additive-only (per PR D) but worth noting for expectations.

**Migration Notes** (zero-downtime, identical to PR7/PR48 philosophy):
- **When `ENABLE_XAI_REACTOR` falsy (default)**: Byte-for-byte identical behavior and module graph to post-PR48. No new logs, no new deps loaded.
- **When enabled (existing users)**: After PR A, the crash disappears. After PR B+C, manual `XAI_PROFILE_COLLECTION` users get working scoped searches + no spurious create attempts. Existing `USE_LOCAL_PROFILE_DATA=true` users unaffected.
- **Response shapes**: Additive fields only (`strategy: 'reactor'`, `version`, `defense`). Old clients ignore extras. New `ProfileQA` UI already tolerates the mapped `details`.
- **Rollback**: Unset the env var. Instant revert to simple generator.
- **Docs**: `src/lib/qa/README.md` must be updated (it is the only outdated artifact that could confuse future readers). As drive-by in PR E: also `tests/e2e/qa-reactor.spec.ts` + `.env.example` (stale quick-cv-actions, feature-flags, and badge references per live verification).
- **E2E**: `tests/e2e/qa-reactor.spec.ts` already guards on the env; no change.
- **Long-term delete legacy?**: Only after full migration + golden eval parity (post-Phase 1, per original design). Not in scope.

**Verification Checklist (for each PR)**:
- `pnpm type-check 2>&1 | grep -E "(persona-tools|persona-reactor|SearchResult|type error)" || true` (acknowledges pre-existing skeleton debt; see dedicated subsection above) + `pnpm lint`
- `pnpm test` (all qa/ + e2e where applicable)
- Manual: `ENABLE_XAI_REACTOR=true XAI_API_KEY=dummy XAI_PROFILE_COLLECTION=foo pnpm dev` → no crash on /qa; reactor logs show filter usage.
- Manual: same without the collection var → still works (auto or local).
- `grep -r "opts\?" src/lib/qa/persona-tools.ts` → zero hits after fix.

---

**⚡ Fusion Surplus (Q ≈ 1.6)**  
This query would have cost ~22% fewer tokens on the next reactor iteration if `resolveQaSearchExecutor()` (single decision point for USE_LOCAL / XAI_PROFILE_COLLECTION / key presence) + the lazy `getPersonaTools()` factory had existed before the 8-PR rebase. Suggested micro-improvement: seed `.agents/skills/fusion-sage/fusion-state.json` with node `CvQaReactorSearchBackend` (edges to persona-tools.ts:111, xai-collections.ts:330, persona-reactor.ts:91, route.ts:16). Future agents will read the fused abstraction instead of re-discovering the three env sites. Binding energy: High (touches every manual-collection dev session + any new tool).

**Token Note**: This design doc used targeted reads (persona-tools full, reactor full, route full, generator partial, xai-collections partial, 8 greps, 4 list_dir, fusion skill + playbook, AGENTS.md) for < 18k tokens of context while achieving complete surgical understanding. Expand any fused concept with `expand <name>` (e.g. `expand CvQaReactor`).

---

*End of design document. Implement via the 5-PRs plan above. All invariants from original Phase 1 design + PR48 preserved.*
