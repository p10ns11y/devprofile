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
            <Link href="/cv">Oneflow AB</Link>, Stockholm, April 2017 to December 2024: JavaScript
            Developer, then Full Stack Integration Engineer, then Engineering Team Lead (October
            2021 to December 2022, about 14 months), then Senior Software Engineer. Weavler AB,
            Stockholm, January 2016 to March 2017: Full Stack Developer.
          </p>
          <p>
            Durations are counted from the start month to the end month: 7 years 8 months plus 1
            year 2 months, 8 years 10 months in total. That total sits in the 8–15 year survey band
            for individual contributors, which I use as the reference for a senior individual
            contributor role.
          </p>
        </div>
      </SectionShell>

      <SectionShell
        id="why-the-break-doesnt-set-me-back"
        headingId="why-the-break-doesnt-set-me-back-heading"
      >
        <SectionHeading
          id="why-the-break-doesnt-set-me-back-heading"
          title="Why the break doesn't set me back"
        />
        <div className="pay-report__body">
          <p>
            Since December 2024 I have been on a career break for personal and family-care reasons.
            My senior and team lead work at Oneflow falls in the last three years before the break.
            Since then the way I work has moved forward. The projects began one after another,
            slowly at first. After a while the connections between them started to evolve and the
            work settled into one system.{" "}
            <strong>I direct coding agents and review what they produce.</strong> The projects below
            are that work.
          </p>
          <p>
            Each project aimed at a real problem of mine, and each one works a different part of
            software engineering: desktop apps, systems programming in C, Rust compiled to
            WebAssembly, API validation, and machine setup. I wrote the first proposals. Coding
            agents then drafted much of the detailed design, architecture and code, and I steered
            and reviewed it.
          </p>
          <p>
            What ties them together is the claim I made in{" "}
            <a href="https://github.com/thecuriousts/ensembly/issues/1">ensembly issue 1</a> (opened
            24 July 2026) and{" "}
            <a href="https://x.com/Peramanathan/status/2082782510078132545">
              stated publicly on 30 July 2026
            </a>
            : in any field and any workforce, the only loops that will last split the work in two.{" "}
            <strong>
              In one part, a person checks the state of things and approves only the steps that need
              them. In the other, agents do the rest on their own.
            </strong>{" "}
            I reached this independently, from reading, building, and watching how agents actually
            perform. That claim also shapes what I build in public:{" "}
            <strong>
              I choose the problems, tools and ideas that give a strong signal and are likely to
              last.
            </strong>{" "}
            ensembly puts both parts into code: a game-style view where a person checks chores and
            payments and approves the steps that need them (
            <a href="https://github.com/thecuriousts/ensembly/pull/10">PR 10</a>
            ), and a task graph ranked by urgency and importance, where PERT and Monte Carlo runs
            find the critical path for the agents (
            <a href="https://github.com/thecuriousts/ensembly/pull/2">PR 2</a>
            ). Frontier-lab research is working on the same handoff (
            <a href="https://www.anthropic.com/research/building-effective-agents">Anthropic</a>,{" "}
            <a href="https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/">
              METR
            </a>
            ). The product I see doing this best today is Grok Bot: agents plan, check and carry out
            the work in the background, and I step in only to approve the steps that need a person.
          </p>
          <ul>
            <li>
              <a href="https://github.com/p10ns11y/collab-finder">collab-finder</a> is a Tauri, Rust
              and React desktop app for job search. It finds roles that fit and builds an
              application pack for each, and a rejection changes its ranking only when it carries
              specific feedback. Submitting, CAPTCHA and BankID stay with the person, which is the
              same split as in ensembly issue 1.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/skills">skills</a> and{" "}
              <a href="https://github.com/p10ns11y/plugins">plugins</a> hold reusable agent
              playbooks, commands and hooks, and collab-finder loads the skills. Original plugins in
              that repository:
              <ul>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/eva-emptiness">
                    eva-emptiness
                  </a>{" "}
                  reasons when the map is missing: prior, probe, simulate, score, then act or ask.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/premflow">premflow</a>{" "}
                  keeps notes, wins, tasks, and coaching, driven through the premflow command-line
                  tool.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/arch-machine">
                    arch-machine
                  </a>{" "}
                  lets an agent check and set up an Arch Linux machine from a minimal base, and adds
                  larger pieces such as security modules only after explicit confirmation.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/mission-map">
                    mission-map
                  </a>{" "}
                  takes a checkable goal and a graph of stages, marks the critical path and the next
                  step, and does not say what will happen.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/uncertainty-laws">
                    uncertainty-laws
                  </a>{" "}
                  covers rough checks for uncertain decisions: expected value, base rates, ruin, and
                  Kelly.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/odysseus-navigator">
                    odysseus-navigator
                  </a>{" "}
                  gives a judgment: one bottleneck, one mistake, and one next step.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/pulse-memory">
                    pulse-memory
                  </a>{" "}
                  takes in short tagged memories instead of dumping everything, and resolves
                  contradictions.
                </li>
                <li>
                  <a href="https://github.com/p10ns11y/plugins/tree/main/layout-content-view">
                    layout-content-view
                  </a>{" "}
                  checks that web layout, content, and view stay stable, and was first tried on this
                  site.
                </li>
              </ul>
              <a href="https://github.com/p10ns11y/plugins/tree/main/pstack-map">pstack-map</a> is a
              playbook map from Cursor&apos;s pstack, by Lauren Tan under the MIT license, onto my
              own skills. It does not copy pstack.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/thepulimaangani">thepulimaangani</a> checks Tamil
              poetic metre in the browser, using a Rust parser compiled to WebAssembly with a React
              UI.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/elomaxz">elomaxz</a> is an MVU framework for C,
              and the <a href="https://github.com/p10ns11y/packedbox">packedbox</a> command-line
              tool uses it.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/adaptate">adaptate</a> keeps API types, runtime
              required-field checks and OpenAPI in one Zod schema.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/packedbox">packedbox</a>,{" "}
              <a href="https://github.com/p10ns11y/arch-machine">arch-machine</a> and{" "}
              <a href="https://github.com/p10ns11y/shellyxz.sh">shellyxz.sh</a> cover the bootstrap,
              the Arch profiles and the shell setup.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/devprofile">This site</a> holds the CV and the
              public pages, and its visitor routes are listed in a{" "}
              <a href="https://github.com/p10ns11y/devprofile/tree/main/.cursor/skills/verify-devprofile/features">
                verify map
              </a>{" "}
              that the checks run against.
            </li>
          </ul>
          <p>
            <a href="https://github.com/p10ns11y/skills/blob/master/LICENSE">skills</a>,{" "}
            <a href="https://github.com/p10ns11y/elomaxz/blob/master/LICENSE">elomaxz</a>,{" "}
            <a href="https://github.com/p10ns11y/adaptate/blob/main/LICENSE">adaptate</a>, and{" "}
            <a href="https://github.com/thecuriousts/ensembly/blob/master/LICENSE.md">ensembly</a>{" "}
            are MIT licensed, as are two plugin folders (
            <a href="https://github.com/p10ns11y/plugins/blob/main/layout-content-view/LICENSE">
              layout-content-view
            </a>{" "}
            and{" "}
            <a href="https://github.com/p10ns11y/plugins/blob/main/pstack-map/LICENSE">
              pstack-map
            </a>
            ).{" "}
            <a href="https://github.com/p10ns11y/arch-machine/blob/sentinel/LICENSE">
              arch-machine
            </a>{" "}
            is under the GNU General Public License, version 3. The other repositories are public
            but have no license.
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
