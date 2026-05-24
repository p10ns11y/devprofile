type PlainDateParts = { year: number; month: number; day: number };

function parseIsoParts(iso: string): PlainDateParts {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function hasTemporal(): boolean {
  return typeof globalThis !== "undefined" && "Temporal" in globalThis;
}

export function addUtcDaysIso(iso: string, days: number): string {
  if (hasTemporal()) {
    return Temporal.PlainDate.from(iso).add({ days }).toString();
  }

  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getTodayIso(): string {
  if (hasTemporal()) {
    return Temporal.Now.plainDateISO().toString();
  }
  return new Date().toISOString().slice(0, 10);
}

export function compareIsoDates(a: string, b: string): number {
  if (hasTemporal()) {
    return Temporal.PlainDate.compare(Temporal.PlainDate.from(a), Temporal.PlainDate.from(b));
  }
  return a.localeCompare(b);
}

export function formatMonthYearFromIso(iso: string): string {
  if (hasTemporal()) {
    return Temporal.PlainDate.from(iso).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  const { year, month } = parseIsoParts(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function yearMonthKeyFromIso(iso: string): string {
  return iso.slice(0, 7);
}

export function formatRangeLabel(sinceIso: string, untilExclusiveIso: string): string {
  const lastDayIso = addUtcDaysIso(untilExclusiveIso, -1);

  if (hasTemporal()) {
    const since = Temporal.PlainDate.from(sinceIso);
    const lastDay = Temporal.PlainDate.from(lastDayIso);

    const monthDay = { month: "short" as const, day: "numeric" as const };
    const sinceLabel = since.toLocaleString("en-US", monthDay);
    const untilLabel = lastDay.toLocaleString("en-US", monthDay);

    if (since.year === lastDay.year) {
      return `${sinceLabel} – ${untilLabel}, ${since.year}`;
    }

    return `${sinceLabel}, ${since.year} – ${untilLabel}, ${lastDay.year}`;
  }

  const since = parseIsoParts(sinceIso);
  const lastDay = parseIsoParts(lastDayIso);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  });

  const sinceDate = new Date(Date.UTC(since.year, since.month - 1, since.day));
  const lastDate = new Date(Date.UTC(lastDay.year, lastDay.month - 1, lastDay.day));
  const sinceLabel = formatter.format(sinceDate);
  const untilLabel = formatter.format(lastDate);

  if (since.year === lastDay.year) {
    return `${sinceLabel} – ${untilLabel}, ${yearFormatter.format(sinceDate)}`;
  }

  return `${sinceLabel}, ${yearFormatter.format(sinceDate)} – ${untilLabel}, ${yearFormatter.format(lastDate)}`;
}

export function isTemporalAvailable(): boolean {
  return hasTemporal();
}
