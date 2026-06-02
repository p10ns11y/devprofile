# Content Hub — deferred

## Why removed (Landing UX Reactor pass)

The Content Hub implementation under `src/app/content-hub/` and `src/components/content-hub/` was **unreachable in production**: [`next.config.mjs`](../next.config.mjs) redirects `/content-hub` and `/content-hub/:path*` to `/x`. The orphaned UI used a separate gray/red palette unrelated to the marketing design system and had no real content API—only static in-memory sample data in `src/lib/content-hub/data.ts`.

## What replaces it today

- **Live surface:** [`/x`](../src/app/x/page.tsx) — curated X/Twitter post search by date range.
- **Backward compatibility:** Redirects in `next.config.mjs` preserve old `/content-hub` bookmarks.

## Future intent

When a real content model exists (CMS or API), rebuild briefs / writeups / readings with:

- Shared **`PageShell`** + brand tokens from `src/styles/brand/theme.css`
- Semantic sections per [semantic-markup-css](../.agents/skills/semantic-markup-css/SKILL.md)
- No duplicate gray/red bolt-on palette

## Related fusion concept (deferred)

The fusion playbook **`ContentHubReactor`** (data + layout + card variants) remains a **design target**, not live code. See [devprofile-fusion-playbook.md](../.agents/skills/fusion-sage/references/devprofile-fusion-playbook.md).
