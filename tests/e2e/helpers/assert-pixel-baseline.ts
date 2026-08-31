import { expect, type Page, test } from "@playwright/test";
import type { FeatureEntry } from "./feature-map";
import { hideEphemeralChrome, revealBelowFoldMotion } from "./hide-ephemeral-chrome";

const liveMaskSelector = "[data-visual-live]";
const pathsWithoutPixels = new Set(["/qa"]);

export function isVisualSnapshotHost(): boolean {
  return process.platform === "linux" || process.env.E2E_VISUAL_FORCE === "1";
}

function snapshotNameFromPath(path: string): string {
  if (path === "/") {
    return "home";
  }
  if (path.startsWith("/?cv=")) {
    return "cv";
  }
  return path.replace(/^\//, "").replace(/[/?=&]/g, "-") || "root";
}

export async function assertPixelBaseline(page: Page, feature: FeatureEntry): Promise<void> {
  test.skip(
    !isVisualSnapshotHost(),
    "pixel baselines are linux-only; set E2E_VISUAL_FORCE=1 to mint"
  );
  test.skip(pathsWithoutPixels.has(feature.path), "no pixel baseline for session-dynamic surfaces");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(feature.path, { waitUntil: "load" });
  await hideEphemeralChrome(page);
  await page.evaluate(() => document.fonts.ready);
  await revealBelowFoldMotion(page);

  const gitrollImage = page.locator(".hero-gitroll img");
  if ((await gitrollImage.count()) > 0) {
    await gitrollImage.first().waitFor({ state: "visible" });
  }

  const liveRegions = page.locator(liveMaskSelector);
  const mask = (await liveRegions.count()) > 0 ? [liveRegions] : [];

  await expect(page).toHaveScreenshot(`${snapshotNameFromPath(feature.path)}.png`, {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
    mask,
    maxDiffPixelRatio: 0.02,
  });
}
