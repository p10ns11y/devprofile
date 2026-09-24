import bands from "../../data/pay-report-2025/so_bands.json";

export const PAY_REPORT_DATA_DATE = "Data pulled 24 Sep 2026";

export const TARGET_RANGE_LABEL = "USD 85k–94k / year (SEK 840k–936k; 70k–78k per month)";

export const TARGET_RANGE_HREF = "/pay-report#target-range";

export const REPRODUCE_SCRIPT_URL =
  "https://github.com/p10ns11y/devprofile/blob/main/data/pay-report-2025/reproduce.py";

export const PRICE_TAGS_SCRIPT_URL =
  "https://github.com/p10ns11y/devprofile/blob/main/data/pay-report-2025/price_tags.py";

export const EMPLOYER_COST_SCRIPT_URL =
  "https://github.com/p10ns11y/devprofile/blob/main/data/pay-report-2025/employer_cost.py";

export const EMPLOYER_COST_SWEDEN_LINE_URL = `${EMPLOYER_COST_SCRIPT_URL}#L4`;

const DISPLAY_NAMES: Record<string, string> = {
  "United States of America": "United States",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
};

export type PayBand = {
  readonly country: string;
  readonly label: string;
  readonly n: number;
  readonly p25: number;
  readonly median: number;
  readonly p75: number;
  readonly p90: number;
};

type RawBand = {
  readonly n: number;
  readonly p25: number;
  readonly p50: number;
  readonly p75: number;
  readonly p90: number;
};

function displayName(country: string): string {
  return DISPLAY_NAMES[country] ?? country;
}

export function bandsFor(span: "5-10y" | "8-15y"): PayBand[] {
  const group = bands[span] as Record<string, RawBand>;
  return Object.entries(group)
    .map(([country, row]) => ({
      country,
      label: displayName(country),
      n: row.n,
      p25: row.p25,
      median: row.p50,
      p75: row.p75,
      p90: row.p90,
    }))
    .sort((left, right) => right.median - left.median || left.label.localeCompare(right.label));
}

export const CHART_DOMAIN_THOUSANDS = 205;

export const CHART_TICKS = [25, 50, 75, 100, 125, 150, 175, 200] as const;

export function chartSummary(rows: readonly PayBand[]): string {
  const top = rows[0];
  const bottom = rows[rows.length - 1];
  return `Individual-contributor developers, 8–15 years of experience. Stack Overflow Developer Survey 2025, employed full-time. Horizontal range of total yearly pay in thousand USD, sorted by median. ${top?.label ?? "The top country"} is highest and ${bottom?.label ?? "the last country"} is lowest. Each row is a bar from the 25th to the 75th percentile with a dot at the median. Sweden is emphasised.`;
}

export type MarketPriceTag = {
  readonly market: string;
  readonly country: string;
  readonly responses: number;
  readonly tag: string;
};

const PRICE_TAG_NAMES: Record<string, string> = {
  "United States of America": "United States",
  "Hong Kong (S.A.R.)": "Hong Kong",
  "United Arab Emirates": "United Arab Emirates",
};

export function priceTagCountry(country: string): string {
  return PRICE_TAG_NAMES[country] ?? country;
}

export const SWEDEN_SURVEY_PRICE_TAG = "84k–94k (SEK 831k–931k)";

export const MARKET_PRICE_TAGS: readonly MarketPriceTag[] = [
  { market: "Sweden", country: "Sweden", responses: 126, tag: SWEDEN_SURVEY_PRICE_TAG },
  {
    market: "High-growth EU",
    country: "Ireland",
    responses: 30,
    tag: "170k–185k (SEK 1,689k–1,831k)",
  },
  {
    market: "High-growth EU",
    country: "Denmark",
    responses: 39,
    tag: "124k–134k (SEK 1,233k–1,325k)",
  },
  {
    market: "High-growth EU",
    country: "Netherlands",
    responses: 138,
    tag: "104k–124k (SEK 1,035k–1,233k)",
  },
  {
    market: "High-growth EU",
    country: "Germany",
    responses: 524,
    tag: "104k–110k (SEK 1,035k–1,092k)",
  },
  {
    market: "High-growth EU",
    country: "Portugal",
    responses: 53,
    tag: "95k–116k (SEK 943k–1,150k)",
  },
  { market: "High-growth EU", country: "Spain", responses: 114, tag: "90k–100k (SEK 894k–989k)" },
  { market: "High-growth EU", country: "Poland", responses: 91, tag: "87k–98k (SEK 865k–974k)" },
  { market: "High-growth EU", country: "France", responses: 181, tag: "84k–100k (SEK 828k–989k)" },
  { market: "High-growth EU", country: "Estonia", responses: 20, tag: "84k–95k (SEK 835k–940k)" },
  {
    market: "United States",
    country: "United States of America",
    responses: 1032,
    tag: "204k–252k (SEK 2,024k–2,499k)",
  },
  { market: "Asia", country: "Israel", responses: 33, tag: "156k–173k (SEK 1,545k–1,714k)" },
  { market: "Asia", country: "Japan", responses: 35, tag: "96k–108k (SEK 955k–1,066k)" },
  { market: "Asia", country: "China", responses: 20, tag: "87k–94k (SEK 863k–928k)" },
  { market: "Asia", country: "India", responses: 192, tag: "56k–69k (SEK 559k–683k)" },
  { market: "Asia", country: "Singapore", responses: 9, tag: "too few responses" },
  { market: "Asia", country: "United Arab Emirates", responses: 11, tag: "too few responses" },
  { market: "Asia", country: "South Korea", responses: 5, tag: "too few responses" },
  { market: "Asia", country: "Hong Kong (S.A.R.)", responses: 6, tag: "too few responses" },
];
