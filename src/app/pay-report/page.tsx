import Link from "next/link";
import { CountryPayChart } from "@/components/pay-report/country-pay-chart";
import { PageShell } from "@/components/site/PageShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SectionShell } from "@/components/site/SectionShell";
import {
  bandsFor,
  EMPLOYER_COST_SCRIPT_URL,
  EMPLOYER_COST_SWEDEN_LINE_URL,
  MARKET_PRICE_TAGS,
  PAY_REPORT_DATA_DATE,
  PRICE_TAGS_SCRIPT_URL,
  priceTagCountry,
  REPRODUCE_SCRIPT_URL,
  SWEDEN_SURVEY_PRICE_TAG,
  TARGET_RANGE_LABEL,
} from "@/lib/pay-report-bands";

const ECB_RATES_URL =
  "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html";

const MERGED_PRS_SCRIPT_URL =
  "https://github.com/p10ns11y/devprofile/blob/main/data/pay-report-2025/merged_prs.py";

const MERGED_PRS_APR_SEP = [
  ["p10ns11y/collab-finder", 75],
  ["p10ns11y/devprofile", 57],
  ["p10ns11y/thepulimaangani", 50],
  ["p10ns11y/arch-machine", 41],
  ["p10ns11y/adaptate", 29],
  ["thecuriousts/ensembly", 22],
  ["p10ns11y/plugins", 16],
  ["p10ns11y/shellyxz.sh", 15],
  ["p10ns11y/skills", 9],
  ["p10ns11y/life-os", 8],
  ["p10ns11y/grok-build", 5],
  ["p10ns11y/packedbox", 5],
  ["p10ns11y/sorkalam-extension", 5],
  ["p10ns11y/p10ns11y", 4],
  ["thecuriousts/premflow", 4],
  ["p10ns11y/agent-prompt-tuning-lab", 3],
  ["p10ns11y/prototype-it-to-explain-itself", 2],
  ["p10ns11y/dev-machine-guard-linux", 1],
  ["p10ns11y/elomaxz", 1],
  ["p10ns11y/grok-daily-productivity-extensions", 1],
  ["p10ns11y/latex-cv", 1],
  ["thecuriousts/participatory-mesh", 1],
] as const;

function Recheck({ href }: { href: string }) {
  return (
    <p className="pay-report__recheck">
      <a href={href}>Re-check these numbers</a>
    </p>
  );
}

function usd(value: number): string {
  return value.toLocaleString("en-US");
}

