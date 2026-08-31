import { expect, test } from "@playwright/test";
import { openMobileMenuIfNeeded } from "./helpers/mobile-nav";

const leftoverOneLiner = /Senior Software Engineer with 9\+ years in scalable web apps/;

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page.locator("h1").first()).toBeVisible();
    await openMobileMenuIfNeeded(page, isMobile);
    await expect(page.getByRole("link", { name: "Essays" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Building" }).first()).toBeVisible();
    await expect(
      page.locator("#about").getByRole("heading", { name: "What you are hiring" })
    ).toBeVisible();
    await expect(page.locator("#projects")).toHaveCount(0);
  });

  test("should have working navigation links", async ({ page, isMobile }) => {
    await page.goto("/");

    await openMobileMenuIfNeeded(page, isMobile);
    await page.getByRole("link", { name: "X", exact: true }).click();
    await expect(page).toHaveURL(/\/x$/);

    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("should display hero section correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#home")).toBeVisible();
    const hero = page.locator("#home");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(
      "Peramanathan Sathyamoorthy"
    );
    await expect(hero.getByText("AI-native product / agent engineer")).toBeVisible();
    await expect(hero.getByText(/Available now/)).toBeVisible();
    await expect(hero.getByText(leftoverOneLiner)).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "View CV" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Building" })).toHaveAttribute(
      "href",
      "/?building=view"
    );
    await expect(hero.getByRole("link", { name: "Download CV" })).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveCount(0);
  });

  test("should keep certificates off the primary homepage scroll", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#accomplishments")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Credentials" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Browse all certificates" })).toHaveCount(0);
  });

  test("should sell work as sourced evidence, not a second CV", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#work")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Product" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Development" })).toBeVisible();
    await expect(page.getByText("70%")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Behavior Driven Development" })).toHaveCount(
      0
    );
    await expect(page.getByRole("heading", { name: "Senior Software Engineer" })).toHaveCount(0);
  });
});
