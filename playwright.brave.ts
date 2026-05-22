import { existsSync } from "node:fs";
import type { LaunchOptions } from "@playwright/test";

/** System Brave Beta (Chromium). Override with BRAVE_BETA_PATH if installed elsewhere. */
export const BRAVE_BETA_EXECUTABLE =
  process.env.BRAVE_BETA_PATH ?? "/usr/bin/brave-browser-beta";

export function braveBetaLaunchOptions(): LaunchOptions {
  if (!existsSync(BRAVE_BETA_EXECUTABLE)) {
    throw new Error(
      `Brave Beta not found at ${BRAVE_BETA_EXECUTABLE}. Install Brave Beta or set BRAVE_BETA_PATH.`
    );
  }
  return { executablePath: BRAVE_BETA_EXECUTABLE };
}