export default function PayReportPage() {
  const world = bandsFor("8-15y");

  return (
    <PageShell className="pay-report">
      <div className="site-container pay-report__intro">
        <SectionHeading
          id="pay-report-title"
          headingLevel="h1"
          eyebrow="Pay"
          title="Developer pay in Sweden and around the world: what the 2025 data says"
          description="Salary talks feel awkward mostly because one side has the data and the other side guesses. This report puts the public numbers in one place so a software engineer can name a figure and back it up."
        />
        <p className="section-lead">{PAY_REPORT_DATA_DATE}.</p>
      </div>

      <SectionShell id="sources" headingId="sources-heading">
        <SectionHeading id="sources-heading" title="Sources" />
        <div className="pay-report__body">
          <ul>
            <li>
              <strong>Statistics Sweden (SCB)</strong>, the official wage structure statistics for
              2025. Table <code>LoneSpridSektYrk4AN</code> gives percentiles by occupation, and{" "}
              <code>LonYrkeRegion4AN</code> and <code>LonYrkeAlder4AN</code> give averages by region
              and age. Occupation codes are SSYK 2012: 2512 is software and systems developers, 2511
              is systems analysts and IT architects, and 1311/1312 are IT managers. Figures are
              gross monthly salary in SEK for private-sector salaried employees (privatanställda
              tjänstemän).
            </li>
            <li>
              <strong>Stack Overflow Developer Survey 2025</strong>, the public results file (about
              49,000 responses, licensed under ODbL). It is filtered to people who are employed
              full-time, individual contributors, and in developer, architect, AI/ML, data, DevOps
              or cloud roles, and reports total yearly pay converted to USD by Stack Overflow.
              Download the 2025 results zip from{" "}
              <a href="https://survey.stackoverflow.co/">survey.stackoverflow.co</a> (the public
              results CSV, about 140 MB). <code>reproduce.py</code> can also download it from the
              URL in the script. SCB data is fetched live from the SCB PxWeb API.
            </li>
          </ul>
        </div>
      </SectionShell>

      <SectionShell id="sweden-scb" headingId="sweden-scb-heading" background="elevated">
        <SectionHeading
          id="sweden-scb-heading"
          title="Sweden: official figures (SCB, 2025, gross monthly SEK)"
        />
        <div className="pay-report__body pay-report__body--wide">
          <div className="pay-report__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Occupation</th>
                  <th scope="col">10th</th>
                  <th scope="col">25th</th>
                  <th scope="col">Median</th>
                  <th scope="col">75th</th>
                  <th scope="col">90th</th>
                  <th scope="col">Average</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Software and systems developers (2512)</th>
                  <td>39,800</td>
                  <td>46,500</td>
                  <td>53,600</td>
                  <td>63,000</td>
                  <td>73,200</td>
                  <td>55,900</td>
                </tr>
                <tr>
                  <th scope="row">Systems analysts and IT architects (2511)</th>
                  <td>43,800</td>
                  <td>52,500</td>
                  <td>60,000</td>
                  <td>70,900</td>
                  <td>81,300</td>
                  <td>62,300</td>
                </tr>
                <tr>
                  <th scope="row">IT managers, level 2 (1312)</th>
                  <td>–</td>
                  <td>59,700</td>
                  <td>74,500</td>
                  <td>87,800</td>
                  <td>107,200</td>
                  <td>78,800</td>
                </tr>
                <tr>
                  <th scope="row">IT managers, level 1 (1311)</th>
                  <td>54,400</td>
                  <td>66,200</td>
                  <td>75,300</td>
                  <td>93,700</td>
                  <td>121,700</td>
                  <td>83,700</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
          <p>
            <strong>Stockholm pays more.</strong> The average for developers in the Stockholm region
            is 59,700 SEK, compared with 55,900 nationally (+6.8%). For architects it&apos;s 65,900
            compared with 62,300 (+5.8%). West Sweden averages 54,400 for developers and South
            Sweden 53,100.
          </p>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
          <p>
            <strong>Pay rises with age, which roughly tracks experience.</strong> Developers average
            49,500 SEK at ages 25–34, 56,900 at 35–44 and 61,800 at 45–54. Architects average
            51,800, 61,700 and 67,300 for the same age bands.
          </p>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
          <p>
            <strong>Growth is slowing.</strong> The developer median rose from 51,200 (2023) to
            53,000 (2024) to 53,600 (2025), an increase of 1.1% in the last year.
          </p>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
        </div>
      </SectionShell>

      <SectionShell id="sweden-survey" headingId="sweden-survey-heading">
        <SectionHeading id="sweden-survey-heading" title="Sweden: survey cross-check" />
        <div className="pay-report__body">
          <p>
            Swedish Stack Overflow respondents with 8–15 years of experience (122 answers in SEK)
            report 600,000 at the 25th percentile, a 700,000 median, 803,000 at the 75th and 998,000
            at the 90th, all in SEK per year. Divided by 12, the median is about 58,000 a month,
            which matches SCB&apos;s Stockholm average. Survey respondents lean senior and urban, so
            treat the survey as the Stockholm, experienced end of the market.
          </p>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
        </div>
      </SectionShell>

      <SectionShell id="world" headingId="world-heading" background="elevated">
        <SectionHeading
          id="world-heading"
          title="Around the world (8–15 years of experience, total yearly pay in USD)"
        />
        <div className="pay-report__body pay-report__body--wide">
          <CountryPayChart />
          <Recheck href={REPRODUCE_SCRIPT_URL} />
          <div className="pay-report__scroll">
            <table>
              <caption className="sr-only">
                Stack Overflow 2025 total yearly pay in USD for individual contributors with 8–15
                years of experience. This table is the text alternative for the chart above.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Country</th>
                  <th scope="col">Responses</th>
                  <th scope="col">25th</th>
                  <th scope="col">Median</th>
                  <th scope="col">75th</th>
                  <th scope="col">90th</th>
                </tr>
              </thead>
              <tbody>
                {world.map((row) => (
                  <tr key={row.country} data-row={row.label === "Sweden" ? "sweden" : undefined}>
                    <th scope="row">{row.label}</th>
                    <td>{row.n}</td>
                    <td>{usd(row.p25)}</td>
                    <td>{usd(row.median)}</td>
                    <td>{usd(row.p75)}</td>
                    <td>{usd(row.p90)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
        </div>
      </SectionShell>

      <SectionShell id="price-tags" headingId="price-tags-heading">
        <SectionHeading id="price-tags-heading" title="Price tags by market" />
        <div className="pay-report__body pay-report__body--wide">
          <p>
            For each country, the low end is its 75th percentile for 8–15 years of experience. The
            high end is the midpoint between its 75th and 90th percentiles. SEK figures use 9.9098
            SEK per USD (ECB reference rate, 24 Sep 2026). The Sweden row is the survey-based price
            tag, {SWEDEN_SURVEY_PRICE_TAG}. It is not the monthly target on the landing page (
            {TARGET_RANGE_LABEL}).
          </p>
          <div className="pay-report__scroll">
            <table>
              <caption>
                Survey-based price tags. The Sweden row uses Stack Overflow percentiles. It is not
                the landing-page target of {TARGET_RANGE_LABEL}, which is derived from 70,000–78,000
                SEK per month.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Market</th>
                  <th scope="col">Country</th>
                  <th scope="col">Responses</th>
                  <th scope="col">Survey price tag, USD/year (SEK)</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_PRICE_TAGS.map((row) => (
                  <tr key={row.country} data-row={row.country === "Sweden" ? "sweden" : undefined}>
                    <td>{row.market}</td>
                    <th scope="row">{priceTagCountry(row.country)}</th>
                    <td>{row.responses}</td>
                    <td>{row.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Recheck href={PRICE_TAGS_SCRIPT_URL} />
          <ul>
            <li>The data is by country, not by city.</li>
            <li>
              Markets with fewer than 20 responses are shown as &quot;too few responses&quot; (South
              Korea, Singapore, Hong Kong, United Arab Emirates).
            </li>
            <li>The India range reflects employers who pay international rates.</li>
          </ul>
        </div>
      </SectionShell>

      <SectionShell id="employer-sweden" headingId="employer-sweden-heading">
        <SectionHeading
          id="employer-sweden-heading"
          title="What a developer actually costs a Swedish employer (2026 rates)"
        />
        <div className="pay-report__body pay-report__body--wide">
          <p>
            Salary is only part of what a company pays. On top of gross salary a Swedish employer
            pays:
          </p>
          <ul>
            <li>
              <strong>Employer social fees (arbetsgivaravgifter):</strong> 31.42% of gross salary
              for employees born 1959–2002 (Skatteverket, 2026).
            </li>
            <li>
              <strong>Occupational pension (ITP1, under a collective agreement):</strong> 4.5% of
              monthly salary up to 7.5 income base amounts (52 125 SEK/month in 2026, from an income
              base amount of 83 400 SEK), and 30% of the part above that.
            </li>
            <li>
              <strong>Special payroll tax on pension premiums (särskild löneskatt):</strong> 24.26%
              of the pension premium (Skatteverket).
            </li>
            <li>
              <strong>Collective insurances</strong> (sick pay top-up, life, work injury, severance)
              are also paid under collective agreements. They are small and vary by agreement, so
              they are left out of the totals below, which therefore slightly understate the real
              cost.
            </li>
          </ul>
          <div className="pay-report__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Monthly salary</th>
                  <th scope="col">Employer fee 31.42%</th>
                  <th scope="col">ITP1 pension</th>
                  <th scope="col">Payroll tax on pension 24.26%</th>
                  <th scope="col">Total monthly cost</th>
                  <th scope="col">Cost vs salary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">53 600 (Median developer, Sweden (SCB 2025))</th>
                  <td>16 841</td>
                  <td>2 788</td>
                  <td>676</td>
                  <td>
                    <strong>73 906</strong>
                  </td>
                  <td>1.38x</td>
                </tr>
                <tr>
                  <th scope="row">59 700 (Average developer, Stockholm (SCB 2025))</th>
                  <td>18 758</td>
                  <td>4 618</td>
                  <td>1 120</td>
                  <td>
                    <strong>84 196</strong>
                  </td>
                  <td>1.41x</td>
                </tr>
                <tr>
                  <th scope="row">63 000 (75th percentile, Sweden)</th>
                  <td>19 795</td>
                  <td>5 608</td>
                  <td>1 361</td>
                  <td>
                    <strong>89 763</strong>
                  </td>
                  <td>1.42x</td>
                </tr>
                <tr>
                  <th scope="row">70 000 (70k SEK)</th>
                  <td>21 994</td>
                  <td>7 708</td>
                  <td>1 870</td>
                  <td>
                    <strong>101 572</strong>
                  </td>
                  <td>1.45x</td>
                </tr>
                <tr>
                  <th scope="row">73 200 (90th percentile, Sweden)</th>
                  <td>22 999</td>
                  <td>8 668</td>
                  <td>2 103</td>
                  <td>
                    <strong>106 970</strong>
                  </td>
                  <td>1.46x</td>
                </tr>
                <tr>
                  <th scope="row">80 000 (80k SEK)</th>
                  <td>25 136</td>
                  <td>10 708</td>
                  <td>2 598</td>
                  <td>
                    <strong>118 442</strong>
                  </td>
                  <td>1.48x</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Recheck href={EMPLOYER_COST_SCRIPT_URL} />
          <p>
            Above 52 125 SEK a month, each extra krona of salary costs the employer about 1.69
            kronor, because the 30% pension rate kicks in. A 5 000 SEK/month raise at senior level
            costs the company about 8 435 SEK a month. Companies without a collective agreement are
            not required to pay ITP, but most tech employers offer a matching pension because
            candidates expect it. Ask whether the offer includes ITP1 or an equivalent, since an
            offer without it is worth several thousand SEK a month less.
          </p>
        </div>
      </SectionShell>

      <SectionShell id="employer-world" headingId="employer-world-heading" background="elevated">
        <SectionHeading
          id="employer-world-heading"
          title="Employer cost across countries (2026 rates)"
        />
        <div className="pay-report__body pay-report__body--wide">
          <p>
            Countries split the cost of pensions and social insurance differently. Sweden puts most
            of it on the employer, so Swedish gross salaries look lower. The US and Switzerland put
            more on the employee, so their gross salaries look higher. The table uses the Stack
            Overflow 2025 median pay for developers with 8–15 years of experience and adds what the
            employer must pay on top of it.
          </p>
          <div className="pay-report__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Country</th>
                  <th scope="col">Median pay (USD)</th>
                  <th scope="col">Employer extra on top</th>
                  <th scope="col">Total cost to employer (USD)</th>
                  <th scope="col">What the extra covers</th>
                </tr>
              </thead>
              <tbody>
                <tr data-row="sweden">
                  <th scope="row">Sweden</th>
                  <td>73,375</td>
                  <td>41.4%</td>
                  <td>103,782</td>
                  <td>31.42% social fees, plus ITP1 pension and the 24.26% tax on it</td>
                </tr>
                <tr>
                  <th scope="row">Germany</th>
                  <td>87,591</td>
                  <td>20.1%</td>
                  <td>105,240</td>
                  <td>Half of pension, unemployment, health and care insurance, with caps</td>
                </tr>
                <tr>
                  <th scope="row">Norway</th>
                  <td>101,792</td>
                  <td>16.1%</td>
                  <td>118,181</td>
                  <td>14.1% social fees (zone I), plus the 2% minimum pension</td>
                </tr>
                <tr>
                  <th scope="row">United Kingdom</th>
                  <td>102,106</td>
                  <td>15.7%</td>
                  <td>118,177</td>
                  <td>15% National Insurance above £5,000, plus the 3% minimum pension</td>
                </tr>
                <tr>
                  <th scope="row">Switzerland</th>
                  <td>142,592</td>
                  <td>9.1%</td>
                  <td>155,599</td>
                  <td>
                    5.3% old-age/disability, 1.1% unemployment, plus half of the minimum pension
                    (age 35–44)
                  </td>
                </tr>
                <tr>
                  <th scope="row">United States</th>
                  <td>161,100</td>
                  <td>7.7%</td>
                  <td>173,466</td>
                  <td>
                    6.2% Social Security (capped at $184,500), 1.45% Medicare, federal unemployment
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Recheck href={EMPLOYER_COST_SCRIPT_URL} />
          <p>
            Two things stand out. The first is that a Swedish senior developer costs the employer
            about the same as a German one, even though the Swedish salary is about 16% lower. The
            second is that the pay gap to the UK and Norway shrinks from about 39% to about 14% once
            the employer&apos;s extra costs are counted.
          </p>
          <p>
            The table only includes what law or near-universal agreements require. It leaves out
            several costs. In the US, health insurance is the big one: the employer&apos;s average
            share of family coverage was $20,143 in 2025 (KFF Employer Health Benefits Survey),
            about 12.5% of the median salary. It also leaves out US state unemployment tax, German
            accident insurance and sick-pay levies, Swiss accident insurance and family allowances,
            the UK Apprenticeship Levy (0.5% for large employers), and Swedish collective
            insurances. Converted at the ECB rates on 24 Sep 2026. Sources are Skatteverket, the
            German Federal Ministry of Health and Deutsche Rentenversicherung, Skatteetaten, GOV.UK,
            the Swiss AHV/IV information office, and the IRS. <code>employer_cost.py</code>{" "}
            reproduces the table.
          </p>
          <p>
            <strong>What this means for an employer hiring in Sweden:</strong> a foreign company
            hiring in Sweden, directly or through an employer-of-record service, pays these Swedish
            costs. For example, a 70,000 SEK/month salary costs the employer about 101,600 SEK a
            month, or roughly USD 123,000 a year. That is still below the cost of the same senior
            developer in the UK or the US.
          </p>
        </div>
      </SectionShell>

      <SectionShell id="caveats" headingId="caveats-heading">
        <SectionHeading id="caveats-heading" title="Caveats" />
        <div className="pay-report__body">
          <ul>
            <li>
              SCB&apos;s percentiles cover every experience level within an occupation. Stockholm
              percentiles in this report are not published by SCB. Where used, they are estimated by
              applying the regional average&apos;s ratio to the national percentiles.
            </li>
            <li>
              Survey pay is self-reported, and Stack Overflow converts it to USD at its own rate.
              Countries with fewer than 40 responses (Norway, Denmark, Finland, Ireland, Israel)
              have wide error bars.
            </li>
            <li>Neither source separates AI-specialist pay from general development.</li>
          </ul>
          <p>
            {PAY_REPORT_DATA_DATE}. The code that reproduces every number is linked from this page.
          </p>
        </div>
      </SectionShell>

      <SectionShell id="experience" headingId="experience-heading" background="elevated">
        <SectionHeading id="experience-heading" title="Why my experience fits the senior band" />
        <div className="pay-report__body">
          <p>
            Oneflow alone is 7 years 8 months (Oneflow AB, Stockholm, April 2017 to December 2024),
            which is just under the 8–15 year band. Progression: JavaScript Developer (Apr 2017–Feb
            2019), then Full Stack Integration Engineer (Mar 2019–Sep 2021, when I set up the
            integration team), then Engineering Team Lead (Oct 2021–Dec 2022), then Senior Software
            Engineer (Jan 2023–Dec 2024).
          </p>
          <p>
            Weavler AB, Stockholm: Full Stack Developer, January 2016 to March 2017, 1 year 2
            months. That role is listed in the <Link href="/cv">CV on this site</Link>.
          </p>
          <p>
            Durations are counted from the start month to the end month. The employment total used
            on this page is 7 years 8 months plus 1 year 2 months, 8 years 10 months of professional
            employment, which is inside the 8–15 year band. That is the count being used. The 2015
            summer internship is not included.
          </p>
          <p>
            From December 2024 onward I have been in family care while building and running my own
            software in public. I count that only as far as merged pull requests back it up, and I
            do not add it to the 8 years 10 months above. Merged PRs authored by p10ns11y in public
            repos, counted on 24 Sep 2026.
          </p>
          <p>
            December 2024 to March 2026 was intermittent public work:{" "}
            <a href="https://github.com/search?q=is%3Apr+is%3Amerged+author%3Ap10ns11y+merged%3A2024-12-01..2026-03-31&type=pullrequests">
              37 merged pull requests
            </a>
            . That period is intermittent and is not counted as full-time experience.
          </p>
          <Recheck href={MERGED_PRS_SCRIPT_URL} />
          <p>
            April 2026 to 24 September 2026 has been sustained public work:{" "}
            <a href="https://github.com/search?q=is%3Apr+is%3Amerged+author%3Ap10ns11y+merged%3A2026-04-01..2026-09-24&type=pullrequests">
              355 merged pull requests
            </a>
            . That includes <a href="https://github.com/p10ns11y/collab-finder">collab-finder</a>{" "}
            (kanithanj.ai, a Tauri + Rust + React desktop app; version 1.0.0 shipped 19 August 2026
            per the CV), <a href="https://github.com/p10ns11y/elomaxz">elomaxz</a> (an MVU framework
            for C), <a href="https://github.com/p10ns11y/thepulimaangani">thepulimaangani</a> (Rust
            compiled to WASM with a React UI),{" "}
            <a href="https://github.com/p10ns11y/adaptate">adaptate</a>, and{" "}
            <a href="https://github.com/p10ns11y/devprofile">this site</a>.
          </p>
          <div className="pay-report__scroll">
            <table>
              <caption>
                Merged pull requests from 1 Apr 2026 to 24 Sep 2026, by public repository.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Repository</th>
                  <th scope="col">Merged pull requests</th>
                </tr>
              </thead>
              <tbody>
                {MERGED_PRS_APR_SEP.map(([repo, count]) => (
                  <tr key={repo}>
                    <th scope="row">
                      <a href={`https://github.com/${repo}`}>{repo}</a>
                    </th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Recheck href={MERGED_PRS_SCRIPT_URL} />
          <p>
            The break does not reset the level. The SCB and survey bands measure years in the job
            market, and my senior and lead work (team lead October 2021–December 2022, then senior
            engineer to December 2024) sits inside the last three years before the break. The skills
            that make someone senior — owning an integration surface in other companies&apos; CRMs
            and public API, leading and hiring for a team, modernising a live codebase in place to
            TypeScript — do not expire in under two years. The public work since April 2026 shows
            current, hands-on production engineering in TypeScript, React, Rust and Tauri.
          </p>
          <p>
            Eight years 10 months of employment puts me in the 8–15 year survey band. Team lead
            experience, about 14 months, is closest to the SCB IT manager level 2 (1312) row. The
            8–15 year survey band is for individual contributors, and I am using it as the reference
            for a senior individual contributor role.
          </p>
        </div>
      </SectionShell>

      <SectionShell id="how-the-work-was-run" headingId="how-the-work-was-run-heading">
        <SectionHeading id="how-the-work-was-run-heading" title="How the work was run" />
        <div className="pay-report__body">
          <p>
            From April 2026 I had little time and a tight budget. I started a few public projects,
            kept the tooling small, and learned to direct frontier models and coding agents inside
            checks I could read.
          </p>
          <p>
            I started <a href="https://github.com/p10ns11y/collab-finder">collab-finder</a>{" "}
            (kanithanj.ai) so application fit, preparation, and the next step live in one local
            desktop app. Version 1.0.0 shipped on 19 August 2026, as the <Link href="/cv">CV</Link>{" "}
            records. Pull requests run the{" "}
            <a href="https://github.com/p10ns11y/collab-finder/blob/main/.github/workflows/ci.yml">
              CI workflow
            </a>
            , and the{" "}
            <a href="https://github.com/p10ns11y/collab-finder/blob/main/.agents/overlays/collab-finder-verify.md">
              verify overlay
            </a>{" "}
            names the commands that check must run. The app carries a copy of shared procedures
            under{" "}
            <a href="https://github.com/p10ns11y/collab-finder/tree/main/.agents/skills">
              .agents/skills
            </a>
            , drawn from the <a href="https://github.com/p10ns11y/skills">skills</a> library. Those
            procedures are also packaged in{" "}
            <a href="https://github.com/p10ns11y/plugins">plugins</a>, whose{" "}
            <a href="https://github.com/p10ns11y/plugins/blob/main/README.md">README</a> points back
            at the skills library.
          </p>
          <p>
            I started <a href="https://github.com/p10ns11y/devprofile">this site</a> so the CV, the
            public pages, and the checks share one record. Visitor routes are listed in the{" "}
            <a href="https://github.com/p10ns11y/devprofile/tree/main/.cursor/skills/verify-devprofile/features">
              verify map
            </a>
            .
          </p>
          <p>
            <a href="https://github.com/p10ns11y/thepulimaangani">thepulimaangani</a> is a Rust
            parser compiled to WASM with a React UI, so Tamil metre can run in the browser. Its{" "}
            <a href="https://github.com/p10ns11y/thepulimaangani/blob/malar/.github/workflows/ci.yml">
              CI workflow
            </a>{" "}
            builds that path. <a href="https://github.com/p10ns11y/elomaxz">elomaxz</a> is an MVU
            framework for C, so a small program stays predictable.{" "}
            <a href="https://github.com/p10ns11y/adaptate">adaptate</a> is a runtime validator; its{" "}
            <a href="https://github.com/p10ns11y/adaptate/blob/main/.github/workflows/ci.yml">
              CI workflow
            </a>{" "}
            lints, tests, and builds on each pull request.
          </p>
          <p>
            <a href="https://github.com/thecuriousts/ensembly">ensembly</a> is a thin control and
            memory layer on the machine I work from, so notes survive from one coding-agent run to
            the next. Personal notes also live in{" "}
            <a href="https://github.com/p10ns11y/life-os">life-os</a>.
          </p>
          <p>
            The machine setup is split on purpose.{" "}
            <a href="https://github.com/p10ns11y/packedbox">packedbox</a> is the portable Linux
            bootstrap. Its{" "}
            <a href="https://github.com/p10ns11y/packedbox/blob/main/README.md">README</a> points at{" "}
            <a href="https://github.com/p10ns11y/arch-machine">arch-machine</a> for the Arch
            profiles and at <a href="https://github.com/p10ns11y/shellyxz.sh">shellyxz.sh</a> for
            the shell. packedbox runs a{" "}
            <a href="https://github.com/p10ns11y/packedbox/blob/main/.github/workflows/ubuntu-path.yml">
              path-contract check
            </a>{" "}
            in CI. arch-machine runs{" "}
            <a href="https://github.com/p10ns11y/arch-machine/blob/sentinel/.github/workflows/ci.yml">
              shell and config checks
            </a>{" "}
            in CI.
          </p>
        </div>
      </SectionShell>

      <SectionShell id="target-range" headingId="target-range-heading">
        <SectionHeading id="target-range-heading" title="Target range" />
        <div className="pay-report__body">
          <p>
            <strong>{TARGET_RANGE_LABEL}</strong>
          </p>
          <p>
            This target is derived from the monthly salary below, converted at the stated rate. It
            is not the Sweden survey price tag ({SWEDEN_SURVEY_PRICE_TAG}) in the table above.
          </p>
          <p>
            70,000–78,000 SEK per month × 12 = 840,000–936,000 SEK per year. Converted at the{" "}
            <a href={ECB_RATES_URL}>ECB euro foreign exchange reference rates</a> for 24 Sep 2026,
            which give 9.9098 SEK per USD: 840,000 / 9.9098 ≈ USD 84,800 and 936,000 / 9.9098 ≈ USD
            94,500, shown as USD 85k–94k.
          </p>
          <p>
            70k–78k SEK/month is between the SCB 75th (63,000) and 90th (73,200) percentile for
            developers and around the 75th–90th percentile band for IT architects (70,900 / 81,300);
            per year, 840k–936k SEK is between the Swedish survey 75th (803,000) and 90th (998,000)
            percentile for 8–15 years. A 70,000 SEK monthly salary is{" "}
            <a href={EMPLOYER_COST_SWEDEN_LINE_URL}>101,572 SEK total monthly cost</a> in{" "}
            <code>employer_cost.py</code>.
          </p>
          <Recheck href={REPRODUCE_SCRIPT_URL} />
        </div>
      </SectionShell>
    </PageShell>
  );
}
