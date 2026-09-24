# Pay report 2025

Recorded inputs for the developer pay report.

| File | What it is |
|---|---|
| `reproduce.py` | Pulls Statistics Sweden wage tables from the SCB PxWeb API and builds Stack Overflow 2025 country bands from the public survey CSV. |
| `employer_cost.py` | Turns the 8–15 year survey medians into employer cost, using 2026 statutory rates and the ECB reference rates for 24 Sep 2026. |
| `reproduce-output.json` | Recorded output of `reproduce.py` (SCB cells and survey bands). |
| `so_bands.json` | Stack Overflow 2025 bands by country for 5–10 years and 8–15 years of experience. |
| `price_tags.py` | Builds a market price tag from the same survey CSV: 75th percentile to the midpoint of the 75th and 90th, for 8–15 years. Imports `reproduce.py`. |
| `merged_prs.py` | Counts merged pull requests authored by p10ns11y in public repos for Dec 2024–Mar 2026 and Apr 2026–24 Sep 2026. Uses the GitHub search API. |

## How to run

```bash
python3 employer_cost.py
python3 reproduce.py path/to/survey_results_public.csv
python3 price_tags.py path/to/survey_results_public.csv
python3 merged_prs.py
```

`reproduce.py` with no argument downloads the survey CSV itself from the URL in the script.

## Survey data

Download the 2025 results zip from [https://survey.stackoverflow.co/](https://survey.stackoverflow.co/). Use the public results CSV (about 140 MB, ODbL licence). Do not commit that CSV.

SCB figures are fetched live from the SCB PxWeb API (`api.scb.se`) when you run `reproduce.py`.
