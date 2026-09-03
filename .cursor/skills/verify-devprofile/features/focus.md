---
path: /articles
---

# Articles

Longform article index: harness, memory, cost of the next observation.

## Sub-features

- `articles-title` shows heading Articles and the lede.
- `articles-cards` lists featured and rest cards; every card image must decode (`naturalWidth > 0`).

## How to get to it (user POV)

- Open `/articles`.
- Choose Articles in the primary header.
- Legacy `/essays` and `/focus` redirect here (301).

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/articles pnpm test:e2e:ux`.
- **Card images.** `pnpm exec playwright test tests/e2e/content/focus-essay-images.content.spec.ts`.
- **Pixels.** `VERIFY_FEATURE=/articles pnpm test:e2e:visual`.

## Gotchas

- `?paper=view` redirects into an essay. Baseline is the index without that query.
- Card art is served from `public/images/` via `<img>`; SVGs must be valid UTF-8 XML or the frame paints empty while HTTP 200.
