# E2E tests (Playwright)

## Browser: Brave Beta (system install)

Tests use **Brave Beta** via `executablePath` in [`playwright.config.ts`](../../playwright.config.ts) — not Playwright-downloaded Chromium.

```bash
export BRAVE_BETA_PATH=/path/to/brave-browser-beta   # optional
pnpm test:e2e
```

Remove unused Playwright browsers: `pnpm exec playwright uninstall`

## Headed mode (visible Brave window)

**Yes** — headed uses the same Brave config as headless:

```bash
pnpm test:e2e:headed
# or one file:
pnpm exec playwright test tests/e2e/homepage.spec.ts --project=brave-beta --headed
```

`--headed` only sets `headless: false`; `launchOptions.executablePath` still points at Brave.

## UI mode (no Playwright Chromium install)

Default `playwright test --ui` tries to launch an **embedded Chromium shell** for the UI app → `No chromium-based browser found` if you uninstalled Playwright browsers.

This repo uses [`scripts/playwright-ui-brave.mjs`](../../scripts/playwright-ui-brave.mjs) instead:

```bash
pnpm test:e2e:ui
```

That runs the UI server with `--ui-host` / `--ui-port`, then opens the panel in **Brave Beta** (`brave-browser-beta <url>`), same binary as test runs.

Optional env:

```bash
PLAYWRIGHT_UI_HOST=127.0.0.1 PLAYWRIGHT_UI_PORT=9323 pnpm test:e2e:ui
PLAYWRIGHT_UI_NO_OPEN=1 pnpm test:e2e:ui   # serve only; open URL yourself
```

## Debug mode

```bash
pnpm test:e2e:debug
```

Runs with Playwright Inspector; test browser is still **Brave** from config. If the inspector host errors about missing Chromium, use headed + `PWDEBUG=console` or UI mode above.

## Commands

```bash
pnpm test:e2e
pnpm exec playwright test --project=brave-beta
pnpm test:e2e:headed
pnpm test:e2e:ui
pnpm test:e2e:debug
```

## CI

Install Brave on the runner (or set `BRAVE_BETA_PATH`).
