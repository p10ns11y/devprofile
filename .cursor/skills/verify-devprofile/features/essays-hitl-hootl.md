---
path: /essays/hitl-hootl
---

# HITL and HOOTL essay

Longform Focus essay on ensembly human-in-the-loop and human-out-of-the-loop design.

## Sub-features

- `hitl-hootl-title` shows the essay heading and lede.
- `hitl-hootl-article` contains the maxim, body sections, and related-essay links.

## How to get to it (user POV)

- Open `/essays/hitl-hootl` (rewrites to `/focus/hitl-hootl`).
- Or choose the card from `/essays`.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **Content.** `VERIFY_FEATURE=/essays/hitl-hootl pnpm test:e2e:content` (or full content suite).

## Gotchas

- Public canonical URL is `/essays/hitl-hootl`; `/focus/hitl-hootl` redirects there.
