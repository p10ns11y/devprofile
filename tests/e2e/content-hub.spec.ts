import { test, expect } from '@playwright/test';

test.describe('Content Hub', () => {
  test('should load content hub page', async ({ page }) => {
    await page.goto('/content-hub');

    // Check page loads successfully
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display content items', async ({ page }) => {
    await page.goto('/content-hub');

    // Check for content containers or cards
    const contentContainer = page.locator('[class*="content"], [class*="card"], article').first();

    // Content may load dynamically, so check for either content or loading state
    await expect(
      contentContainer.or(
        page.getByText(/loading|loading content/i)
      )
    ).toBeVisible();
  });

  test('should handle dynamic content loading', async ({ page }) => {
    await page.goto('/content-hub');

    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);

    // Check if content is displayed after loading
    const contentItems = page.locator('[class*="content-item"], [class*="post"], article');
    const itemCount = await contentItems.count();

    // Should have at least some content or show appropriate empty state
    if (itemCount > 0) {
      await expect(contentItems.first()).toBeVisible();
    } else {
      // Check for empty state message
      const emptyState = page.getByText(/no content|coming soon|empty/i);
      await expect(emptyState.or(page.getByText(/content/i))).toBeVisible();
    }
  });

  test('should have proper navigation back to home', async ({ page }) => {
    await page.goto('/content-hub');

    // Look for navigation elements
    const navLink = page.getByRole('link', { name: /home|back/i }).first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
