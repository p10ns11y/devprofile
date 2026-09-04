---
path: /projects
---

# Projects

Product gallery of architecture walkthroughs. Each card links to a slug page with product and tech bands.

## Sub-features

- `projects-index-title` — h1 "Projects" and lede about product gallery.
- `projects-gallery` — "Product gallery" section lists walkthrough cards (collab-finder, thepulimaangani, Adaptate, agent-prompt-tuning-lab).
- `projects-card-links` — each card links to `/projects/<slug>`.

## How to get to it (user POV)

- Choose Projects in the primary header or footer.
- Open `/projects` directly.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/projects pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/projects pnpm test:e2e:visual`.

## Gotchas

- Home (`/`) does not mount `#projects`; the gallery lives on this route only.
- Card count follows `listProjectWalkthroughs()` (3–4 substantive walkthroughs).
