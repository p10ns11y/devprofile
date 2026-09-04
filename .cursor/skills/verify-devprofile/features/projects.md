---
path: /projects
---

# Shipped

Product gallery of systems that shipped: walkthrough index and per-project architecture pages at `/projects/[slug]`. Nav label is **Shipped**; URL stays `/projects`.

## Sub-features

- `shipped-title` — heading Shipped and the product-gallery lede on the index.
- `shipped-cards` — walkthrough cards linking to `/projects/[slug]`.
- `shipped-walkthrough` — hero breadcrumb (Shipped → project), outcomes, surfaces, and tech band on detail pages.

## How to get to it (user POV)

- Open `/projects`.
- Choose **Shipped** in the primary header or footer Explore links.
- From the home About section, follow the architecture walkthroughs link.

## Driving it with Playwright

Preconditions: `pnpm verify:doctor` is ok.

- **UX / content.** `VERIFY_FEATURE=/projects pnpm test:e2e:ux`.
- **Pixels.** `VERIFY_FEATURE=/projects pnpm test:e2e:visual`.

## Gotchas

- Nav and breadcrumbs say **Shipped**; paths remain `/projects` and `/projects/[slug]` (no redirect).
- Detail pages expose an **All shipped** CTA back to the index.
