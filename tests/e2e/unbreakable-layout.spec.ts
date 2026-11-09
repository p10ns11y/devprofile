import { expect, test } from "@playwright/test";
import {
  curatedViewports,
  fillMustShowWithUnbroken,
  measureHireLayout,
  restoreMustShow,
  type SweepViewport,
} from "./helpers/assert-unbreakable-layout";

const longTextTargets: SweepViewport[] = [
  { w: 280, h: 653, name: "stress/280x653", ori: "portrait" },
  { w: 375, h: 812, name: "stress/375x812", ori: "portrait" },
  { w: 812, h: 375, name: "stress/812x375", ori: "landscape" },
  { w: 1280, h: 720, name: "stress/1280x720", ori: "landscape" },
  { w: 653, h: 280, name: "stress/653x280", ori: "landscape" },
  { w: 3840, h: 2160, name: "stress/3840x2160", ori: "landscape" },
];

test.describe("unbreakable hire layout", () => {
  test("holds layout invariants on every curated viewport and orientation", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await page.locator("h1, [data-lcv='must-show']").first().waitFor();

    const failures: Array<SweepViewport & { findings: unknown }> = [];

    for (const vp of curatedViewports()) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );
      const measured = await page.evaluate(measureHireLayout);
      if (measured.findings.length > 0) {
        failures.push({ ...vp, findings: measured.findings });
      }
    }

    const backup = await page.evaluate(fillMustShowWithUnbroken, "W".repeat(400));
    for (const vp of longTextTargets) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );
      const measured = await page.evaluate(measureHireLayout);
      if (measured.findings.length > 0) {
        failures.push({ ...vp, findings: measured.findings });
      }
    }
    await page.evaluate(restoreMustShow, backup);

    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  });

  test("keeps the primary CTA on screen in short landscape", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    const building = page
      .getByRole("navigation", { name: "Profile actions" })
      .getByRole("link", { name: "Building" });
    await expect(building).toBeVisible();
    const box = await building.boundingBox();
    expect(box, "Building CTA should have a box").toBeTruthy();
    if (!box) return;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(390 + 1);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(844 + 1);
  });
});
