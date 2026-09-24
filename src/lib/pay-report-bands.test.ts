import { describe, expect, it } from "vitest";
import {
  bandsFor,
  CHART_DOMAIN_THOUSANDS,
  MARKET_PRICE_TAGS,
  priceTagCountry,
  SWEDEN_SURVEY_PRICE_TAG,
  TARGET_RANGE_LABEL,
} from "./pay-report-bands";

const expectedEightToFifteen = [
  ["United States", 1032, 127000, 161100, 204250],
  ["Switzerland", 72, 123993, 142592, 172660],
  ["Israel", 33, 114715, 141188, 155895],
  ["Ireland", 30, 102383, 118335, 170396],
  ["Canada", 188, 80254, 107249, 135156],
  ["Denmark", 39, 93312, 104510, 124416],
  ["United Kingdom", 288, 81515, 102106, 132057],
  ["Norway", 33, 84003, 101792, 118593],
  ["Australia", 83, 84512, 100765, 122055],
  ["Germany", 524, 71697, 87591, 104413],
  ["Netherlands", 138, 71146, 87011, 104413],
  ["Finland", 39, 60071, 82950, 93537],
  ["Spain", 114, 53570, 74830, 90201],
  ["Sweden", 126, 61792, 73375, 83904],
  ["Portugal", 53, 54527, 71929, 95132],
  ["France", 181, 58007, 69609, 83531],
  ["Poland", 91, 51851, 65496, 87328],
  ["India", 192, 24410, 38010, 56376],
] as const;

describe("pay report 8–15 year bands", () => {
  it("matches the recorded Stack Overflow rows, sorted by median", () => {
    const rows = bandsFor("8-15y").map((row) => [row.label, row.n, row.p25, row.median, row.p75]);
    expect(rows).toEqual(expectedEightToFifteen.map((row) => [...row]));
  });

  it("keeps the axis wide enough for the United States 75th percentile", () => {
    const unitedStates = bandsFor("8-15y").find((row) => row.label === "United States");
    expect(unitedStates?.p75).toBe(204250);
    expect(unitedStates ? unitedStates.p75 / 1000 : 0).toBeLessThanOrEqual(CHART_DOMAIN_THOUSANDS);
    expect(CHART_DOMAIN_THOUSANDS).toBeGreaterThanOrEqual(205);
  });

  it("uses the landing target range text", () => {
    expect(TARGET_RANGE_LABEL).toBe("USD 85k–94k / year (SEK 840k–936k; 70k–78k per month)");
  });
});

describe("market price tags", () => {
  it("merges Korea into one South Korea row and keeps survey names for matching", () => {
    const countries = MARKET_PRICE_TAGS.map((row) => row.country);
    expect(countries).not.toContain("Republic of Korea");
    expect(countries.filter((country) => country === "South Korea")).toEqual(["South Korea"]);
    const korea = MARKET_PRICE_TAGS.find((row) => row.country === "South Korea");
    expect(korea).toMatchObject({ responses: 5, tag: "too few responses" });
    expect(priceTagCountry("United States of America")).toBe("United States");
    expect(priceTagCountry("Hong Kong (S.A.R.)")).toBe("Hong Kong");
    expect(priceTagCountry("United Arab Emirates")).toBe("United Arab Emirates");
  });

  it("keeps the Sweden survey tag distinct from the monthly target", () => {
    const sweden = MARKET_PRICE_TAGS.find((row) => row.country === "Sweden");
    expect(sweden?.tag).toBe(SWEDEN_SURVEY_PRICE_TAG);
    expect(sweden?.tag).toBe("84k–94k (SEK 831k–931k)");
    expect(TARGET_RANGE_LABEL).not.toContain("831k");
    expect(SWEDEN_SURVEY_PRICE_TAG).not.toContain("840k");
  });
});
