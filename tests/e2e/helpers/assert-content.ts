import { expect, type Page } from "@playwright/test";
import type { FeatureEntry } from "./feature-map";

export async function assertContent(page: Page, feature: FeatureEntry): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(feature.path, { waitUntil: "domcontentloaded" });

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
  expect(title).not.toMatch(/404/i);

  await expect(page.locator('meta[name="description"]')).toBeAttached();
  await expect(page.getByRole("main").first()).toBeAttached();

  if (feature.path.includes("cv=view")) {
    await expect(page.getByRole("dialog", { name: "Curriculum vitae" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curriculum vitae" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/lorem ipsum/i);
  expect(bodyText).not.toMatch(/\bTODO\b/);
}
