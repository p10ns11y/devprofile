import { defineConfig } from "@playwright/test";

const chromePath = process.env.CHROME_PATH ?? "";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /unbreakable-layout\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 120_000,
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    launchOptions: {
      ...(chromePath ? { executablePath: chromePath } : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
    },
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
