# E2E tests (Playwright)

## Browser: Brave Beta (system install)

This repo does **not** use Playwright’s bundled Chromium. Tests launch the **Brave Beta** binary already on the machine (`/usr/bin/brave-browser-beta` on Arch).

Override the path:

```bash
export BRAVE_BETA_PATH=/path/to/brave-browser-beta
pnpm test:e2e
```

Do **not** run `pnpm exec playwright install chromium` for day-to-day work — it downloads a separate browser under `~/.cache/ms-playwright/`.

Remove Playwright-downloaded Chromium (and other unused browsers for this `@playwright/test` version):

```bash
pnpm exec playwright uninstall
```

To clear older caches as well: `rm -rf ~/.cache/ms-playwright/chromium-* ~/.cache/ms-playwright/chromium_headless_shell-*`

## Commands

```bash
pnpm test:e2e                              # all projects (brave-beta + mobile viewport)
pnpm exec playwright test --project=brave-beta
pnpm test:e2e:ui
```

## CI

Install Brave on the runner (or set `BRAVE_BETA_PATH`). Playwright driver still comes from `@playwright/test`; only the **browser binary** is external.
