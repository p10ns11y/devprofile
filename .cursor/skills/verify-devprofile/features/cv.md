---
path: /?cv=view
---

# CV

Curriculum vitae in a dialog over the home page. `/cv` redirects here.

## Sub-features

- `cv-dialog` shows heading Curriculum vitae and Close.
- `cv-from-home` is View CV in Profile actions.

## How to get to it (user POV)

- Open `/?cv=view`.
- Choose View CV on `/`.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX.** `VERIFY_FEATURE='/?cv=view' pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE='/?cv=view' pnpm test:e2e:visual`.

## Gotchas

- Feature path is `/?cv=view`, not `/cv`.
- Dialog title is h2; page `h1` is still the home name. Native dialog makes the rest inert — UX/content assert the dialog, not the home `h1`.
