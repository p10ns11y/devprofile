import { expect, test } from "@playwright/test";
import { layoutHero, type PreparedHero } from "../../src/lib/hire-hero-math";
import {
  curatedViewports,
  fillMustShowWithTexts,
  fillMustShowWithUnbroken,
  LOCALE_STRESS,
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

const surfaces = [
  { name: "default hire page", path: "/" },
  { name: "Colorfigures research skin", path: "/?vl=colorfigures" },
] as const;

for (const surface of surfaces) {
  test.describe(`unbreakable hire layout: ${surface.name}`, () => {
    test("holds layout invariants on every curated viewport and orientation", async ({ page }) => {
      test.setTimeout(180_000);
      await page.goto(surface.path);
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

      for (const [locale, texts] of Object.entries(LOCALE_STRESS)) {
        const localeBackup = await page.evaluate(fillMustShowWithTexts, texts);
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
            failures.push({ ...vp, name: `${locale}/${vp.name}`, findings: measured.findings });
          }
        }
        await page.evaluate(restoreMustShow, localeBackup);
      }

      expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    });

    test("keeps the primary CTA on screen in short landscape", async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.goto(surface.path);
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

    test("hero f(content, θ, w) matches DOM column boxes on the width grid", async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(surface.path);
      await page.locator("h1.hire-phi__name").waitFor();

      const prepared = await page.evaluate(() => {
        const prepare = (
          selector: string
        ): { text: string; runs: Array<{ text: string; width: number; isSpace: boolean }> } => {
          const el = document.querySelector(selector);
          if (!el) {
            throw new Error(`missing ${selector}`);
          }
          const cs = getComputedStyle(el);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("canvas");
          }
          ctx.font = `${cs.fontStyle} ${cs.fontWeight} 16px ${cs.fontFamily}`;
          const text = (el.textContent || "").replace(/\s+/g, " ").trim();
          return {
            text,
            runs: text
              .split(/(\s+)/)
              .filter((part) => part.length > 0)
              .map((part) => ({
                text: part,
                width: ctx.measureText(part).width,
                isSpace: /^\s+$/.test(part),
              })),
          };
        };
        return {
          name: prepare(".hire-phi__name"),
          thesis: prepare(".hire-phi__thesis"),
        };
      });

      const widths = Array.from(
        { length: Math.floor((1920 - 280) / 40) + 1 },
        (_, i) => 280 + i * 40
      );
      const samples: Array<{ w: number; h: number }> = [
        ...widths.map((w) => ({ w, h: 812 })),
        { w: 812, h: 375 },
        { w: 844, h: 390 },
        { w: 1280, h: 720 },
        { w: 720, h: 1280 },
      ];

      const mismatches: unknown[] = [];
      for (const sample of samples) {
        await page.setViewportSize({ width: sample.w, height: sample.h });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            })
        );
        const boxes = await page.evaluate(() => {
          const box = (selector: string) => {
            const el = document.querySelector(selector);
            if (!el) {
              throw new Error(`missing ${selector}`);
            }
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            const lh = Number.parseFloat(cs.lineHeight);
            return {
              x: r.x,
              width: r.width,
              lines: lh > 0 ? Math.round(r.height / lh) : 0,
            };
          };
          return {
            inner: { w: window.innerWidth, h: window.innerHeight },
            name: box(".hire-phi__name"),
            thesis: box(".hire-phi__thesis"),
          };
        });
        const modeled = layoutHero(prepared as PreparedHero, boxes.inner.w, boxes.inner.h);
        const check = (
          id: "name" | "thesis",
          actual: { x: number; width: number; lines: number }
        ) => {
          const expected = modeled[id];
          if (Math.abs(actual.x - expected.x) > 3 || Math.abs(actual.width - expected.width) > 3) {
            mismatches.push({
              ...sample,
              inner: boxes.inner,
              id,
              actual,
              expected: { x: expected.x, width: expected.width, lines: expected.lines },
            });
          }
          if (
            actual.lines > 0 &&
            expected.lines > 0 &&
            Math.abs(actual.lines - expected.lines) > 1
          ) {
            mismatches.push({
              kind: "line-count",
              ...sample,
              id,
              actual: actual.lines,
              expected: expected.lines,
            });
          }
        };
        check("name", boxes.name);
        check("thesis", boxes.thesis);
      }

      expect(mismatches, JSON.stringify(mismatches, null, 2)).toEqual([]);
    });
  });
}

test.describe("Colorfigures research skin: embed contract", () => {
  test("sandboxes the iframe and keeps the MIT credit on the parent", async ({ page }) => {
    await page.goto("/?vl=colorfigures");
    const frame = page.locator("iframe.hire-cf__frame");
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    await expect(frame).not.toHaveAttribute("sandbox", /same-origin/);

    const credit = page.locator(".hire-cf__credit");
    await expect(credit).toBeVisible();
    await expect(credit).toContainText("Colorfigures");
    await expect(credit).toContainText("MIT");
    await expect(credit.locator('a[href="/skins/colorfigures/LICENSE"]')).toBeVisible();

    // Smoke the embed under the unique-origin sandbox (and reduced motion from this project).
    const embed = page.frameLocator("iframe.hire-cf__frame");
    await expect(embed.locator("#fig")).toBeVisible({ timeout: 15_000 });
    await expect(embed.getByRole("button", { name: "Load a card" })).toBeVisible();
    await embed.getByRole("button", { name: "Load a card" }).click();
    await expect(embed.locator("#readout")).toContainText(/card loaded/i);
  });
});
