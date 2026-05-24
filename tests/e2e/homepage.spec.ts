import { expect, test } from "@playwright/test";
import { openMobileMenuIfNeeded } from "./helpers/mobile-nav";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page.locator("h1").first()).toBeVisible();
    await openMobileMenuIfNeeded(page, isMobile);
    await expect(page.getByRole("button", { name: "About", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Projects", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Experience", exact: true })).toBeVisible();
    await expect(page.locator("#about").getByRole("heading", { name: "About Me" })).toBeVisible();
  });

  test("should have working navigation links", async ({ page, isMobile }) => {
    await page.goto("/");

    await openMobileMenuIfNeeded(page, isMobile);
    await page.getByRole("link", { name: "Posts on X" }).click();
    await expect(page).toHaveURL(/\/x$/);

    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("should display hero section correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "View My Work" })).toBeVisible();
  });

  test("should load projects section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Projects" })).toBeVisible();
  });
});
