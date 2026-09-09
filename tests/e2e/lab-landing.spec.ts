import { expect, test } from "@playwright/test";

const hireRoutes = [
  { path: "/", label: "Home" },
  { path: "/lab/hire", label: "Lab hire" },
] as const;

test.describe("Hire landing (φ-flow)", () => {
  for (const route of hireRoutes) {
    test(`${route.path} loads hire content without Talk CTAs`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.locator("h1").first()).toContainText("Peramanathan Sathyamoorthy");
      await expect(
        page.locator("#home").getByText("AI-native product / agent engineer")
      ).toBeVisible();
      await expect(
        page.locator("#about").getByRole("heading", { name: "What you are hiring" })
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "How the pieces connect" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
      await expect(page.locator("#contact")).toBeVisible();

      const hero = page.locator("#home");
      await expect(hero.getByRole("link", { name: "View CV" })).toBeVisible();
      await expect(hero.getByRole("link", { name: "Talk instead" })).toHaveCount(0);

      const contact = page.locator("#contact");
      await expect(contact.getByRole("link", { name: "Talk instead" })).toHaveCount(0);
      await expect(contact.getByText("Voice reception")).toHaveCount(0);
    });
  }

  test("systems section shows evidenced graph", async ({ page }) => {
    await page.goto("/");
    const systems = page.locator("#systems");
    await expect(systems.getByText("cvdata").first()).toBeVisible();
    await expect(systems.getByText(/ensembly/i).first()).toBeVisible();
    await expect(systems.getByText(/one operator system/i).first()).toBeVisible();
  });

  test("retired lab routes redirect to /lab/hire", async ({ page }) => {
    await page.goto("/lab/landing-d");
    await expect(page).toHaveURL(/\/lab\/hire$/);
    await expect(page.getByRole("heading", { name: "How the pieces connect" })).toBeVisible();
  });
});
