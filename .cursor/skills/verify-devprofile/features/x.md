---
path: /x
---

# Posts on X

Eight-day search windows for @peramanathan, with a custom start date and past-period cards.

## Sub-features

- `x-heading` — Posts on X of @peramanathan.
- `x-window` — Start date control.
- `x-cards` — links out to x.com search (top and live).

## How to get to it (user POV)

- Choose Posts on X in the header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/x pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/x pnpm test:e2e:visual`. Date windows and period cards are `data-visual-live`.
- **Links and dates.** `tests/e2e/x.spec.ts`.

## Gotchas

- Period count and card ranges move with “today”. Do not unmask live period regions.
- `/content-hub` redirects here — that is not a feature path.
