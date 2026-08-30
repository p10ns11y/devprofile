import { describe, expect, it } from "vitest";
import { balancedGridColumns } from "./balanced-grid-columns";

describe("balancedGridColumns", () => {
  it("keeps a single row when the count fits", () => {
    expect(balancedGridColumns(6, 6)).toBe(6);
    expect(balancedGridColumns(5, 6)).toBe(5);
    expect(balancedGridColumns(1, 6)).toBe(1);
  });

  it("avoids a 6+1 orphan for seven items", () => {
    expect(balancedGridColumns(7, 6)).toBe(4);
  });

  it("prefers the fullest leftover row", () => {
    expect(balancedGridColumns(8, 6)).toBe(4);
    expect(balancedGridColumns(5, 4)).toBe(3);
  });

  it("falls back when every candidate orphans", () => {
    expect(balancedGridColumns(7, 3)).toBe(3);
    expect(balancedGridColumns(7, 2)).toBe(2);
  });

  it("guards empty or inverted input", () => {
    expect(balancedGridColumns(0, 6)).toBe(1);
    expect(balancedGridColumns(4, 0)).toBe(1);
  });
});
