import { describe, expect, it } from "vitest";
import {
  CV_LAYOUT_POLICY,
  clampProfile,
  maxBulletsForJobIndex,
  sliceJobBullets,
  sliceJobTools,
} from "./cv-layout-policy";

describe("cv-layout-policy", () => {
  it("exposes 2-page soft-job contract", () => {
    expect(CV_LAYOUT_POLICY.targetPages).toBe(2);
    expect(CV_LAYOUT_POLICY.flowMode).toBe("soft-job");
    expect(CV_LAYOUT_POLICY.jobHeaderMinPresenceAhead).toBeGreaterThan(0);
  });

  it("caps bullets by job index", () => {
    expect(maxBulletsForJobIndex(0)).toBe(CV_LAYOUT_POLICY.maxBulletsEarly);
    expect(maxBulletsForJobIndex(CV_LAYOUT_POLICY.earlyJobCount)).toBe(
      CV_LAYOUT_POLICY.maxBulletsEarly
    );
    expect(maxBulletsForJobIndex(CV_LAYOUT_POLICY.earlyJobCount + 1)).toBe(
      CV_LAYOUT_POLICY.maxBulletsLate
    );
    const bullets = ["a", "b", "c", "d", "e"];
    expect(sliceJobBullets(bullets, 0)).toHaveLength(CV_LAYOUT_POLICY.maxBulletsEarly);
  });

  it("caps tools", () => {
    const tools = Array.from({ length: 20 }, (_, i) => `t${i}`);
    expect(sliceJobTools(tools)).toHaveLength(CV_LAYOUT_POLICY.maxTools);
  });

  it("clampProfile is a no-op under budget", () => {
    expect(clampProfile("Short profile.", 100)).toBe("Short profile.");
  });

  it("clampProfile prefers sentence boundary", () => {
    const a = "First sentence is here. Second sentence keeps going with more words.";
    const out = clampProfile(a, 40);
    expect(out.endsWith(".")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out).toContain("First sentence");
  });

  it("clampProfile falls back to ellipsis without good sentence cut", () => {
    const runon = "word ".repeat(80).trim();
    const out = clampProfile(runon, 50);
    expect(out.length).toBeLessThanOrEqual(52);
    expect(out.endsWith("…")).toBe(true);
  });
});
