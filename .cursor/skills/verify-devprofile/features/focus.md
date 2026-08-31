---
path: /focus
---

# Focus

Essay index: harness, memory, cost of the next observation.

## Sub-features

- `focus-title` shows heading Focus and the lede.
- `focus-essays` lists featured and rest cards.

## How to get to it (user POV)

- Open `/focus`.
- Choose Focus in the primary header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX.** `VERIFY_FEATURE=/focus pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/focus pnpm test:e2e:visual`.

## Gotchas

- `?paper=view` redirects into an essay. Baseline is the index without that query.
