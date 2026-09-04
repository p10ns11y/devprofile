---
path: /projects
---

<<<<<<< HEAD
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
=======
# Projects walkthroughs

Product walkthrough gallery and per-slug detail pages under `/projects`.

## Index (`/projects`)

- Gallery lists every `PROJECT_WALKTHROUGHS` entry with outcomes, stack chips, and link to detail.
- Each card links to `/projects/[slug]`.

## Detail (`/projects/[slug]`)

- Hero: eyebrow, title, lede, audience, outcomes, surfaces, GitHub / live / npm CTAs.
- Product band: product section blocks (callouts, bullets, paragraphs).
- Tech band: **architecture Mermaid diagram first** (above stack chips and prose), then stack chips, then architecture / components / data-flow / tradeoffs / testing-ops sections.
- Diagram is the leading block in the architecture section data; the slug page hoists it above chips and strips it from section body copy so prose never precedes the diagram.

## Observable contract

- Every walkthrough with a tech band has `architecture` section `blocks[0].type === "mermaid"`.
- `getArchitectureDiagram(project)` must be defined for all four slugs: `collab-finder`, `thepulimaangani`, `adaptate`, `agent-prompt-tuning-lab`.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts diagram-first data shape.
>>>>>>> ea059a8 (feat(projects): architecture diagrams before tech prose)
