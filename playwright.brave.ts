import { existsSync } from "node:fs";
import type { PlaywrightTestConfig } from "@playwright/test";

/** System Brave Beta (Chromium). Override with BRAVE_BETA_PATH if installed elsewhere. */
export const BRAVE_BETA_EXECUTABLE = process.env.BRAVE_BETA_PATH ?? "/usr/bin/brave-browser-beta";

type BraveBetaLaunchOptions = NonNullable<
  NonNullable<PlaywrightTestConfig["use"]>["launchOptions"]
>;

/** Fail fast when tests run — not when the Playwright extension loads config. */
export function assertBraveBetaInstalled(): void {
  if (!existsSync(BRAVE_BETA_EXECUTABLE)) {
    throw new Error(
      `Brave Beta not found at ${BRAVE_BETA_EXECUTABLE}. Install Brave Beta or set BRAVE_BETA_PATH.`
    );
  }
}

export function braveBetaLaunchOptions(): BraveBetaLaunchOptions {
  return { executablePath: BRAVE_BETA_EXECUTABLE };
}
