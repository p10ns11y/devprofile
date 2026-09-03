import { test } from "@playwright/test";
import {
  assertFocusEssayCardAssetsOnDisk,
  assertFocusEssayCardImagesPaint,
} from "../helpers/assert-focus-essay-card-images";

assertFocusEssayCardAssetsOnDisk();

test("focus essay card images decode on /articles", async ({ page }) => {
  await assertFocusEssayCardImagesPaint(page, "/articles");
});
