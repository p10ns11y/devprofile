---
path: /
---

# Home

Hiring landing: name from cvdata, invite copy, GitRoll aside, About, credentials, experience, contact.

## Sub-features

- `home-hero` — name heading and Profile actions (View experience, View CV, Live GitHub activity).
- `home-about` — “What you are hiring”.
- `home-credentials` — Credentials and Browse all certificates.

## How to get to it (user POV)

- Open the site root.
- Choose the name link in the primary header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/ pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/ pnpm test:e2e:visual`. GitRoll aside is `data-visual-live`.
- **Phrases.** `tests/e2e/homepage.spec.ts` still owns the 9+ years line and CTA names.

## Gotchas

- Header sits inside layout `<main>`, so there is no `role=banner`.
- “Get in touch” is header/contact, not a hero CTA.
- `#projects` is not mounted on this page.
