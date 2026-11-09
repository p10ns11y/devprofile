import { describe, expect, it } from "vitest";
import { getHireContent } from "@/lib/hire-content";
import {
  contentWidth,
  HIRE_HERO_THETA,
  HIRE_LAYOUT_DOMAIN,
  isSplit,
  layoutHero,
  naturalWidth,
  prepareHero,
  prepareText,
  proveMustShowFitsWidth,
  wrapLineCount,
  wrapThresholds,
} from "@/lib/hire-hero-math";

const measure = (text: string) => text.length * 10;

describe("hire hero math", () => {
  it("computes pretext-style wrap thresholds from cached run widths", () => {
    const prepared = prepareText("hello world", measure);
    expect(naturalWidth(prepared)).toBe(110);
    expect(wrapLineCount(prepared, 110)).toBe(1);
    expect(wrapLineCount(prepared, 109)).toBe(2);
    expect(wrapLineCount(prepared, 50)).toBe(2);
    expect(wrapLineCount(prepared, 49)).toBe(4);
    expect(wrapThresholds(prepared)).toContain(110);
  });

  it("breaks a run that is wider than the column (overflow-wrap: anywhere)", () => {
    const prepared = prepareText("WWWWWW", measure);
    expect(wrapLineCount(prepared, 30)).toBe(2);
    expect(wrapLineCount(prepared, 20)).toBe(3);
  });

  it("lays out the live hire name and thesis as f(content, θ, w)", () => {
    const content = getHireContent();
    const prepared = prepareHero({ name: content.name, thesis: content.thesis }, measure);
    const stacked = layoutHero(prepared, 375, 812);
    expect(stacked.split).toBe(false);
    expect(stacked.name.width).toBeCloseTo(contentWidth(375), 5);
    expect(stacked.name.x).toBeCloseTo(stacked.inset, 5);
    expect(stacked.thesis.x).toBeCloseTo(stacked.inset, 5);
    expect(stacked.name.lines).toBeGreaterThanOrEqual(1);
    expect(stacked.thesis.lines).toBeGreaterThanOrEqual(1);

    const split = layoutHero(prepared, 1280, 720);
    expect(isSplit(1280, 720)).toBe(true);
    expect(split.split).toBe(true);
    expect(
      split.name.width + split.thesis.width + (split.thesis.x - split.name.x - split.name.width)
    ).toBeCloseTo(split.contentWidth, 5);
    expect(split.name.x + split.name.width).toBeLessThanOrEqual(1280);
    expect(split.thesis.x + split.thesis.width).toBeLessThanOrEqual(1280);
  });

  it("splits earlier in short landscape than in portrait", () => {
    expect(isSplit(844, 390)).toBe(true);
    expect(isSplit(844, 900)).toBe(true);
    expect(isSplit(560, 390)).toBe(true);
    expect(isSplit(560, 900)).toBe(false);
  });

  it("proves must-show marks fit the viewport width on [280, 3840] after splitting at 80rem", () => {
    const proof = proveMustShowFitsWidth();
    expect(proof.kind).toBe("interval");
    expect(proof.domain).toEqual(HIRE_LAYOUT_DOMAIN);
    expect(proof.parts).toHaveLength(2);
    expect(proof.parts[0]?.domain).toEqual({ lo: 280, hi: HIRE_HERO_THETA.bandMaxPx });
    expect(proof.parts[1]?.domain).toEqual({ lo: HIRE_HERO_THETA.bandMaxPx, hi: 3840 });
    expect(proof.parts.every((part) => part.holds && part.slack.lo >= 0)).toBe(true);
    expect(proof.proven).toBe(true);
    expect(proof.notProven.join(" ")).toMatch(/line counts/i);
  });

  it("does not claim an unsplit naive interval as a proof", () => {
    const proof = proveMustShowFitsWidth({ lo: 280, hi: 3840 });
    expect(proof.parts.some((part) => part.domain.hi <= 1280 && part.domain.lo >= 280)).toBe(true);
  });
});
