import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.SHOT_ORIGIN ?? "http://localhost:3000/";
const outDir = process.env.SHOT_OUT ?? "docs/unbreakable-layout/after";
const chromePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable";

const shots = [
  [390, 844, "phone-portrait"],
  [844, 390, "phone-landscape"],
  [884, 1104, "foldable"],
  [768, 1024, "tablet"],
  [3440, 1440, "ultrawide"],
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto(origin, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForSelector("h1, [data-lcv='must-show']", { timeout: 20_000 });
await page.addStyleTag({
  content: `
    [data-vercel-toolbar],
    [data-index-toolbar],
    vercel-live-feedback,
    nextjs-portal,
    [data-nextjs-toast],
    [data-nextjs-dev-overlay],
    [aria-label="Open Next.js Dev Tools"],
    button[aria-label*="Next.js"] {
      display: none !important;
    }
  `,
});

for (const [w, h, name] of shots) {
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  const dest = join(outDir, `${name}.png`);
  await page.screenshot({ path: dest, fullPage: false, animations: "disabled" });
  console.log("wrote", dest);
}

await browser.close();
