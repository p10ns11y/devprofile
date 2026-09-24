import json, os, urllib.parse, urllib.request

WINDOWS = (
    "2024-12-01..2026-03-31",
    "2026-04-01..2026-09-24",
)


def search(query, page):
    url = "https://api.github.com/search/issues?" + urllib.parse.urlencode(
        {"q": query, "per_page": 100, "page": page}
    )
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "pay-report-merged-prs"}
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers)) as response:
        return json.load(response)


def repos_for(query):
    counts = {}
    page = 1
    total = None
    seen = 0
    while True:
        payload = search(query, page)
        total = payload["total_count"]
        items = payload.get("items") or []
        if not items:
            break
        for item in items:
            name = item["repository_url"].removeprefix("https://api.github.com/repos/")
            counts[name] = counts.get(name, 0) + 1
            seen += 1
        if seen >= total or len(items) < 100:
            break
        page += 1
    return total, counts


if __name__ == "__main__":
    for window in WINDOWS:
        query = f"is:pr is:merged author:p10ns11y merged:{window}"
        total, counts = repos_for(query)
        print(f"{window} {total}")
        if window.startswith("2026-04"):
            for name, count in sorted(counts.items(), key=lambda row: (-row[1], row[0])):
                print(f"{count:4} {name}")
