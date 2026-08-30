/**
 * Column count that keeps a wrapping glance grid from stranding one leftover
 * item on a full-width last row.
 */
export function balancedGridColumns(itemCount: number, maxColumns: number): number {
  if (itemCount < 1) {
    return 1;
  }

  const cappedMax = Math.max(1, Math.min(Math.floor(maxColumns), itemCount));
  if (itemCount <= cappedMax) {
    return itemCount;
  }

  let bestColumnCount = cappedMax;
  let bestLastRowCount = 0;

  for (let columnCount = cappedMax; columnCount >= 2; columnCount -= 1) {
    const remainder = itemCount % columnCount;
    const lastRowCount = remainder === 0 ? columnCount : remainder;
    if (lastRowCount === 1) {
      continue;
    }
    if (lastRowCount > bestLastRowCount) {
      bestLastRowCount = lastRowCount;
      bestColumnCount = columnCount;
    }
  }

  return bestColumnCount;
}
