import { describe, expect, it } from "vitest";
import { parseHireVisualLanguage } from "./hire-visual-language";

describe("parseHireVisualLanguage", () => {
  it("accepts the Colorfigures research pack and ignores anything else", () => {
    expect(parseHireVisualLanguage("colorfigures")).toBe("colorfigures");
    expect(parseHireVisualLanguage(["colorfigures"])).toBe("colorfigures");
    expect(parseHireVisualLanguage(undefined)).toBeNull();
    expect(parseHireVisualLanguage("")).toBeNull();
    expect(parseHireVisualLanguage("editorial")).toBeNull();
    expect(parseHireVisualLanguage(["nope", "colorfigures"])).toBeNull();
  });
});
