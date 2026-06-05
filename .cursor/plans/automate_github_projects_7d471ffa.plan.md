---
name: Automate GitHub Projects
overview: "Replace three manually synced project lists with one policy-driven selection pipeline: score repos by your existing `high-quality` GitHub topic plus recency signals, apply a blocklist, and render unified project cards (with optional PR/commit links) on the live dashboard."
todos:
  - id: policy-manifest
    content: Add github-projects-policy.json + typed loader (qualityTopics, excludeRepos, limits, scoring weights)
    status: pending
  - id: selection-engine
    content: "Implement project-selection.ts: topic gate, scoring, blocklist, featured/recent dedupe + unit tests"
    status: pending
  - id: topics-fetch
    content: Add GraphQL repos-with-topics fetch with REST fallback; integrate into dashboard-snapshot.ts
    status: pending
  - id: enrichment
    content: Add latest commit + batched PR search enrichment on snapshot build
    status: pending
  - id: remove-slug-dup
    content: Remove CREATIVE_PROJECTS_BY_OWNER from creative-projects.ts and dashboard-cache-client.js; extend snapshot shape
    status: pending
  - id: ui-cards
    content: "Update github-live-dashboard.js: Featured/Recent sections, topics on all cards, commit/PR link row"
    status: pending
  - id: verify
    content: Run type-check, lint, manual check on /status/code/200; optional validate script for policy/blocklist
    status: pending
isProject: false
---

# Automate featured GitHub projects

## Problem (today)

You maintain the same intent in **four places** with no shared engine:

| Surface | File | Maintenance |
|---------|------|-------------|
| CV featured | [`src/lib/cv-featured-projects.ts`](src/lib/cv-featured-projects.ts) | Hard-coded keys `selfie-signin`, `adaptate` |
| Creative dashboard | [`src/lib/github/creative-projects.ts`](src/lib/github/creative-projects.ts) | Manual `owner/repo` slugs per handle |
| Client cache duplicate | [`src/lib/github/dashboard-cache-client.js`](src/lib/github/dashboard-cache-client.js) | Copy-pasted slug list (synced only via file copy in [`scripts/sync-github-dashboard-cache.mjs`](scripts/sync-github-dashboard-cache.mjs)) |
| Narrative metadata | [`src/data/cvdata.json`](src/data/cvdata.json) | Rich copy, images, `prs[]` — separate from GitHub live data |

**Live dashboard behavior today** ([`src/web-components/github-live-dashboard.js`](src/web-components/github-live-dashboard.js)):
- **Creative Projects** — manual slugs + per-repo topic fetch
- **Recently Pushed** — already repo cards (not PRs), but **no topics**, no PR/commit links, capped at 8

**PR rows** only appear in README SVG embeds ([`src/app/api/ghcards/recent-prs/route.ts`](src/app/api/ghcards/recent-prs/route.ts), [`activity-overview`](src/app/api/ghcards/activity-overview/route.ts)) — separate from the interactive dashboard.

```mermaid
flowchart LR
  subgraph manual [Manual today]
    CV[cv-featured-projects.ts]
    Creative[creative-projects.ts]
    CacheDup[dashboard-cache-client.js]
  end
  subgraph api [GitHub API]
    User[/users/username]
    Repos[/users/username/repos]
    RepoDetail[/repos/owner/repo per slug]
  end
  subgraph ui [Live dashboard]
    CreativeSection[Creative Projects cards]
    RecentSection[Recently Pushed cards]
  end
  Creative --> RepoDetail
  CacheDup --> Creative
  Repos --> RecentSection
  RepoDetail --> CreativeSection
```

---

## Product decision (confirmed)

- **Curation model:** Hybrid — **auto topic/score selection** for the dashboard + **manual blocklist** to hide scratch/fork noise.
- **Quality signal:** You already tag showcase repos with GitHub topic **`high-quality`**. Use that as the primary gate, wrapped in a **configurable scoring rubric** (recency, description, stars, etc.).

**What stays manual (intentionally):**
- [`cvdata.json`](src/data/cvdata.json) — marketing copy, images, impact lines, OSS `prs[]` evidence for Q&A/CV.
- Blocklist entries — repos you never want surfaced even if recently pushed.
- CV narrative pins (optional Phase 3) — `selfie-signin` / `adaptate` keys for PDF/web CV unless you later map them to GitHub slugs in policy.

---

## Target architecture

### 1. Single policy manifest

Add [`src/data/github-projects-policy.json`](src/data/github-projects-policy.json) (or `.ts` if you prefer compile-time validation):

