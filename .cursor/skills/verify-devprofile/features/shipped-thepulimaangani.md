---
path: /shipped/thepulimaangani
---

# thepulimaangani walkthrough

Tamil metre project walkthrough with a classical-ML product band (engineered features, not a raw-text net).

## Sub-features

- `shipped-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub CTA.
- `shipped-product-band` — product sections before the tech band; classical ML callout and bullets visible.
- `shipped-classical-ml` — product band text includes dense[51], engineered features, heuristic, PCA, Monte Carlo, dual-truth/classical checker, WASM, TF-IDF; no transformer framing.
- `shipped-tech-band` — "Tech and architecture" heading with Mermaid diagram, stack chips, and tech sections.

## How to get to it (user POV)

- Open `/shipped` and choose the thepulimaangani card.
- Open `/shipped/thepulimaangani` directly.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/shipped/thepulimaangani pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/shipped/thepulimaangani pnpm test:e2e:visual`.

## Gotchas

- Classical ML copy lives in the product band (`projects-section--product`), not the tech band.
- Vitest `project-walkthroughs.test.ts` asserts product-band classical ML strings; Playwright asserts visitor-visible render only.
