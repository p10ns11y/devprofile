import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if main elements are present
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Skills')).toBeVisible();
    await expect(page.getByText('Experience')).toBeVisible();
    await expect(page.getByText('Contact')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation links
    await page.getByRole('link', { name: /ama|ask me anything/i }).click();
    await expect(page).toHaveURL(/.*ama/);

    // Navigate back
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('should display hero section correctly', async ({ page }) => {
    await page.goto('/');

    // Check hero section elements
    const heroSection = page.locator('[class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load projects section', async ({ page }) => {
    await page.goto('/');

    // Wait for projects to load (lazy loaded component)
    await page.waitForTimeout(2000); // Allow time for lazy loading

    const projectsSection = page.locator('[class*="project"], [class*="Project"]').first();
    await expect(projectsSection.or(page.getByText('Loading projects...'))).toBeVisible();
  });
});
