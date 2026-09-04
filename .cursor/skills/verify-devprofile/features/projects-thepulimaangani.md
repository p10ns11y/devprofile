---
path: /projects/thepulimaangani
---

# thepulimaangani walkthrough

Tamil metre project walkthrough with a classical-ML product band (engineered features, not a raw-text net).

## Sub-features

- `projects-hero` — breadcrumb, title, lede, outcomes, surfaces, GitHub CTA.
- `projects-product-band` — product sections before the tech band; classical ML callout and bullets visible.
- `projects-classical-ml` — product band text includes dense[51], engineered features, heuristic, PCA, Monte Carlo, dual-truth/classical checker, WASM, TF-IDF; no transformer framing.
- `projects-tech-band` — "Tech and architecture" heading with stack chips and tech sections.

## How to get to it (user POV)

- Open `/projects` and choose the thepulimaangani card.
- Open `/projects/thepulimaangani` directly.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/projects/thepulimaangani pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/projects/thepulimaangani pnpm test:e2e:visual`.

## Gotchas

- Classical ML copy lives in the product band (`projects-section--product`), not the tech band.
- Vitest `project-walkthroughs.test.ts` asserts product-band classical ML strings; Playwright asserts visitor-visible render only.
