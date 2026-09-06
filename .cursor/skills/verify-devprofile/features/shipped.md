---
path: /shipped
---

# Shipped

Walkthrough gallery and per-slug detail pages for systems that shipped.

## Index (`/shipped`)

- Gallery lists every walkthrough entry with outcomes, stack chips, and link to detail.
- Each card links to `/shipped/[slug]`.
- Exactly four walkthroughs: `ensembly`, `collab-finder`, `thepulimaangani`, `adaptate`.

## Sub-features

- `shipped-title` — heading Shipped and the gallery lede on the index.
- `shipped-cards` — walkthrough cards linking to `/shipped/[slug]`.

## Detail (`/shipped/[slug]`)

- Hero: breadcrumb (Shipped → project), title, lede, audience, outcomes, surfaces, GitHub / live / npm CTAs.
- Product band: product section blocks (callouts, cards, bullets, paragraphs, flows).
- `ensembly` product cards: daily workflow, human approval / automated work, portable memory sync, SQLite ops ledger — see [shipped-ensembly.md](./shipped-ensembly.md).
- `collab-finder` product cards: hunt loop, Preferences pack health, Pipeline, local SQLite ledger — see [shipped-collab-finder.md](./shipped-collab-finder.md).
- Tech band: **architecture Mermaid diagram first** (above stack chips and prose), then stack chips, then architecture / components / data-flow / tradeoffs / testing-ops sections.
- Diagram is the leading block in the architecture section data; the slug page hoists it above chips and strips it from section body copy so prose never precedes the diagram.

## Observable contract

- Every walkthrough with a tech band has `architecture` section `blocks[0].type === "mermaid"`.
- `getArchitectureDiagram(project)` must be defined for all four slugs.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts diagram-first data shape and exactly four slugs.

## How to get to it (user POV)

- Open `/shipped`.
- Choose **Shipped** in the primary header or footer Explore links.
- From the home About section, follow the architecture walkthroughs link.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/shipped pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/shipped pnpm test:e2e:visual`.

## Gotchas

- `/projects` and `/projects/[slug]` 301 redirect to `/shipped` equivalents.
- Detail pages expose an **All shipped** CTA back to the index.
