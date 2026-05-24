import {
  addUtcDaysIso,
  compareIsoDates,
  formatRangeLabel,
  getTodayIso,
} from "@/lib/x-search/dates";

export const X_SEARCH_START = "2024-12-01";
export const X_SEARCH_INTERVAL_DAYS = 8;
export const X_SEARCH_USERNAME = "peramanathan";

export interface XSearchInterval {
  since: string;
  until: string;
  label: string;
  urlTop: string;
  urlLive: string;
  index: number;
}

export function getInclusiveEndDate(until: string): string {
  return addUtcDaysIso(until, -1);
}

export function buildXSearchUrl(since: string, until: string, filter: "top" | "live"): string {
  const q = `(from:${X_SEARCH_USERNAME}) lang:en until:${until} since:${since}`;
  const params = new URLSearchParams({ q, src: "typed_query", f: filter });
  return `https://x.com/search?${params.toString()}`;
}

export { getTodayIso };

export function createIntervalFromStartDate(startDate: string): XSearchInterval | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return null;
  }

  if (
    compareIsoDates(startDate, X_SEARCH_START) < 0 ||
    compareIsoDates(startDate, getTodayIso()) > 0
  ) {
    return null;
  }

  const since = startDate;
  const until = addUtcDaysIso(since, X_SEARCH_INTERVAL_DAYS);

  return {
    since,
    until,
    label: formatRangeLabel(since, until),
    urlTop: buildXSearchUrl(since, until, "top"),
    urlLive: buildXSearchUrl(since, until, "live"),
    index: 0,
  };
}

export function generateXSearchIntervals(endDateIso: string = getTodayIso()): XSearchInterval[] {
  const intervals: XSearchInterval[] = [];
  let cursor = X_SEARCH_START;
  let index = 1;

  while (compareIsoDates(cursor, endDateIso) <= 0) {
    const since = cursor;
    const untilExclusive = addUtcDaysIso(cursor, X_SEARCH_INTERVAL_DAYS);
    const until =
      compareIsoDates(untilExclusive, addUtcDaysIso(endDateIso, 1)) > 0
        ? addUtcDaysIso(endDateIso, 1)
        : untilExclusive;

    intervals.push({
      since,
      until,
      label: formatRangeLabel(since, until),
      urlTop: buildXSearchUrl(since, until, "top"),
      urlLive: buildXSearchUrl(since, until, "live"),
      index,
    });

    cursor = until;
    index += 1;
  }

  return intervals.reverse().map((interval, i) => ({ ...interval, index: i + 1 }));
}
