import { test } from "@playwright/test";
import { assertUx } from "../helpers/assert-ux";
import { loadFeatureMap } from "../helpers/feature-map";

for (const feature of loadFeatureMap()) {
  test(`ux ${feature.path}`, async ({ page, isMobile }) => {
    await assertUx(page, feature, { isMobile });
  });
}
