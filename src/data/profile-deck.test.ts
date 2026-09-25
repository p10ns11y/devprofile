import { describe, expect, it, vi } from "vitest";
import {
  profileDeckNav,
  profileDeckSlides,
  resolveSlideIndex,
  slideIndexByCue,
  slideIndexById,
} from "./profile-deck";

describe("resolveSlideIndex", () => {
  it("resolves chapter ids to the chapter first slide", () => {
    const featured = profileDeckNav.find((chapter) => chapter.id === "featured");
    expect(featured).toBeDefined();
    expect(resolveSlideIndex("featured")).toBe(slideIndexById(featured!.firstSlideId));
  });

  it("resolves slide=long-arc to the long-arc chapter first slide", () => {
    const longArc = profileDeckNav.find((chapter) => chapter.id === "long-arc");
    expect(longArc).toBeDefined();
    expect(resolveSlideIndex("long-arc")).toBe(slideIndexById(longArc!.firstSlideId));
  });

  it("prefers exact slide id before chapter id when names collide", () => {
    const closeSlideIndex = slideIndexById("close");
    expect(closeSlideIndex).toBeGreaterThanOrEqual(0);
    const findSpy = vi.spyOn(profileDeckNav, "find");
    expect(resolveSlideIndex("close")).toBe(closeSlideIndex);
    expect(findSpy).not.toHaveBeenCalled();
    findSpy.mockRestore();
  });

  it("keeps exact slide cue resolution ahead of chapter lookup", () => {
    const arriveCueIndex = slideIndexByCue("arrive");
    expect(arriveCueIndex).toBeGreaterThanOrEqual(0);
    expect(resolveSlideIndex("arrive")).toBe(arriveCueIndex);
    expect(profileDeckSlides[arriveCueIndex]?.id).toBe("cover");
  });
});
