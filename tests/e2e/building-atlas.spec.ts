import { expect, test } from "@playwright/test";
import { BUILDING_SINGULARITY } from "@/data/building-landscape";

test.describe("Building atlas", () => {
  test("spacemap stacks on a phone so What it is is not clipped", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/building");

    const packed = page.locator(".building-spacemap tr", { hasText: "packedbox" });
    await packed.scrollIntoViewIfNeeded();
    await expect(packed).toContainText(
      "Portable Linux bootstrap (Arch, Debian, Ubuntu) with a shared PATH contract and terminal pack for reliable setup on cloud servers, Grok Bot Computer, and cloud agent machines."
    );
    await expect(packed.getByText("What it is", { exact: true })).toBeVisible();

    const overflow = await packed.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(pageOverflow).toBeLessThanOrEqual(1);
  });

  test("white hole gloss names emit over capture", async ({ page }) => {
    await page.goto("/building");
    await page
      .getByRole("button", { name: /penrose white hole: the other side of a black hole/i })
      .click();
    const tip = page.locator("#white-hole-tip");
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(BUILDING_SINGULARITY.tooltip);
    await expect(tip.locator("cite")).toHaveCount(0);
  });
});
