---
path: /articles/hitl-hootl
---

# HITL and HOOTL article

Longform Focus article on ensembly human-in-the-loop and human-out-of-the-loop design.

## Sub-features

- `hitl-hootl-title` shows the article heading and lede.
- `hitl-hootl-article` contains the maxim, body sections, and related-article links.

## How to get to it (user POV)

- Open `/articles/hitl-hootl` (rewrites to `/focus/hitl-hootl` internally).
- Or choose the card from `/articles`.
- Legacy `/essays/hitl-hootl` and `/focus/hitl-hootl` redirect here (301).

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **Content.** `VERIFY_FEATURE=/articles/hitl-hootl pnpm test:e2e:content` (or full content suite).
- **Index card image.** covered by `tests/e2e/content/focus-essay-images.content.spec.ts`.

## Gotchas

- Public canonical URL is `/articles/hitl-hootl`.
- Card art `IA_hitl_hootl.svg` must be well-formed UTF-8 XML; Latin-1 middle dots break decode.
