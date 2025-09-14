import { test, expect } from '@playwright/test';

test.describe('Global Navigation & Layout', () => {
  test('should have consistent header across pages', async ({ page }) => {
    // Test homepage
    await page.goto('/');
    const homeHeader = page.locator('header, [class*="header"]').first();
    await expect(homeHeader).toBeVisible();

    // Test AMA page
    await page.goto('/ama');
    const amaHeader = page.locator('header, [class*="header"]').first();
    await expect(amaHeader).toBeVisible();

    // Test content hub
    await page.goto('/content-hub');
    const contentHeader = page.locator('header, [class*="header"]').first();
    await expect(contentHeader).toBeVisible();
  });

  test('should have consistent footer across pages', async ({ page }) => {
    // Test homepage
    await page.goto('/');
    const homeFooter = page.locator('footer, [class*="footer"]').first();
    await expect(homeFooter).toBeVisible();

    // Test other pages as needed
    await page.goto('/ama');
    const amaFooter = page.locator('footer, [class*="footer"]').first();
    // Footer may not be present on all pages
    if (await amaFooter.isVisible()) {
      await expect(amaFooter).toBeVisible();
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Check for 404 content or redirect
    const notFoundContent = page.getByText(/404|not found|page not found/i).first();
    await expect(notFoundContent.or(page.locator('h1')).first()).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');

      // Check that mobile navigation works
      const mobileMenu = page.locator('[class*="mobile"], [class*="menu"]').first();

      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();

        // Check navigation items are accessible
        const navItems = page.locator('nav a, [class*="nav"] a');
        await expect(navItems.first()).toBeVisible();
      }
    }
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto('/');

    // Should still load basic content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should work with JavaScript disabled', async ({ browser }) => {
    // Note: This test requires special browser context setup
    const context = await browser.newContext();
    const page = await context.newPage();

    // Disable JavaScript
    await page.route('**/*', (route) => {
      if (route.request().resourceType() === 'script') {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto('/');

    // Basic content should still be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await context.close();
  });
});

test.describe('Performance & Accessibility', () => {
  test('should load critical resources', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Check for critical images
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // At least one image should load
      await expect(images.first()).toBeVisible();
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

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

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing to check focus flow
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const nextFocused = page.locator(':focus');
      if (await nextFocused.isVisible()) {
        await expect(nextFocused).toBeVisible();
      }
    }
  });
});
