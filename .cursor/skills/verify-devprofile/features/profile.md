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
