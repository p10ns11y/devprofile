---
path: /projects
---

# Shipped

Product walkthrough gallery and per-slug detail pages under `/projects`. Nav label is **Shipped**; URL stays `/projects`.

## Index (`/projects`)

- Gallery lists every walkthrough entry with outcomes, stack chips, and link to detail.
- Each card links to `/projects/[slug]`.

## Sub-features

- `shipped-title` — heading Shipped and the product-gallery lede on the index.
- `shipped-cards` — walkthrough cards linking to `/projects/[slug]`.
- `shipped-walkthrough` — hero breadcrumb (Shipped → project), outcomes, surfaces, and tech band on detail pages.

## Detail (`/projects/[slug]`)

- Hero: eyebrow, title, lede, audience, outcomes, surfaces, GitHub / live / npm CTAs.
- Product band: product section blocks (callouts, bullets, paragraphs).
- Tech band: **architecture Mermaid diagram first** (above stack chips and prose), then stack chips, then architecture / components / data-flow / tradeoffs / testing-ops sections.
- Diagram is the leading block in the architecture section data; the slug page hoists it above chips and strips it from section body copy so prose never precedes the diagram.

## Observable contract

- Every walkthrough with a tech band has `architecture` section `blocks[0].type === "mermaid"`.
- `getArchitectureDiagram(project)` must be defined for all four slugs: `collab-finder`, `thepulimaangani`, `adaptate`, `agent-prompt-tuning-lab`.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts diagram-first data shape.

## How to get to it (user POV)

- Open `/projects`.
- Choose **Shipped** in the primary header or footer Explore links.
- From the home About section, follow the architecture walkthroughs link.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/projects pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/projects pnpm test:e2e:visual`.

## Gotchas

- Nav and breadcrumbs say **Shipped**; paths remain `/projects` and `/projects/[slug]` (no redirect yet).
- Detail pages expose an **All shipped** CTA back to the index.
