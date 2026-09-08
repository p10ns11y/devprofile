import { expect, test } from "@playwright/test";
import { openMobileMenuIfNeeded, siteNav } from "./helpers/mobile-nav";

const leftoverOneLiner = /Senior Software Engineer with 9\+ years in scalable web apps/;

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page.locator("h1").first()).toBeVisible();
    await openMobileMenuIfNeeded(page, isMobile);
    await expect(page.getByRole("link", { name: "Articles" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Building" }).first()).toBeVisible();
    await expect(
      page.locator("#about").getByRole("heading", { name: "What you are hiring" })
    ).toBeVisible();
    await expect(page.locator("#projects")).toHaveCount(0);
  });

  test("should have working navigation links", async ({ page, isMobile }) => {
    await page.goto("/");

    await openMobileMenuIfNeeded(page, isMobile);
    await siteNav(page, isMobile).locator('a[href="/x"]').click();
    await expect(page).toHaveURL(/\/x$/);

    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("should display a distilled hero with one primary CTA and text secondaries", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("#home")).toBeVisible();
    const hero = page.locator("#home");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(
      "Peramanathan Sathyamoorthy"
    );
    await expect(hero.getByText("AI-native product / agent engineer")).toBeVisible();
    await expect(hero.getByText(/Available now · Stockholm/)).toBeVisible();
    await expect(
      hero.getByText(/Scarce: shipping agentic workflows with taste, evals, and judgment/)
    ).toBeVisible();
    await expect(hero.getByText(leftoverOneLiner)).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "View CV" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Building" })).toHaveAttribute(
      "href",
      "/?building=view"
    );
    await expect(hero.getByRole("link", { name: "Q&A" })).toHaveAttribute("href", "/qa");
    await expect(hero.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/articles");
    await expect(hero.getByRole("link", { name: "Talk instead" })).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "Download CV" })).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveCount(0);
    await expect(hero.locator(".hero-text-link")).toHaveCount(3);
  });

  test("should keep contact direct channels as links only", async ({ page }) => {
    await page.goto("/#contact");

    const contact = page.locator("#contact");
    await expect(contact.getByRole("heading", { name: "Direct channels" })).toBeVisible();
    await expect(contact.getByRole("link", { name: "Talk instead" })).toHaveCount(0);
    await expect(contact.getByRole("link", { name: "Talk", exact: true })).toHaveCount(0);
    await expect(contact.locator(".contact-cv-actions")).toHaveCount(0);
    await expect(contact.getByRole("link", { name: /sathyam\.peram@gmail\.com/ })).toBeVisible();
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
    const work = page.locator("#work");
    await expect(work.getByRole("heading", { name: "Product", exact: true })).toBeVisible();
    await expect(work.getByRole("heading", { name: "Development", exact: true })).toBeVisible();
    await expect(work.getByText("70%")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Behavior Driven Development" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Senior Software Engineer" })).toHaveCount(0);
    await expect(work.getByRole("heading", { name: "Innovative Adjacent Thinking" })).toBeVisible();
    await expect(work.getByRole("link", { name: "IEEE", exact: true })).toHaveAttribute(
      "href",
      "https://ieeexplore.ieee.org/document/7396150"
    );
    await expect(work.getByRole("link", { name: "Wiley", exact: true })).toHaveAttribute(
      "href",
      "https://onlinelibrary.wiley.com/doi/10.1155/2017/6562915"
    );
    await expect(work.getByRole("link", { name: "Thesis", exact: true })).toHaveAttribute(
      "href",
      "/pdfs/master-thesis.pdf"
    );
    await expect(
      work.locator(
        'a.claim-evidence__link[href="https://www.npmjs.com/package/babel-plugin-react-intl-messages-generator"]'
      )
    ).toHaveText("Source");
  });

  test("should keep above-the-fold copy shorter than the old hire landing", async ({ page }) => {
    await page.goto("/");

    const heroText = await page.locator("#home").innerText();
    const wordCount = heroText.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeLessThan(55);
  });
});
