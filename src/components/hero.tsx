import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { landingInvite } from "@/data/landing-invite";
import { SiteButton } from "./site/SiteButton";
import { SocialLinks } from "./social-links";

export function Hero() {
  return (
    <section id="home" data-section="home" className="hero-section relative min-w-0 bg-surface1">
      <div className="site-container z-10 flex min-h-0 min-w-0 flex-col justify-center">
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="hero-stack">
              <h1 className="hero-name">{cvdata.name}</h1>
              <p className="hero-role">{landingInvite.role}</p>
              <p className="hero-meta">
                {landingInvite.place} · {landingInvite.location}
              </p>
            </div>

            <p className="hero-lead">{landingInvite.thesis}</p>

            <nav className="hero-actions" aria-label="Profile actions">
              {landingInvite.heroActions.map((action) => (
                <SiteButton
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                  className="hero-cta"
                >
                  {action.label}
                </SiteButton>
              ))}
              {landingInvite.heroLinks.length > 0 ? (
                <p className="hero-text-links">
                  {landingInvite.heroLinks.map((link, index) => (
                    <span key={link.href} className="hero-text-links__item">
                      {index > 0 ? (
                        <span className="hero-text-links__sep" aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      <Link href={link.href} className="hero-text-link">
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </nav>

            <div className="hero-trail">
              <div className="hero-profiles">
                <SocialLinks size="compact" className="justify-start" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
