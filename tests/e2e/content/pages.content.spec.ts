import { test } from "@playwright/test";
import { assertContent } from "../helpers/assert-content";
import { loadFeatureMap } from "../helpers/feature-map";

for (const feature of loadFeatureMap()) {
  test(`content ${feature.path}`, async ({ page }) => {
    await assertContent(page, feature);
  });
}
