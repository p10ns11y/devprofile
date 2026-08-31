---
path: /qa
---

# Profile Q&A

Fixed-height interview desk. Visitor asks from experience; suggestions sit in a rail.

## Sub-features

- `qa-heading` — “Ask me about my work”.
- `qa-ask` — “Your question” field and “Ask question” control.
- `qa-suggestions` — Suggestions rail.

## How to get to it (user POV)

- Open the Q&A page from the primary header (Q&A).

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/qa pnpm test:e2e:ux`.
- **Pixels.** None. Answers are session-dynamic; `assertPixelBaseline` skips `/qa`.
- **Ask flow.** Retrieve proof stays in `tests/e2e/qa.spec.ts` (that file may still say “Quest” — do not copy it into the map). Answer wording is Vitest golden, not Playwright.

## Gotchas

- Submit accessible name is “Ask question”, not “Quest”. Heading is not “Q&A”.
- No footer on this page. Nested `main` exists; do not fail on multiple mains.
