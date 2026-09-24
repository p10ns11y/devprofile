---
path: /pay-report
---

# Developer pay report

Public 2025 pay bands, employer cost, and the target range. The landing hero links here.

## Sub-features

- `pay-report-chart` — inline SVG of Stack Overflow 8–15 year country bands.
- `pay-report-target` — section `#target-range` with the same range string as the hero.

## How to get to it (user POV)

- Open `/pay-report`.
- From the home hero, follow the yearly range link.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/pay-report pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/pay-report pnpm test:e2e:visual`.

## Gotchas

- Tables scroll sideways on a narrow viewport. The chart does the same.
- The country table under the chart is the text alternative for the SVG.
