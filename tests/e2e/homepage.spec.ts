import { expect, test } from "@playwright/test";
import { openMobileMenuIfNeeded } from "./helpers/mobile-nav";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page.locator("h1").first()).toBeVisible();
    await openMobileMenuIfNeeded(page, isMobile);
    await expect(page.getByRole("button", { name: "About", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Experience", exact: true })).toBeVisible();
    await expect(
      page.locator("#about").getByRole("heading", { name: "What you are hiring" })
    ).toBeVisible();
    await expect(page.locator("#projects")).toHaveCount(0);
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
    const hero = page.locator("#home");
    await expect(
      hero.getByText(/Senior Software Engineer with 9\+ years in scalable web apps/)
    ).toBeVisible();
    await expect(hero.getByRole("link", { name: "View experience" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "View CV" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Live GitHub activity" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveCount(0);
  });

  test("should show credentials section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#accomplishments")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Credentials" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse all certificates" })).toBeVisible();
  });
});