```json
{
  "owners": ["p10ns11y", "thecuriousts"],
  "qualityTopics": ["high-quality"],
  "excludeRepos": ["owner/scratch-repo"],
  "limits": { "featured": 15, "recentActivity": 10 },
  "scoring": {
    "topicMatch": 50,
    "pushedWithinDays": { "30": 20, "90": 10 },
    "hasDescription": 5,
    "minStarsBonus": 1
  }
}
```

- **`qualityTopics`** — must include `high-quality` (your existing labels).
- **`excludeRepos`** — blocklist (your chosen hybrid control).
- **`limits.featured`** — top 10–15 scored repos with `high-quality` topic.
- **`limits.recentActivity`** — recency feed size (project cards, not PR rows).

Typed wrapper: [`src/lib/github/projects-policy.ts`](src/lib/github/projects-policy.ts) exports `getProjectsPolicy()` + Zod/JSON validation.

### 2. Selection engine (shared server + client fallback)

New [`src/lib/github/project-selection.ts`](src/lib/github/project-selection.ts):

**Inputs:** `repos[]` (from list endpoint), `topicsByRepo` map, policy.

**Pipeline:**
1. Drop `fork`, `private`, and `excludeRepos`.
2. **Featured candidates:** repos whose topics intersect `qualityTopics`.
3. **Score** each candidate: topic hit (dominant) + `pushed_at` decay + `description` + `stargazers_count`.
4. Sort desc, `slice(limits.featured)`.
5. **Recent activity:** sort all non-excluded by `pushed_at`, `slice(limits.recentActivity)`, **dedupe** repos already in featured (featured wins).

**Output shape** (extend snapshot):

```ts
type ProjectCardEntry = {
  fullName: string;
  repo: Record<string, unknown>;
  topics: string[];
  score: number;
  latestCommit?: { sha: string; url: string; pushedAt: string };
  latestPr?: { number: number; url: string; title: string; state: string };
};
```

### 3. Efficient topic fetch (rate-limit safe)

Today [`dashboard-snapshot.ts`](src/lib/github/dashboard-snapshot.ts) fetches topics **only for manual slugs** (N extra calls). Automation needs topics for **all owner repos**.

**Recommended:** one GraphQL query per owner in [`src/lib/github/repos-with-topics.ts`](src/lib/github/repos-with-topics.ts):

```graphql
repositoryTopics(first: 20) { nodes { topic { name } } }
```

- 1 call per owner vs up to 100 REST `/repos/{full}` calls.
- Reuse existing `GITHUB_TOKEN` from [`src/lib/github/client.ts`](src/lib/github/client.ts).
- REST fallback: fetch topics only for top-30 `pushed_at` candidates if GraphQL fails.

### 4. PR + commit enrichment (snapshot time, not per-card)

In [`fetchDashboardSnapshot`](src/lib/github/dashboard-snapshot.ts):

| Link | Source | Calls |
|------|--------|-------|
| **Commit** | `GET /repos/{full}/commits?per_page=1` for featured + recent repos | ~25 max, parallel with cap |
| **PR** | One search: `author:{user}+type:pr+sort:updated` (pattern from [`recent-prs/route.ts`](src/app/api/ghcards/recent-prs/route.ts)), map `repository_url` → latest PR per repo | 1 call |

Merge with [`cvdata.json`](src/data/cvdata.json) `prs[]` when `project.url` matches repo (OSS evidence preserved for pinned OSS rows; optional Phase 3).

### 5. Deprecate manual slug lists

| Remove / replace | With |
|------------------|------|
| `CREATIVE_PROJECTS_BY_OWNER` in [`creative-projects.ts`](src/lib/github/creative-projects.ts) | `selectFeaturedProjects()` from policy |
| Duplicate in [`dashboard-cache-client.js`](src/lib/github/dashboard-cache-client.js) | Snapshot fields only — **no local slug list** |
| `creativeProjects` snapshot field | `featuredProjects` + `recentProjects` |

Client fallback path in `dashboard-cache-client.js` currently rebuilds creative projects from slugs when Background Fetch completes partial records — update to call the same selection helpers (extract shared scoring into a small `.ts` module + generate a thin `.js` copy, or move selection entirely server-side and let client only consume `/api/github/dashboard`).

**Simplest path:** selection runs **only on server**; client cache stores enriched snapshot as-is. Direct GitHub REST fallback (offline/rate-limit) shows degraded cards without PR/commit links but still lists repos by `pushed_at`.

### 6. UI: one card component, two sections

Update [`github-live-dashboard.js`](src/web-components/github-live-dashboard.js):

