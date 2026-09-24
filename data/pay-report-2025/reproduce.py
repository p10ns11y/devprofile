import csv, json, sys, time, urllib.request

SCB = "https://api.scb.se/OV0104/v1/doris/sv/ssd/AM/AM0110/AM0110A/"
SURVEY = "https://media.githubusercontent.com/media/StackExchange/Survey/main/packages/archive/2025/results.csv"
DEV_TYPES = {
    "Developer, full-stack", "Developer, back-end", "Developer, front-end",
    "Architect, software or solutions", "Developer, desktop or enterprise applications",
    "Developer, mobile", "AI/ML engineer", "Developer, AI apps or physical AI",
    "Data engineer", "DevOps engineer or professional", "Cloud infrastructure engineer",
}


def scb(table, query):
    body = json.dumps({"query": query, "response": {"format": "json"}}).encode()
    request = urllib.request.Request(SCB + table, body, {"Content-Type": "application/json"})
    time.sleep(2)
    return json.load(urllib.request.urlopen(request))["data"]


def pick(code, *values):
    return {"code": code, "selection": {"filter": "item", "values": list(values)}}


def percentile(values, p):
    values = sorted(values)
    k = (len(values) - 1) * p
    lo = int(k)
    hi = min(lo + 1, len(values) - 1)
    return values[lo] + (values[hi] - values[lo]) * (k - lo)


def number(text):
    try:
        return float(text)
    except ValueError:
        return None


def sweden():
    spread = scb("LoneSpridSektYrk4AN", [
        pick("Sektor", "5"), pick("Yrke2012", "1311", "1312", "2511", "2512"), pick("Kon", "1+2"),
        pick("ContentsCode", "000007CD", "000007CE", "000007CF", "000007CG", "000007CH", "000007CI"),
        pick("Tid", "2023", "2024", "2025"),
    ])
    region = scb("LonYrkeRegion4AN", [
        pick("Region", "SE", "SE11", "SE22", "SE23"), pick("Sektor", "5"),
        pick("Yrke2012", "1311", "1312", "2511", "2512"), pick("Kon", "1+2"),
        pick("ContentsCode", "000007AS"), pick("Tid", "2025"),
    ])
    age = scb("LonYrkeAlder4AN", [
        pick("Sektor", "5"), pick("Yrke2012", "2511", "2512"), pick("Kon", "1+2"),
        pick("Alder", "25-34", "35-44", "45-54", "tot"), pick("ContentsCode", "000007BN"), pick("Tid", "2025"),
    ])
    return {"spread": spread, "region": region, "age": age}


def world(path, low=8, high=15):
    csv.field_size_limit(sys.maxsize)
    pay = {}
    for row in csv.DictReader(open(path, newline="", encoding="utf-8")):
        years = number(row["WorkExp"])
        comp = number(row["ConvertedCompYearly"])
        if (row["Employment"] == "Employed" and row["ICorPM"] == "Individual contributor"
                and row["DevType"] in DEV_TYPES and years is not None and low <= years <= high
                and comp and 5_000 < comp < 1_500_000):
            pay.setdefault(row["Country"], []).append(comp)
    return {
        country: {"n": len(v), **{f"p{int(p * 100)}": round(percentile(v, p)) for p in (.25, .5, .75, .9)}}
        for country, v in pay.items() if len(v) >= 15
    }


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else urllib.request.urlretrieve(SURVEY, "results.csv")[0]
    print(json.dumps({"sweden": sweden(), "world": world(path)}, indent=1, ensure_ascii=False))
