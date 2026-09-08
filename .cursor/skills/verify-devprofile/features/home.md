---
path: /
---

# Home

Hiring landing: name from cvdata, distilled invite copy, About proofs, Evidence, Academic, contact.

## Sub-features

- `home-hero` — name, role, `Available now · Stockholm`, one-breath thesis. One quiet primary CTA (`View CV`) plus text secondaries (`Building`, `Q&A`, `Articles`). No Talk-as-button CTAs; voice stays on header nav `/call` only.
- `home-about` — “What you are hiring”: six numbered proof beats (no redundant section lead). Arc line links Articles + Shipped.
- `home-evidence` — Evidence claims grid; no redundant work_lead paragraph.
- `home-contact` — form + Direct channels links only (no Talk channel, no aside CTA row).

## How to get to it (user POV)

- Open the site root.
- Choose the name link in the primary header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/ pnpm test:e2e:ux`.
- **Phrases + layout guards.** `tests/e2e/homepage.spec.ts` — hero thesis, one primary CTA, text secondaries, Talk CTAs absent, above-fold word count cap.
- **Pixels.** `VERIFY_FEATURE=/ pnpm test:e2e:visual`. GitRoll CURISM is a static `/images/curism.png` — do not mark it `data-visual-live` (that paints Playwright’s magenta mask over real art).

## Gotchas

- Header sits inside layout `<main>`, so there is no `role=banner`.
- “Get in touch” is header/contact, not a hero CTA.
- Contact `#contact` Direct channels: links only — no Talk channel row, no “Talk instead” button, no `.contact-cv-actions` nav.
- Hero and contact CTA rows must stay single-line (flex, not a 2+1 grid). Regressions: `tests/e2e/homepage.spec.ts` asserts Talk CTAs are absent and hero has `.hero-text-link` secondaries.
- `#projects` is not mounted on this page.
