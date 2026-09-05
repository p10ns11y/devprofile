---
path: /shipped/ensembly
---

# ensembly walkthrough

Operator-kernel walkthrough for ensembly. Product band first: operator loop, HITL / HOOTL runtime, Pulse-pack, T1 SQLite ledger. Architecture Mermaid follows. Complementary satellite under Grok Bot / Build / Cursor — not a second chat OS.

Map stays accurate to shipped **ensembly** `master` after the 4 September 2026 Musk cut: live crates are `peram-kernel`, `peram-memory`, and read-only `peram-mcp`. Game of Peram, Node `swarm.js`, and WASM world sim stay under `prototype/`. Do not invent live metrics.

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub CTA.
- `shipped-product-band` — product sections before the tech band; complementary/not-a-chat callout plus four surface cards.
- `shipped-operator-loop` — Operator loop card: load, status, tick, approve / deny / claim / complete, reflect.
- `shipped-hitl-hootl` — HITL / HOOTL runtime card; fixture actions and regimes labeled **Sample**.
- `shipped-pulse-pack` — Pulse-pack card; `peram-pulse-pack-v1` export / status / import labeled **Sample**.
- `shipped-ledger` — T1 SQLite ledger card.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram (harness / peram-kernel / peram-memory / peram-mcp), stack chips, and tech sections.

## Observable contract

- Product band includes cards titled Operator loop, HITL / HOOTL runtime, Pulse-pack, T1 SQLite ledger.
- Sample lines use `data-sample` and the visible word **Sample**.
- Architecture diagram is mermaid-first and names peram-kernel, pulse-pack, peram-memory, and peram-mcp.
- Copy states Game of Peram is parked in `prototype/` and that this is not a second chat OS.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts this product-band shape.

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
- Complementary framing: white-hole kernel under capture harnesses. Do not describe this page as a chat OS, Game of Peram product, life-os dashboard, Eve, or channel bot.