**`renderRepoCard` additions:**
- `topics` on **both** sections (today only Creative has chips).
- Footer link row: `Latest commit` · `PR #N` (when enriched; hide when absent).
- Optional `quality` badge when `high-quality` topic present.

**Section rename (clearer PM story):**
- "Creative Projects" → **"Featured Projects"** — auto, topic-scored, up to 15.
- "Recently Pushed" → **"Recent Activity"** — project cards (not PR list), up to 10, deduped.

This directly addresses: *recently pushed lists show the project card instead of pull request* — PRs become **secondary links on the card**, not the primary row type.

### 7. CV featured projects (Phase 3 — optional in same PR or follow-up)

[`cv-featured-projects.ts`](src/lib/cv-featured-projects.ts) comment already says "unify sourcing." Low-risk follow-up:

- Add `cvPinnedKeys: ["selfie-signin", "adaptate"]` to policy.
- Add optional `githubSlug` on cvdata projects (or derive from `url`).
- CI check: every `cvPinnedKeys` entry resolves in cvdata.

Do **not** auto-replace CV featured with GitHub scoring — CV is narrative-controlled; dashboard is activity-controlled.

---

## Data flow (target)

```mermaid
flowchart TB
  Policy[github-projects-policy.json]
  GraphQL[repos-with-topics GraphQL]
  ReposREST[/users/repos REST]
  PRSearch[search issues author PRs]
  Commits[per-repo latest commit]
  Select[project-selection.ts]
  API[/api/github/dashboard]
  Cache[dashboard-cache IndexedDB]
  UI[github-live-dashboard web component]

  Policy --> Select
  GraphQL --> Select
  ReposREST --> Select
  PRSearch --> Select
  Commits --> Select
  Select --> API
  API --> Cache
  Cache --> UI
```

---

## Rollout phases

### Phase 1 — Policy + selection (highest ROI)
- Add policy manifest + selection engine + tests.
- Extend `GitHubDashboardSnapshot` with `featuredProjects` / `recentProjects`.
- Wire [`dashboard-snapshot.ts`](src/lib/github/dashboard-snapshot.ts) + API route.
- Remove `CREATIVE_PROJECTS_BY_OWNER` duplication.

### Phase 2 — Richer cards
- GraphQL topics fetch.
- Commit + PR enrichment.
- Update `renderRepoCard` + styles for link row and topics on recent section.

### Phase 3 — Hygiene
- Blocklist + policy validation script (`pnpm validate:github-projects`).
- Optional: align ghcards [`recent-pushed`](src/app/api/ghcards/recent-pushed/route.ts) to reuse selection (README embeds match site).
- CV pin mapping + validation test.

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Untagged repos disappear from Featured | Document: add `high-quality` topic on GitHub; blocklist only hides |
| GraphQL / rate limits | Token required in prod; CDN 6h cache unchanged; cap commit fetches |
| `thecuriousts/premflow` on another owner | Policy `owners[]` already supports multi-handle |
| Client offline fallback loses scoring | Accept degraded mode; server snapshot is canonical |
| Breaking `creativeProjects` consumers | Grep + rename with backward-compat alias for one release |

---

## Verification

- Unit tests: scoring, blocklist, dedupe, topic gate ([`src/lib/github/project-selection.test.ts`](src/lib/github/project-selection.test.ts)).
- `pnpm type-check` + `pnpm lint` after TS changes.
- Manual: load `/status/code/200` — Featured shows only `high-quality` repos; Recent shows cards with topics; commit/PR links resolve.
- Confirm tagged repos on GitHub appear without editing slug lists.

---

## Files to touch (minimal set)

| Action | File |
|--------|------|
| **Add** | `src/data/github-projects-policy.json` |
| **Add** | `src/lib/github/projects-policy.ts` |
| **Add** | `src/lib/github/project-selection.ts` + test |
| **Add** | `src/lib/github/repos-with-topics.ts` |
| **Modify** | `src/lib/github/dashboard-snapshot.ts` |
| **Modify** | `src/lib/github/dashboard-cache-client.js` (remove slug list) |
| **Modify** | `src/web-components/github-live-dashboard.js` |
| **Deprecate** | `src/lib/github/creative-projects.ts` (re-export policy helpers or delete) |
| **Keep** | `src/lib/cv-featured-projects.ts` (Phase 3 optional unify) |
| **Keep** | `cvdata.json` narrative + `prs[]` for Q&A/OSS |

No change required to [`public/github-dashboard-cache.js`](public/github-dashboard-cache.js) directly — it is a build copy of the client module.
