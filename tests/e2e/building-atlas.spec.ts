import { expect, test } from "@playwright/test";
import { BUILDING_SINGULARITY } from "@/data/building-landscape";

test.describe("Building atlas", () => {
  test("white hole gloss names emit over capture", async ({ page }) => {
    await page.goto("/building");
    await page.getByRole("button", { name: /penrose white hole: the other side of a black hole/i }).click();
    const tip = page.locator("#white-hole-tip");
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(BUILDING_SINGULARITY.tooltip);
    await expect(tip.locator("cite")).toHaveText("Penrose");
  });
});
