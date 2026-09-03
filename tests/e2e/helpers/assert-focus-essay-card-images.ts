import { expect, type Page } from "@playwright/test";
import { FOCUS_ESSAYS } from "@/data/focus-essays";
import { assertValidUtf8Svg } from "@/lib/focus-essay-image-assets";

export function assertFocusEssayCardAssetsOnDisk(): void {
  for (const essay of FOCUS_ESSAYS) {
    assertValidUtf8Svg(essay.image.src);
  }
}

export async function assertFocusEssayCardImagesPaint(
  page: Page,
  indexPath = "/articles"
): Promise<void> {
  await page.goto(indexPath, { waitUntil: "load" });

  for (const essay of FOCUS_ESSAYS) {
    const card = page.locator(`article[data-card="focus"] a[href="${essay.href}"]`);
    await expect(card, `card link for ${essay.slug}`).toBeVisible();

    const image = card.locator("img");
    await expect(image, `card image for ${essay.slug}`).toBeVisible();

    await expect
      .poll(
        async () =>
          image.evaluate((element) => {
            const img = element as HTMLImageElement;
            return {
              complete: img.complete,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            };
          }),
        { message: `waiting for ${essay.image.src} to decode` }
      )
      .toMatchObject({
        complete: true,
        naturalWidth: expect.any(Number),
        naturalHeight: expect.any(Number),
      });

    const metrics = await image.evaluate((element) => {
      const img = element as HTMLImageElement;
      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };
    });

    expect(metrics.naturalWidth, `${essay.image.src} naturalWidth`).toBeGreaterThan(0);
    expect(metrics.naturalHeight, `${essay.image.src} naturalHeight`).toBeGreaterThan(0);
  }
}
