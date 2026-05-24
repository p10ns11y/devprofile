import { formatMonthYearFromIso, yearMonthKeyFromIso } from "@/lib/x-search/dates";
import type { XSearchInterval } from "@/lib/x-search/intervals";

export interface PastIntervalSection {
  key: string;
  title: string;
  intervals: XSearchInterval[];
}

export function splitCurrentAndPastIntervals(intervals: XSearchInterval[]): {
  current: XSearchInterval | null;
  past: XSearchInterval[];
} {
  if (intervals.length === 0) {
    return { current: null, past: [] };
  }

  return {
    current: intervals[0] ?? null,
    past: intervals.slice(1),
  };
}

export function groupPastIntervalsByMonth(intervals: XSearchInterval[]): PastIntervalSection[] {
  const sections = new Map<string, PastIntervalSection>();

  for (const interval of intervals) {
    const key = yearMonthKeyFromIso(interval.since);
    const existing = sections.get(key);

    if (existing) {
      existing.intervals.push(interval);
      continue;
    }

    sections.set(key, {
      key,
      title: formatMonthYearFromIso(interval.since),
      intervals: [interval],
    });
  }

  return Array.from(sections.values());
}
