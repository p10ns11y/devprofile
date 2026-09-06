---
path: /shipped/collab-finder
---

# collab-finder walkthrough

Job hunt desktop app walkthrough for kanithanj.ai. Product band first: hunt loop, Preferences pack health, Pipeline, local SQLite ledger. Architecture Mermaid follows. Desktop app — not a chat replacement.

Map stays accurate to shipped **collab-finder** `main`: Preferences pack health, Pipeline hunt progress, CV generate CLI (kanithanj.cv). Do not invent live metrics.

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub / live CTAs.
- `shipped-product-band` — product sections before the tech band; not-a-chat callout plus four surface cards.
- `shipped-hunt-loop` — Hunt loop card: Discover / Mission / Sweden / Xplore and evaluate → prepare → generate.
- `shipped-pack-health` — Preferences pack health card; pack status labeled **Example**. Not a live machine.
- `shipped-pipeline` — Pipeline card; fixed stage labels **Example**. No live counts.
- `shipped-ledger` — Local SQLite ledger card.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram (hunt / grounding / ledger / apply), stack chips, and tech sections.

## Observable contract

- Product band includes cards titled Hunt loop, Pack file checks, Pipeline, Local database.
- Example lines use `data-example` and the visible word **Example**.
- Architecture diagram is mermaid-first and names Preferences pack health, Pipeline, Packs folder, and kanithanj.cv.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts this product-band shape.

## How to get to it (user POV)

- Open `/shipped` and choose the collab-finder card.
- Open `/shipped/collab-finder` directly.
- `/projects/collab-finder` 301-redirects here.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/shipped/collab-finder pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/shipped/collab-finder pnpm test:e2e:visual`.

## Gotchas

- Product cards live in `projects-section--product`, not the tech band.
- Pack-health and pipeline **Example** lines are demo labels only. They are not a live operator machine.
- Plain framing: desktop app for job hunting. Do not describe this page as a chat app, ensembly, life-os, or botify walkthrough.
