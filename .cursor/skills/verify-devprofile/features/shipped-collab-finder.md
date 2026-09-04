---
path: /shipped/collab-finder
---

# collab-finder walkthrough

Career heading cockpit walkthrough for kanithanj.ai. Product band first: hunt loop, Preferences pack health, Pipeline, local SQLite ledger. Architecture Mermaid follows. Complementary satellite — not a second chat OS.

Map stays accurate to shipped **collab-finder** `main`: Preferences pack health (merged #32), Pipeline hunt progress (merged #31), kanithanj.cv CLI (merged #29). Do not invent live metrics.

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub / live CTAs.
- `shipped-product-band` — product sections before the tech band; satellite/not-a-chat callout plus four surface cards.
- `shipped-hunt-loop` — Hunt loop card: Discover / Mission / Sweden / Xplore and Evaluate → Prepare → Generate.
- `shipped-pack-health` — Preferences pack health card; Seeded / Stub identity / Missing labeled **Sample**.
- `shipped-pipeline` — Pipeline card; prep and outcome enums labeled **Sample**. No live counts.
- `shipped-ledger` — Local SQLite ledger card.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram (hunt / grounding / ledger / apply), stack chips, and tech sections.

## Observable contract

- Product band includes cards titled Hunt loop, Preferences pack health, Pipeline, Local SQLite ledger.
- Sample lines use `data-sample` and the visible word **Sample**.
- Architecture diagram is mermaid-first and names Preferences pack health, Pipeline, and kanithanj.cv.
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
- Pack-health and pipeline copy describes shipped enums and file kinds. It is not a live operator machine.
- Complementary framing: career heading cockpit satellite. Do not describe this page as a chat OS, ensembly, life-os, or botify walkthrough.
