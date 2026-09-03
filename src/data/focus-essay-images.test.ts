import { describe, expect, it } from "vitest";
import {
  assertFocusEssayCardCatalogMatchesSvg,
  assertValidUtf8Svg,
  listFocusEssayCardImages,
} from "@/lib/focus-essay-image-assets";

describe("Focus essay card images", () => {
  for (const image of listFocusEssayCardImages()) {
    it(`${image.slug} card SVG is valid UTF-8 and well-formed XML`, () => {
      expect(() => assertValidUtf8Svg(image.src)).not.toThrow();
    });

    it(`${image.slug} card SVG dimensions match FOCUS_ESSAYS catalog`, () => {
      expect(() =>
        assertFocusEssayCardCatalogMatchesSvg(image.src, image.width, image.height)
      ).not.toThrow();
    });
  }
});
