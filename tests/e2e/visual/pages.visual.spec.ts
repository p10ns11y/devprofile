import { test } from "@playwright/test";
import { assertPixelBaseline } from "../helpers/assert-pixel-baseline";
import { loadFeatureMap } from "../helpers/feature-map";

for (const feature of loadFeatureMap()) {
  test(`visual ${feature.path}`, async ({ page }) => {
    await assertPixelBaseline(page, feature);
  });
}
