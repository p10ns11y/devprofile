import { expect, test } from "@playwright/test";

test.describe("X Search Page", () => {
  test("should load x search page", async ({ page }) => {
    await page.goto("/x");

    await expect(page.getByRole("heading", { name: "Posts on X" })).toBeVisible();
    await expect(page.getByText("@peramanathan")).toBeVisible();
  });

  test("should display search interval cards", async ({ page }) => {
    await page.goto("/x");

    const topLinks = page.getByRole("link", { name: /Search top posts from/i });
    const liveLinks = page.getByRole("link", { name: /Search latest posts from/i });
    await expect(topLinks.first()).toBeVisible();
    await expect(liveLinks.first()).toBeVisible();
    expect(await topLinks.count()).toBeGreaterThan(0);
    expect(await topLinks.count()).toBe(await liveLinks.count());
  });

  test("should link cards to x.com search with top and live filters", async ({ page }) => {
    await page.goto("/x");

    const firstTop = page.getByRole("link", { name: /Search top posts from/i }).first();
    const firstLive = page.getByRole("link", { name: /Search latest posts from/i }).first();

    await expect(firstTop).toHaveAttribute("href", /x\.com\/search\?.*f=top/);
    await expect(firstLive).toHaveAttribute("href", /x\.com\/search\?.*f=live/);
    await expect(firstTop).toHaveAttribute("target", "_blank");
    await expect(firstLive).toHaveAttribute("target", "_blank");
  });

  test("should have header navigation", async ({ page, isMobile }) => {
    await page.goto("/x");

    const { openMobileMenuIfNeeded } = await import("./helpers/mobile-nav");
    await openMobileMenuIfNeeded(page, isMobile);
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL("/");
  });

  test("should redirect content hub to x page", async ({ page }) => {
    await page.goto("/content-hub");

    await expect(page).toHaveURL(/\/x$/);
    await expect(page.getByRole("heading", { name: "Posts on X" })).toBeVisible();
  });
});
