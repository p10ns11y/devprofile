# Devprofile verification map

This directory is the **route** layer for visitor-facing checks. Playwright `loadFeatureMap()` reads `path:` frontmatter here. Do not duplicate routes in a TypeScript `SURFACES` table.

LCV continues the tree: Routes → Viewports → Orientation → Layouts → Containers → Elements → Interactives. Profile pager and TOC declare interact effects in HTML (`data-lcv-to-success` / `fail` / `interrupted`).

## Baseline preconditions

- Brave Beta at `/usr/bin/brave-browser-beta` or `BRAVE_BETA_PATH`.
- Origin `http://localhost:3000` from this checkout (`pnpm verify:doctor`).
- Never drive a random production URL as if it were local.

## Driving conventions

- `VERIFY_FEATURE=/qa` limits the loop to one path.
- Roles and accessible names over CSS and coordinates.
- Mark live widgets with `data-visual-live` in product markup.

## Features

- [Home](./home.md)
- [Profile Q&A](./qa.md)
- [Posts on X](./x.md)
- [Profile](./profile.md)
- [CV](./cv.md)
- [Certificates](./certificates.md)
- [Articles index](./focus.md)
- [HITL and HOOTL article](./articles-hitl-hootl.md)
- [Projects walkthroughs](./projects.md)
