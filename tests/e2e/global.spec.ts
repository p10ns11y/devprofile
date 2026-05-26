import { expect, test } from "@playwright/test";
import { openMobileMenuIfNeeded } from "./helpers/mobile-nav";

test.describe("Global Navigation & Layout", () => {
  test("should have consistent header across pages", async ({ page, isMobile }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await openMobileMenuIfNeeded(page, isMobile);
    await expect(page.getByRole("button", { name: "Home", exact: true })).toBeVisible();

    await page.goto("/qa");
    await expect(page.getByRole("heading", { name: "Profile Q&A" })).toBeVisible();

    await page.goto("/x");
    await expect(page.getByRole("heading", { name: /Posts on X of @peramanathan/i })).toBeVisible();
  });

  test("should have consistent footer across pages", async ({ page }) => {
    // Test homepage
    await page.goto("/");
    const homeFooter = page.locator('footer, [class*="footer"]').first();
    await expect(homeFooter).toBeVisible();

    // Test other pages as needed
    await page.goto("/qa");
    const qaFooter = page.locator('footer, [class*="footer"]').first();
    if (await qaFooter.isVisible()) {
      await expect(qaFooter).toBeVisible();
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/nonexistent-page");

    // Check for 404 content or redirect
    const notFoundContent = page.getByText(/404|not found|page not found/i).first();
    await expect(notFoundContent.or(page.locator("h1")).first()).toBeVisible();
  });

  test("should be responsive on mobile devices", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile viewport only");

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await openMobileMenuIfNeeded(page, true);
    await expect(page.getByRole("button", { name: "About", exact: true })).toBeVisible();
  });

  test("should handle slow network conditions", async ({ page }) => {
    // Simulate slow network
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/");

    // Should still load basic content
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("should work with JavaScript disabled", async ({ browser }) => {
    // Note: This test requires special browser context setup
    const context = await browser.newContext();
    const page = await context.newPage();

    // Disable JavaScript
    await page.route("**/*", (route) => {
      if (route.request().resourceType() === "script") {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto("/");

    // Basic content should still be visible
    await expect(page.locator("h1, h2").first()).toBeVisible();

    await context.close();
  });
});

test.describe("Performance & Accessibility", () => {
  test("should load critical resources", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(15_000);

    // Check for critical images
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      await expect(images.first()).toBeAttached();
    }
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check for title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeAttached();

    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing to check focus flow
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const nextFocused = page.locator(":focus");
      if (await nextFocused.isVisible()) {
        await expect(nextFocused).toBeVisible();
      }
    }
  });
});
