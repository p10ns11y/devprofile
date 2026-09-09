import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HireContact } from "@/components/hire/hire-contact";
import { HireEvidenceSection } from "@/components/hire/hire-evidence-section";
import { HireSystemsGraph } from "@/components/hire/hire-systems-graph";
import { SiteButton } from "@/components/site/SiteButton";
import { SocialLinks } from "@/components/social-links";
import type { HireContent } from "@/lib/hire-content";
import { deriveHireLayoutClasses } from "@/lib/hire-layout-derived";
import { lcvMustShow } from "@/lib/hire-lcv";

type HireLandingProps = {
  content: HireContent;
};

export function HireLanding({ content }: HireLandingProps) {
  const layout = deriveHireLayoutClasses(content);
  const proofStyle = { "--hire-proof-min": layout.proofMinCell } as CSSProperties;

  return (
    <div className="hire-phi min-h-screen min-w-0 bg-surface1 text-text1 overflow-x-clip">
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
              <div className={layout.heroReach}>
                <nav className="hire-phi__actions" aria-label="Profile actions">
                  {content.heroActions.map((action) => (
                    <SiteButton key={action.href} href={action.href} variant={action.variant}>
                      {action.label}
                    </SiteButton>
                  ))}
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
                </nav>
                <div className="hire-phi__hero-social-wrap">
                  <SocialLinks size="compact" align="center" className="hire-phi__hero-social" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              Five cluster bands on the left. Work falls through four area docks into one operator
              loop. Not separate demos with copied prompts.
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
      <Footer />
    </div>
  );
}
