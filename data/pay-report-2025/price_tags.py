import csv, sys
import reproduce as R

SEK_PER_USD = 9.9098
MIN_RESPONSES = 20
COUNTRY_ALIASES = {"Republic of Korea": "South Korea"}
MARKETS = {
    "Sweden": ["Sweden"],
    "High-growth EU": ["Ireland", "Denmark", "Netherlands", "Germany", "Portugal", "Spain", "Poland", "France", "Estonia"],
    "United States": ["United States of America"],
    "Asia": ["Israel", "Japan", "China", "India", "Singapore", "United Arab Emirates", "South Korea", "Hong Kong (S.A.R.)"],
}

def pay(path):
    csv.field_size_limit(sys.maxsize)
    out = {}
    for row in csv.DictReader(open(path, newline="", encoding="utf-8")):
        years, comp = R.number(row["WorkExp"]), R.number(row["ConvertedCompYearly"])
        if (row["Employment"] == "Employed" and row["ICorPM"] == "Individual contributor"
                and row["DevType"] in R.DEV_TYPES and years is not None and 8 <= years <= 15
                and comp and 5_000 < comp < 1_500_000):
            country = COUNTRY_ALIASES.get(row["Country"], row["Country"])
            out.setdefault(country, []).append(comp)
    return out

def k(usd):
    return f"{usd / 1000:,.0f}k"

if __name__ == "__main__":
    data = pay(sys.argv[1] if len(sys.argv) > 1 else "so2025.csv")
    print("| Market | Country | Responses | Price tag, USD/year (SEK) |\n|---|---|---|---|")
    for market, countries in MARKETS.items():
        for c in countries:
            v = data.get(c, [])
            if len(v) < MIN_RESPONSES:
                print(f"| {market} | {c} | {len(v)} | too few responses |")
                continue
            lo = R.percentile(v, .75)
            hi = (lo + R.percentile(v, .9)) / 2
            print(f"| {market} | {c} | {len(v)} | {k(lo)}–{k(hi)} (SEK {k(lo * SEK_PER_USD)}–{k(hi * SEK_PER_USD)}) |")
