---
path: /shipped/ensembly
---

# ensembly walkthrough

Operator-kernel walkthrough for ensembly. Product band first: daily workflow, human approval / automated work, Pulse-pack, SQLite ops ledger. Architecture Mermaid follows. Local layer under Grok Bot / Build / Cursor — not a second chat app.

Map stays accurate to shipped **ensembly** `master` at `8e88b01` (merged #13): live crates are `ensembly-kernel`, `ensembly-memory`, and read-only `ensembly-mcp`. On 4 Sep 2026 the browser game, Node `swarm.js`, and WASM world sim moved under `prototype/`. Do not invent live metrics.

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub CTA.
- `shipped-product-band` — product sections before the tech band; not-a-chat callout plus four surface cards.
- `shipped-operator-loop` — Daily workflow card: load, status, tick, approve / deny / claim / complete, reflect.
- `shipped-hitl-hootl` — Human approval / automated work card; fixture actions and regimes labeled **Sample**.
- `shipped-pulse-pack` — Pulse-pack card; `ensembly-pulse-pack-v1` export / status / import labeled **Sample**. Legacy `peram-pulse-pack-v1` still imports.
- `shipped-ledger` — T1 SQLite ledger card. Fresh defaults `ensembly-ops.sqlite` / `ensembly-memory.json`. One-line discover-fallback for existing `peram-*` files until `migrate-local-paths` + pulse-pack resync.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram (Grok tools / ensembly-kernel / ensembly-memory / ensembly-mcp), stack chips, and tech sections.

## Observable contract

- Product band includes cards titled Daily workflow, Human approval / automated work, Pulse-pack, SQLite ops ledger.
- Sample lines use `data-sample` and the visible word **Sample**.
- Architecture diagram is mermaid-first and names ensembly-kernel, pulse-pack, ensembly-memory, and ensembly-mcp.
- Copy states Game of Peram is in `prototype/` and that this is not a second chat app.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts this product-band shape and ensembly-* crate names.

## How to get to it (user POV)

- Open `/shipped` and choose the ensembly card.
- Open `/shipped/ensembly` directly.
- `/projects/ensembly` 301-redirects here.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/shipped/ensembly pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/shipped/ensembly pnpm test:e2e:visual`.

## Gotchas

- Product cards live in `projects-section--product`, not the tech band.
- Fixture action ids and pulse-pack format names are labeled **Sample**. They are not live operator counts.
- Primary bins are `ensembly` / `ensembly-mcp`. Mention `peram` / `peram-mcp` only as one-release aliases.
- Plain framing: Grok keeps chat; ensembly-kernel holds the ledger. Do not describe this page as a chat app, Game of Peram product, life-os dashboard, Eve, or channel bot.
