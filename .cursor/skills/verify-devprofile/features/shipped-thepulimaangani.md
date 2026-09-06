---
path: /shipped/thepulimaangani
---

# thepulimaangani walkthrough

Tamil metre project walkthrough. Product band: classical rules in the browser, plain verbs. Tech band: WASM architecture and one line on offline ML research.

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub CTA.
- `shipped-product-band` — product sections before the tech band; classical metre callout and plain bullets.
- `shipped-classical-path` — product band text includes paste verse, classical rule checker, yāppu, no server upload.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram, stack chips, and tech sections.

## Observable contract

- Product band avoids research ML taxonomy (no dense[51], Tier B, PCA dumps).
- Tech band names WebAssembly and states offline ML helpers are not on the browser path.
- Vitest: `src/data/project-walkthroughs.test.ts` asserts product-band plain copy and tech-band classical path.

## How to get to it (user POV)

- Open `/shipped` and choose the thepulimaangani card.
- Open `/shipped/thepulimaangani` directly.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/shipped/thepulimaangani pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/shipped/thepulimaangani pnpm test:e2e:visual`.

## Gotchas

- Classical metre copy lives in the product band (`projects-section--product`), not enum dumps.
- Playwright asserts visitor-visible render only.
