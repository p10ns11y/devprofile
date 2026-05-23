# React client roadmap

Living backlog for aligning client UI with [react-client-expert](../.agents/skills/react-client-expert/SKILL.md). Implementation PRs should reference phase numbers and tick items from the skill **Review checklist**.

## Skill reference

| Topic | Rule |
|-------|------|
| Scope | `"use client"` trees only — no async client components; server `async` pages OK for static shells |
| State | Derive during render; minimal `useState`; no sync-via-`useEffect` |
| Effects | Subscriptions, DOM/imperative APIs, analytics — with cleanup |
| Data | `use(promise)` + Suspense or TanStack Query — not `useEffect` + fetch + booleans |
| Context | Narrow, stable values; memoize provider objects |
| Complex flows | XState when boolean + effect soup (AMA chat) |

**Lint:** Biome `useExhaustiveDependencies` is off — do not mechanically widen effect deps ([`biome.json`](../biome.json), [`AGENTS.md`](../AGENTS.md)).

## Architecture snapshot

```mermaid
flowchart TB
  subgraph serverOK [Server boundaries OK today]
    AMAPage["ama/page.tsx async"]
    CertPage["certificates/page.tsx async + flags"]
    RootLayout["layout.tsx sync"]
  end
  subgraph clientWork [Client trees to align with skill]
    AICHAT["ai-chat.tsx"]
    VerifyHash["verification-hash.tsx"]
    CertView["certificate-view.tsx"]
    DocViewer["document-viewer.tsx"]
    HomePage["page.tsx all client"]
  end
  subgraph depsToAdd [Not in repo yet]
    RQ["@tanstack/react-query"]
    XS["xstate + @xstate/react"]
  end
  AMAPage --> AICHAT
  CertPage --> CertView
  CertView --> DocViewer
  DocViewer --> VerifyHash
```

## Compliance snapshot

| Area | Status | Notes |
|------|--------|--------|
| Server vs client split | **Mostly OK** | [`ama/page.tsx`](../src/app/ama/page.tsx), [`certificates/page.tsx`](../src/app/certificates/page.tsx) async shells; [`page.tsx`](../src/app/page.tsx) entirely client (optional later split). |
| Fetch patterns | **OK for now** | No client `useEffect` fetch loaders; [`verification-hash.tsx`](../src/components/verification-hash.tsx) fetches on click; [`askQuestion`](../src/app/actions.ts) server action from chat. |
| TanStack Query / `use()` | **Not adopted** | Add when shared/refetchable client data appears. |
| XState | **Not adopted** | Best fit: [`ai-chat.tsx`](../src/components/ai-chat.tsx). |
| Legitimate effects | **OK** | [`content-layout.tsx`](../src/app/cv/content-layout.tsx) `matchMedia`; [`document-viewer.tsx`](../src/components/document-viewer.tsx) resize; [`sw-register.tsx`](../src/components/sw-register.tsx); [`hero.tsx`](../src/components/hero.tsx); [`useIntersectionObserver.ts`](../src/hooks/useIntersectionObserver.ts). |

## Client module audit (`"use client"`)

| Module | Phase | Notes |
|--------|-------|--------|
| `app/page.tsx` | 4 | Whole homepage client for motion — optional server + islands |
| `app/ama/page.tsx` | — | Async server shell only |
| `app/certificates/page.tsx` | — | Async server + flags |
| `app/certificates/certificate-view.tsx` | 1 ✅ | URL → selection derived (CHANGELOG) |
| `app/cv/page.tsx` | — | Dynamic layout import |
| `app/cv/content-layout.tsx` | — | `matchMedia` subscription OK |
| `app/cv/view/page.tsx` | — | `next/dynamic` for `@react-pdf/renderer` |
| `app/content-hub/[page]/page.tsx` | — | Client hub page |
| `app/quick-cv-actions/page.tsx` | — | Actions UI |
| `app/master-thesis.pdf/page.tsx` | — | PDF route |
| `components/ai-chat.tsx` | 1 ✅ / 2 | Scroll/streaming fixes done; XState in phase 2 |
| `components/ai-smart-highlight.tsx` | 1 ✅ | Dead props removed |
| `components/document-viewer.tsx` | 4 ✅ | Dynamic `react-pdf` chunk + Suspense |
| `components/document-sidebar.tsx` | — | Sidebar selection |
| `components/verification-hash.tsx` | 1 ✅ | Derived verification status |
| `components/theme-provider.tsx` | 1 ✅ | `useSyncExternalStore` + memoized context |
| `components/theme-toggle.tsx` | — | Uses theme context |
| `components/hero.tsx` | — | One-time particle init OK |
| `components/sw-register.tsx` | — | SW registration OK |
| `components/contact.tsx` | — | Local form state OK |
| `components/header.tsx` | — | Presentation |
| `components/projects.tsx` | — | Presentation |
| `components/experience.tsx` | — | Presentation |
| `components/accomplishments.tsx` | — | Presentation |
| `components/timeline.tsx` | — | Presentation |
| `components/content-hub/*` | — | Hub UI |

