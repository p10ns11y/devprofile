---
path: /certificates
---

# Certificates

Credential catalog: cards open a certificate view.

## Sub-features

- `certificates-list` — heading Certificates and a list of cards.
- `certificates-from-home` — Browse all certificates on the landing page (home feature, not this row).

## How to get to it (user POV)

- Choose Certificates (More in the header, or from Home credentials).

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/certificates pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/certificates pnpm test:e2e:visual` on the list, not an open overlay.

## Gotchas

- Page title is `h1` via `SectionHeading` `headingLevel="h1"`.
- Overlay / `?id=` is not the visual baseline. Drive the list first.
