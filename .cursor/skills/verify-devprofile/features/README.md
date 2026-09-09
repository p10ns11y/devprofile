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
- [Shipped index](./shipped.md)
- [collab-finder walkthrough](./shipped-collab-finder.md)
- [thepulimaangani walkthrough](./shipped-thepulimaangani.md)
- [Lab hire φ-flow](./lab-hire.md) — production candidate `/lab/hire` (same as `/`)
- [Lab stress fixtures](./lab-stress-long-thesis.md) — LCV long-string probes under `/lab/stress/*`
- [Lab landing A](./lab-landing-a.md) … [G](./lab-landing-g.md) — **retired**; redirect to `/lab/hire`

## LCV probe (layout-content-view)

Geometry gate for must-show clip, overflow-x, landmarks. Vendored plugin: `vendor/layout-content-view/`.

```bash
pnpm verify:doctor
pnpm lcv:probe                              # all feature-map paths
VERIFY_FEATURE=/lab/landing-d pnpm lcv:probe
pnpm taste:check                          # fail if findings JSON has fail:true
```

Named viewports: phone-short 375×667, phone 375×812, tablet 768×1024, desktop 1280×720.

Taste rubric: root `TASTE.md`, visual SoT `DESIGN.md`. Lab-specific: `pnpm test:lab-taste`.

**Writer ≠ judge:** the agent that authors lab/home layout changes must not mark the PR ready alone. A critic run checks `TASTE.md`, `DESIGN.md`, LCV JSON, and `test:lab-taste`.
