---
path: /
---

# Home

Production hire landing: φ-flow `HireLanding` from cvdata → derive → CSS. Hero, proofs, systems, evidence, contact.

## Sub-features

- `home-hero` — name, role, thesis, Building primary + text View CV / Q&A / Articles.
- `home-about` — “What you are hiring” auto-fit proofs.
- `home-systems` — evidenced graph (cvdata, devprofile, collab-finder, ensembly).
- `home-work` — Evidence column pack.
- `home-contact` — form + Direct channels (no XChat, no Talk instead).

## How to get to it (user POV)

- Open the site root.
- Choose the name link in the primary header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/ pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/ pnpm test:e2e:visual`.
- **Phrases.** `tests/e2e/homepage.spec.ts` owns CTA names, proof alignment, and evidence receipts.

## Gotchas

- Header sits inside layout `<main>`, so there is no `role=banner`.
- “Get in touch” is header/contact, not a hero CTA.
- `#projects` and `#academic` are not mounted on this page.
- Course proof links live on `/certificates`.
- Reach/interactives classes belong on hero actions and evidence links only — never on the proofs grid.
