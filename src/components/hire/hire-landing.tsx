import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HireColorfiguresFigure } from "@/components/hire/hire-colorfigures-figure";
import { HireContact } from "@/components/hire/hire-contact";
import { HireEvidenceSection } from "@/components/hire/hire-evidence-section";
import { HireSystemsGraph } from "@/components/hire/hire-systems-graph";
import { SiteButton } from "@/components/site/SiteButton";
import { SocialLinks } from "@/components/social-links";
import type { HireContent } from "@/lib/hire-content";
import { deriveHireLayoutClasses } from "@/lib/hire-layout-derived";
import { lcvMustShow } from "@/lib/hire-lcv";
import type { HireVisualLanguage } from "@/lib/hire-visual-language";
import { TARGET_RANGE_HREF, TARGET_RANGE_LABEL } from "@/lib/pay-report-bands";

export function HireProfileSummary() {
  return (
    <section
      id="profile-summary"
      data-section="profile-summary"
      className="hire-phi__section"
      aria-labelledby="profile-summary-title"
    >
      <div className="phi-route-band hire-phi__cluster">
        <header className="hire-phi__section-header">
          <h2 id="profile-summary-title" className="hire-phi__section-title">
            Profile summary
          </h2>
        </header>
        <div className="hire-phi__summary">
          <p>
            I am Peramanathan Sathyamoorthy, a Senior Fullstack Engineer and Product Engineer in
            Stockholm. I have over nine years of work on web products, public APIs, integrations and
            developer tooling, mostly in TypeScript, React, Next.js and Node.js, with Python and
            Rust in production and open-source work.
          </p>
          <p>
            At Oneflow, a contract management platform, I worked from 2017 to 2024. I built the
            Integration Team, ran the public API and the CRM integrations with HubSpot, SuperOffice,
            Salesforce and Microsoft Dynamics, led the engineering team, set up Playwright
            end-to-end testing and led a TypeScript migration that kept each file&apos;s history.
          </p>
          <p>
            Since December 2024 my role has been Independent AI/SI product and systems engineering
            (agentic workflows). In that time I have shipped:
          </p>
          <ul>
            <li>
              <a href="https://github.com/p10ns11y/adaptate">adaptate</a>, a TypeScript library on
              npm that turns one Zod or OpenAPI schema into per-screen views and validates streaming
              LLM tool-call JSON while it arrives. Version 2.4.2 is published with SLSA provenance.
            </li>
            <li>
              <a href="https://kanithanj-ai.vercel.app">kanithanj.ai</a>, a product that helps
              people find roles they can grow into, with a Tauri, Rust and React desktop app and a
              SQLite ledger.
            </li>
            <li>
              <a href="https://github.com/thecuriousts/ensembly">Ensembly</a>, a Rust kernel that
              gives several agent harnesses one ledger, one memory sync and one approval flow.
            </li>
            <li>
              <a href="https://github.com/p10ns11y/plugins">Agent plugins</a> and{" "}
              <a href="https://github.com/p10ns11y/skills">skills</a> that load into Grok Build,
              Cursor and Claude Code.
            </li>
          </ul>
          <p>
            Much of my deep-learning and systems work is private and not public. The public
            repositories are a record that grew slowly as I learned and crafted over time, not the
            full depth of that work.
          </p>
          <p>
            My MSc research at Uppsala University, published at IEEE CloudCom 2015 and in a 2017
            journal paper, argued that a system stays viable only when the cost of the next useful
            observation falls while the quality of decisions rises. I apply that rule to agents
            today: context and memory are costs, so an agent should load only what can change its
            next decision.
          </p>
          <p>
            How I work: I build tools that save the team time, enforce rules with tooling instead of
            memory, verify before anything irreversible, review by area and risk, keep docs short
            and visual, and credit the work I build on.
          </p>
          <p>
            I am authorised to work in the EU with no sponsorship needed, and I can start within two
            weeks of an offer. The full profile for search engines and agents is at{" "}
            <a href="/llms.txt">/llms.txt</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

type HireLandingProps = {
  content: HireContent;
  visualLanguage?: HireVisualLanguage | null;
};

export function HireLanding({ content, visualLanguage = null }: HireLandingProps) {
  const layout = deriveHireLayoutClasses(content);
  const proofStyle = { "--hire-proof-min": layout.proofMinCell } as CSSProperties;
  const colorfigures = visualLanguage === "colorfigures";
  const rootClass = [
    "hire-phi",
    "min-h-screen",
    "min-w-0",
    "bg-surface1",
    "text-text1",
    "overflow-x-clip",
    colorfigures ? "hire-phi--colorfigures" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <Header />

      <section id="home" data-section="home" className={`hire-phi__hero ${layout.heroPeek}`}>
        <div className="phi-route-band hire-phi__cluster">
          <div className={`phi-split hire-phi__split ${layout.hero}`}>
            <div>
              <p className="hire-phi__eyebrow">
                {content.place} · {content.location}
              </p>
              <h1 className="hire-phi__name" {...lcvMustShow}>
                {content.name}
              </h1>
              <p className="hire-phi__role">{content.role}</p>
            </div>
            <div>
              {content.seat ? <p className="hire-phi__seat">{content.seat}</p> : null}
              <blockquote className="hire-phi__thesis" {...lcvMustShow}>
                {content.thesis}
              </blockquote>
              <p className="hire-phi__target">
                <Link href={TARGET_RANGE_HREF}>{TARGET_RANGE_LABEL}</Link>
              </p>
            </div>
          </div>
          <div className={layout.heroReach}>
            <nav className="hire-phi__actions" aria-label="Profile actions">
              {content.heroLinks.length > 0 ? (
                <span className={layout.textLinks}>
                  {content.heroLinks.map((link, index) => (
                    <span key={link.href} className="hire-phi__text-links__item">
                      {index > 0 ? (
                        <span className="hire-phi__text-links__sep" aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      <Link href={link.href} className="hire-phi__text-link">
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </span>
              ) : null}
              {content.heroActions.map((action) => (
                <SiteButton key={action.href} href={action.href} variant={action.variant}>
                  {action.label}
                </SiteButton>
              ))}
            </nav>
            <div className="hire-phi__hero-social-wrap">
              <SocialLinks size="compact" align="center" className="hire-phi__hero-social" />
            </div>
          </div>
        </div>
      </section>

      {colorfigures ? <HireColorfiguresFigure /> : null}

      <section
        id="about"
        data-section="about"
        className="hire-phi__section"
        aria-labelledby="hire-about-heading"
      >
        <div className="phi-route-band hire-phi__cluster">
          <header className="hire-phi__section-header">
            <h2 id="hire-about-heading" className="hire-phi__section-title">
              What you are hiring
            </h2>
            {content.summary ? <p className="hire-phi__section-lead">{content.summary}</p> : null}
          </header>

          <div className={layout.proofs} style={proofStyle}>
            {content.proofs.map((proof) => (
              <article key={proof.n} className="hire-phi__proof-card">
                <h3 className="hire-phi__proof-title">{proof.title}</h3>
                <p className="hire-phi__proof-line">{proof.line}</p>
                {proof.href ? (
                  <a href={proof.href.url} className="hire-phi__proof-link">
                    {proof.href.label} →
                  </a>
                ) : null}
              </article>
            ))}
          </div>

          <p className="hire-phi__arc-note">
            The long arc from 2015 orchestration to 2026 local agent work lives in{" "}
            <a href={content.arcHref.url}>{content.arcHref.label}</a>. Architecture walkthroughs on{" "}
            <a href="/shipped">Shipped</a>.
          </p>
        </div>
      </section>

      <section
        id="systems"
        data-section="systems"
        className="hire-phi__section"
        aria-labelledby="hire-systems-heading"
      >
        <div className="phi-route-band hire-phi__cluster">
          <header className="hire-phi__section-header">
            <h2 id="hire-systems-heading" className="hire-phi__section-title">
              How the pieces connect
            </h2>
            <p className="hire-phi__section-lead">
              Five cluster bands feed four area docks; their todos pour into one priority funnel
              that feeds one portal. What it releases feeds back. Not separate demos with copied
              prompts.
            </p>
          </header>
          <div className={layout.systems}>
            <HireSystemsGraph systems={content.systems} />
            {content.nowDisclaimer ? (
              <p className="hire-phi__section-lead">{content.nowDisclaimer}</p>
            ) : null}
          </div>
        </div>
      </section>

      <HireEvidenceSection content={content} layout={layout} />
      <HireContact content={content} layoutClass={layout.contact} />
      <HireProfileSummary />
      <Footer />
    </div>
  );
}
