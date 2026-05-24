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

function parseUtcDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatRangeLabel(since: Date, untilExclusive: Date): string {
  const lastDay = addUtcDays(untilExclusive, -1);
  const sameYear = since.getUTCFullYear() === lastDay.getUTCFullYear();
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  });

  const sinceLabel = formatter.format(since);
  const untilLabel = formatter.format(lastDay);

  if (sameYear) {
    return `${sinceLabel} – ${untilLabel}, ${yearFormatter.format(since)}`;
  }

  return `${sinceLabel}, ${yearFormatter.format(since)} – ${untilLabel}, ${yearFormatter.format(lastDay)}`;
}

export function buildXSearchUrl(since: string, until: string, filter: "top" | "live"): string {
  const q = `(from:${X_SEARCH_USERNAME}) lang:en until:${until} since:${since}`;
  const params = new URLSearchParams({ q, src: "typed_query", f: filter });
  return `https://x.com/search?${params.toString()}`;
}

export function generateXSearchIntervals(endDate: Date = new Date()): XSearchInterval[] {
  const start = parseUtcDate(X_SEARCH_START);
  const end = parseUtcDate(formatIso(endDate));
  const intervals: XSearchInterval[] = [];
  let cursor = start;
  let index = 1;

  while (cursor <= end) {
    const since = formatIso(cursor);
    const untilExclusive = addUtcDays(cursor, X_SEARCH_INTERVAL_DAYS);
    const until =
      untilExclusive > addUtcDays(end, 1)
        ? formatIso(addUtcDays(end, 1))
        : formatIso(untilExclusive);

    intervals.push({
      since,
      until,
      label: formatRangeLabel(cursor, parseUtcDate(until)),
      urlTop: buildXSearchUrl(since, until, "top"),
      urlLive: buildXSearchUrl(since, until, "live"),
      index,
    });

    cursor = parseUtcDate(until);
    index += 1;
  }

  return intervals.reverse().map((interval, i) => ({ ...interval, index: i + 1 }));
}
