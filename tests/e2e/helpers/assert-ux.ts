import { expect, type Page } from "@playwright/test";
import { contrastRatio } from "./contrast";
import type { FeatureEntry } from "./feature-map";
import { hideEphemeralChrome } from "./hide-ephemeral-chrome";

export type UxOptions = {
  readonly isMobile: boolean;
};

function isCvDialogPath(path: string): boolean {
  return path.includes("cv=view");
}

async function headingContrastAgainstOpaqueAncestor(
  page: Page,
  headingSelector: string
): Promise<void> {
  const headingContrast = await page.evaluate((selector) => {
    const heading = document.querySelector(selector);
    if (!heading) {
      return { textColor: "", surfaceColor: "" };
    }
    const textColor = getComputedStyle(heading).color;
    let node: Element | null = heading;
    let surfaceColor = "rgb(255, 255, 255)";
    while (node) {
      const background = getComputedStyle(node).backgroundColor;
      const isTransparent = background === "transparent" || background === "rgba(0, 0, 0, 0)";
      if (!isTransparent) {
        surfaceColor = background;
        break;
      }
      node = node.parentElement;
    }
    return { textColor, surfaceColor };
  }, headingSelector);
  expect(
    contrastRatio(headingContrast.textColor, headingContrast.surfaceColor)
  ).toBeGreaterThanOrEqual(4.5);
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export async function assertUx(
  page: Page,
  feature: FeatureEntry,
  options: UxOptions
): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(feature.path, { waitUntil: "load" });
  await hideEphemeralChrome(page);

  await expect(page.getByRole("main").first()).toBeAttached();

  if (isCvDialogPath(feature.path)) {
    const cvDialog = page.getByRole("dialog", { name: "Curriculum vitae" });
    await expect(cvDialog).toBeVisible();
    await expect(cvDialog.getByRole("heading", { name: "Curriculum vitae" })).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await headingContrastAgainstOpaqueAncestor(page, "#cv-dialog-title");
    return;
  }

  const pageHeading = page.getByRole("heading", { level: 1 });
  await expect(pageHeading).toHaveCount(1);
  await expect(pageHeading).toBeVisible();
  const headingText = (await pageHeading.innerText()).trim();
  expect(headingText.length).toBeGreaterThan(0);

  await assertNoHorizontalOverflow(page);
  await headingContrastAgainstOpaqueAncestor(page, "h1");

  if (options.isMobile) {
    await expect(async () => {
      const closeMenu = page.getByRole("button", { name: "Close menu" });
      if (await closeMenu.isVisible()) {
        return;
      }
      const openMenu = page.getByRole("button", { name: "Open menu" });
      await expect(openMenu).toBeVisible();
      await openMenu.click({ force: true });
      await expect(closeMenu).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 10_000 });
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    return;
  }

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
}