Modules without `"use client"` that wrap client children (e.g. `certificates/page.tsx`) are listed under server OK above.

## Phased roadmap

### Phase 1 — Quick wins (no new deps) — **Done** ([CHANGELOG](../CHANGELOG.md) § React client phase 1)

| File | Target | Status |
|------|--------|--------|
| `verification-hash.tsx` | Derive status in render; `certificateId` via `key` | ✅ Done |
| `theme-provider.tsx` | `useSyncExternalStore` + memoized context | ✅ Done |
| `certificate-view.tsx` | Derive selection from URL `id` | ✅ Done |
| `ai-chat.tsx` | Fix scroll/streaming effect deps | ✅ Done |
| `ai-smart-highlight.tsx` | Remove unused props | ✅ Done |

**Exit criteria:** `pnpm type-check`, `pnpm lint`, `pnpm test:e2e` (Brave).

### Phase 2 — AMA chat state machine (add XState)

| File | Issue | Target change |
|------|--------|---------------|
| `ai-chat.tsx` | `isLoading` + `streamingMessageId` + interval typing | `amaChatMachine.ts` + `useMachine`; cleanup in invoke/effect |
| `ama/page.tsx` | Server wrapper | No change if disclaimer + `<AICHAT />` only |

**Deps:** `xstate`, `@xstate/react` via `sfw pnpm add`.

**Exit:** E2E AMA specs; manual multi-turn when `/api/cv/qa` available.

### Phase 3 — Client data layer (TanStack Query when needed)

| Integration | Target |
|-------------|--------|
| `QueryClientProvider` in `layout.tsx` or `providers.tsx` | One root provider |
| Certificate hash verify | Optional `useQuery` / mutation for `/api/certificates/[id]/hash` |
| Future APIs | `queryKey` per resource |

**Lighter alternative:** parent passes `hashPromise` + child `use()` + Suspense for one-shot reads.

**Deps:** `@tanstack/react-query`.

### Phase 4 — Client boundaries (optional, larger)

| File | Issue | Target change | Status |
|------|--------|---------------|--------|
| `page.tsx` | Entire homepage client | Server page + client islands (`Hero`, `Header`, lazy `Projects`) | Pending |
| `document-viewer.tsx` | Module-scope `require("react-pdf")` | `next/dynamic` + Suspense; optional ResizeObserver vs `querySelector` | ✅ Done |

Defer homepage split until Phase 2 is stable.

## Explicitly acceptable (no action)

- `content-layout.tsx` — `matchMedia` with teardown
- `document-sidebar.tsx` — external doc list sync if present
- `hero.tsx` — one-time particle positions on mount
- `ama/page.tsx` / `certificates/page.tsx` — async server for flags/disclaimer only
- Local form state in `contact.tsx`, `question-answer.tsx`

## What not to do

- Do not use **async client components** for interactive UI.
- Do not widen `useEffect` deps to satisfy linters — fix the model.
- Do not put messages / streaming / search in Context.
- Do not add React Query for static in-memory content-hub data until there is a real API.

## Optional dependencies

When adding packages:

```bash
sfw pnpm add @tanstack/react-query   # phase 3
sfw pnpm add xstate @xstate/react    # phase 2
pnpm install
pnpm type-check && pnpm lint
```

## Review checklist (from skill)

- [ ] Client boundary minimal — server shells where possible
- [ ] No sync state via `useEffect`
- [ ] Effects have cleanup where needed
- [ ] Data via Query or `use()` + Suspense, not effect fetch soup
- [ ] Context values memoized; no wide app state in Context
- [ ] Complex flows use XState when boolean soup appears
