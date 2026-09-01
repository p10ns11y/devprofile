---
name: verify-devprofile
description: Drive the public Next.js profile site (devprofile) in Brave Beta via Playwright. Use when proving landing, Q&A, X search, profile deck, CV dialog, certificates, or Focus look and behave as a visitor would. Not for Vitest/golden Q&A answer quality.
---

# Verify devprofile

The visitor-facing surface is the Next.js site on `http://localhost:3000`. Playwright launches **system Brave Beta**, never Playwright Chromium. Route inventory lives in `features/` (this skill). TypeScript reads that map; do not add a second `SURFACES[]` catalog.

Human-readable layer map (`test:e2e` vs `:ux` vs `:visual`; `:ui` is the Playwright panel): [`tests/README.md`](../../../tests/README.md).

Layout-content-view (plugin `layout-content-view`) is the geometry and interact contract. It verifies a tree:

```text
Routes → Viewports → Orientation → Layouts → Containers → Elements → Interactives
```

This skill owns visitor drive and PNG baselines. LCV owns clip, scrollports, and static `data-lcv-event` edges (success / fail / interrupted). Compose. Do not duplicate the route catalog.

## Launch

From the repo root:

```bash
pnpm verify:doctor
pnpm test:e2e:ux
```

Playwright's `webServer` runs `bun run dev` and waits until `http://localhost:3000` answers. Locally it reuses a server already on that port unless `CI` is set.

Pixels (linux snapshot host only):

```bash
pnpm test:e2e:visual
```

Update baselines after an intentional layout change on this machine:

```bash
E2E_VISUAL=1 pnpm exec playwright test --project=brave-beta-visual --update-snapshots
```

Agent procedure (inspect actual PNG first; mint only failing `VERIFY_FEATURE` paths; re-run without `--update-snapshots`): [e2e-visual-snapshots.mdc](../../../.agents/rules/e2e-visual-snapshots.mdc) and [tests/README.md](../../../tests/README.md).

Teardown: stop only a `webServer` this run started. Do not kill an existing `pnpm dev`. Proof files stay under `artifacts/verify-devprofile/` and committed `*-snapshots/` PNGs.

## Doctor

```bash
pnpm verify:doctor
```

Read-only. Prints JSON: Brave path exists, origin reachable, feature map parsed. Exit 1 if Brave is missing or the map is invalid. Does not start or stop the app. Run this first when anything looks off.

Override Brave with `BRAVE_BETA_PATH`. Override origin with `NEXT_PUBLIC_SITE_URL`.

## Drive

Prefer ARIA roles and the feature `path:` frontmatter. Filter one feature:

```bash
VERIFY_FEATURE=/qa pnpm test:e2e:ux
VERIFY_FEATURE='/?cv=view' pnpm test:e2e:ux
```

Live/time-varying paint must sit under `data-visual-live` in product markup (GitHub live host, `/x` date stack). Magenta in a PNG is Playwright’s mask fill, not a missing image. GitRoll CURISM is a static asset — do not mask it. `/qa` has no pixel baseline.

Do not run `playwright install chromium`. Headed: `pnpm test:e2e:headed`. UI: `pnpm test:e2e:ui`.

Phrase-level hiring copy stays in `tests/e2e/homepage.spec.ts` and `x.spec.ts`.

## Evidence

- Committed PNG baselines next to `tests/e2e/visual/` (`*-snapshots/`).
- Failure dumps: `test-results/` (gitignored).
- Agent captures: `artifacts/verify-devprofile/<feature>/`. Cleanup must not delete this directory.

## Cleanup

If this run started Playwright's `webServer`, let the Playwright process exit. Never `pkill` by name. Leave `artifacts/verify-devprofile/` and snapshot PNGs.

## Helpers

```bash
node scripts/verify-devprofile-doctor.mjs
```

Feature map loader: `tests/e2e/helpers/feature-map.ts`. Asserts: `assertUx`, `assertContent`, `assertPixelBaseline`.
