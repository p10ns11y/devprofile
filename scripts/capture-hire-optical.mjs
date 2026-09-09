#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "ops/hire-optical-after");
const origin = process.env.ORIGIN ?? "http://localhost:3000";
const browserPath =
  process.env.BRAVE_BETA_PATH ??
  ["/usr/bin/brave-browser-beta", "/usr/bin/google-chrome-stable"].find(Boolean);

mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "phone", width: 375, height: 812 },
];

const captures = [
  {
    file: "hero-proofs",
    clip: async (page) => {
      const hero = page.locator("#home");
      const about = page.locator("#about");
      const heroBox = await hero.boundingBox();
      const aboutBox = await about.boundingBox();
      if (!heroBox || !aboutBox) return null;
      return {
        x: 0,
        y: heroBox.y,
        width: page.viewportSize()?.width ?? 1280,
        height: aboutBox.y + Math.min(aboutBox.height, 280) - heroBox.y,
      };
    },
  },
  { file: "systems", selector: "#systems" },
  { file: "contact", selector: "#contact" },
];

const browser = await chromium.launch({
  executablePath: browserPath,
  headless: true,
});

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });

  for (const cap of captures) {
    const path = join(outDir, `${cap.file}-${vp.name}.png`);
    if (cap.selector) {
      const el = page.locator(cap.selector);
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path });
    } else if (cap.clip) {
      const box = await cap.clip(page);
      if (box) {
        await page.screenshot({ path, clip: box });
      }
    }
  }

  await context.close();
}

await browser.close();
console.log(`Screenshots saved to ${outDir}`);
