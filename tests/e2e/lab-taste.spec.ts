import { expect, test } from "@playwright/test";

/** Production hire surfaces — one content body, φ-flow layout. */
const hireRoutes = ["/", "/lab/hire"] as const;

const HERO_THESIS_MAX_WORDS = 45;
const PROOF_LINE_MAX_WORDS = 55;

test.describe("Hire landing taste gates", () => {
  for (const path of hireRoutes) {
    test(`${path} — one primary CTA, no Talk instead, terse hero`, async ({ page }) => {
      await page.goto(path);

      const hero = page.locator("#home");
      await expect(hero.getByRole("link", { name: "Talk instead" })).toHaveCount(0);
      await expect(hero.getByText("Voice reception")).toHaveCount(0);

      const primaryButtons = hero.locator("a.bg-brand, button.bg-brand");
      const filledPrimary = hero.getByRole("link", { name: "Building" });
      await expect(filledPrimary).toBeVisible();
      await expect(primaryButtons).toHaveCount(1);

      const thesis = hero.locator("[data-lcv='must-show']").first();
      await expect(thesis).toBeAttached();
      const text = (await thesis.textContent()) ?? "";
      const words = text.trim().split(/\s+/).filter(Boolean);
      expect(words.length).toBeLessThanOrEqual(HERO_THESIS_MAX_WORDS);

      const contact = page.locator("#contact");
      await expect(contact.getByRole("link", { name: "Talk instead" })).toHaveCount(0);
    });

    test(`${path} — proof lines stay terse`, async ({ page }) => {
      await page.goto(path);
      const about = page.locator("#about");
      const proofLines = about.locator(".hire-phi__proof-line");
      const count = await proofLines.count();
      for (let i = 0; i < Math.min(count, 6); i++) {
        const lineText = (await proofLines.nth(i).textContent()) ?? "";
        const words = lineText.trim().split(/\s+/).filter(Boolean);
        expect(words.length).toBeLessThanOrEqual(PROOF_LINE_MAX_WORDS);
      }
    });

    test(`${path} — no manifesto wall, coach meta, or résumé red-spine`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".lab-e__manifesto, .lab-e__beats")).toHaveCount(0);
      await expect(page.locator(".hire-proof")).toHaveCount(0);
      const body = (await page.locator("#main").textContent()) ?? "";
      expect(body).not.toMatch(/this page proves|designed for reviewers|steward/i);
    });

    test(`${path} — LCV must-show and landmarks`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("[data-lcv='must-show']").first()).toBeAttached();
      await expect(page.locator("#main")).toBeAttached();
      await expect(page.locator("#systems")).toBeVisible();
    });
  }
});

test.describe("Retired lab skins redirect", () => {
  test("landing-a through g redirect to /lab/hire", async ({ page }) => {
    for (const legacy of ["/lab/landing-a", "/lab/landing-c", "/lab/landing-g"] as const) {
      await page.goto(legacy);
      await expect(page).toHaveURL(/\/lab\/hire$/);
    }
  });
});
