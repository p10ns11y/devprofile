---
path: /profile
---

# Profile

Viewport deck of the GitHub journey. One beat per slide unless the visitor asks for scroll view.

## Sub-features

- `profile-cover` — cover heading visible.
- `profile-rail` — chapter rail (not a map assertion).

## How to get to it (user POV)

- Choose Profile in the primary header.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/profile pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/profile pnpm test:e2e:visual` on the default cover slide.

## Gotchas

- Deep-linked slides are not the pixel baseline. Default verify is the cover.
- Scroll view is a different layout. Do not treat it as the visual snapshot.
- Pager and TOC expose `data-lcv-event` plus `data-lcv-to-success|fail|interrupted`. LCV walks `slide:*` from `data-lcv-states`.
- Each slide is `data-lcv-fit=beat`. If min-content exceeds the slot, LCV reports `fit-impossible` with rework / redesign / split-view suggestions.
- Short-phone slack is a **CSS** problem, not a new LCV kind: Featured/cooking/POC slides group **title + tags + Learn** (takeaway up front) then **one-liner + items**. Leftover beat height sits under the items, not between Learn and the one-liner. Slide copy is `.profile-deck__lead`; do not put `.profile-deck__body` on a `<p>`.
