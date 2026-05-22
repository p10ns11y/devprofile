import { expect, test } from "@playwright/test";

test.describe("Content Hub", () => {
  test("should load content hub page", async ({ page }) => {
    await page.goto("/content-hub");

    await expect(page.getByRole("heading", { name: "Content Hub" })).toBeVisible();
  });

  test("should display content items", async ({ page }) => {
    await page.goto("/content-hub");

    await expect(page.getByRole("heading", { name: "Writeups" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Briefs" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Readings" })).toBeVisible();
  });

  test("should handle dynamic content loading", async ({ page }) => {
    await page.goto("/content-hub");

    await expect(page.getByRole("link", { name: "Writeups" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Briefs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Readings" })).toBeVisible();
  });

  test("should have proper navigation back to home", async ({ page }) => {
    await page.goto("/content-hub");

    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });
});
