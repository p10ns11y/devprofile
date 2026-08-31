import { defineConfig, devices } from "@playwright/test";
import { braveBetaLaunchOptions } from "./playwright.brave";

/**
 * E2E uses the system Brave Beta browser (Chromium), not Playwright-downloaded Chromium.
 * @see AGENTS.md — E2E / Playwright
 * @see tests/e2e/README.md
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: braveBetaLaunchOptions(),
  },

  projects: [
    {
      name: "brave-beta",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/visual\.spec\.ts$/, /e2e\/verify\//],
    },
    {
      name: "brave-beta-mobile",
      use: { ...devices["Pixel 5"] },
      testIgnore: [/visual\.spec\.ts$/, /e2e\/verify\//],
    },
    ...(process.env.E2E_VISUAL === "1"
      ? [
          {
            name: "brave-beta-visual",
            use: {
              ...devices["Desktop Chrome"],
              contextOptions: { reducedMotion: "reduce" as const },
            },
            testMatch: /visual\.spec\.ts$/,
          },
        ]
      : []),
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
