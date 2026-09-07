import cvdata from "@/data/cvdata.json";
import { landingInvite } from "@/data/landing-invite";
import { SiteButton } from "./site/SiteButton";
import { SocialLinks } from "./social-links";
import { VoiceTalkLink } from "./voice-talk-link";

export function Hero() {
  return (
    <section id="home" data-section="home" className="hero-section relative min-w-0 bg-surface1">
      <div className="site-container z-10 flex min-h-0 min-w-0 flex-col justify-center">
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="hero-stack">
              <h1 className="hero-name">{cvdata.name}</h1>
              <p className="hero-role">{landingInvite.role}</p>
              <p className="hero-place">
                {landingInvite.place}. {landingInvite.location}. {landingInvite.seat}
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
              <VoiceTalkLink className="hero-cta inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-text1 transition-colors hover:border-link hover:text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)" />
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
