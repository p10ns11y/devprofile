"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import cvdata from "@/data/cvdata.json";
import { landingInvite } from "@/data/landing-invite";
import { fadeUp, motionTransition } from "@/lib/motion";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SiteButton } from "./site/SiteButton";
import { SocialLinks } from "./social-links";

const gitrollProfileUrl = "https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33";

const heroActions = [
  { href: "/#experience", label: "View experience", variant: "primary" },
  { href: "/?cv=view", label: "View CV", variant: "secondary" },
  { href: "/qa", label: "Profile Q&A", variant: "secondary" },
  { href: "/status/code/200", label: "Live GitHub activity", variant: "secondary" },
] as const;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="home" data-section="home" className="hero-section relative min-w-0 bg-surface1">
      <div className="site-container z-10 flex flex-1 min-h-0 min-w-0 flex-col justify-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={motionTransition(!!shouldReduceMotion, 0.8)}
          className="hero-layout"
        >
          <div className="hero-copy">
            <div className="hero-stack">
              <h1 className="hero-name">{cvdata.name}</h1>
              <p className="hero-role">{landingInvite.role}</p>
              <p className="hero-place">
                {landingInvite.place}. {landingInvite.seat}
              </p>
            </div>

            <p className="hero-track">
              <AISmartHighlight>{landingInvite.track}</AISmartHighlight>
            </p>
            <p className="hero-lead">{landingInvite.thesis}</p>

            <nav className="hero-actions" aria-label="Profile actions">
              {heroActions.map((action) => (
                <SiteButton
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                  size={action.variant === "primary" ? "lg" : "default"}
                  className={action.variant === "primary" ? "hero-cta" : "hero-more-cta"}
                >
                  {action.label}
                </SiteButton>
              ))}
            </nav>

            <div className="hero-trail">
              <div className="hero-profiles">
                <SocialLinks size="compact" className="justify-center" />
              </div>
            </div>
          </div>

          <aside className="hero-aside" aria-label="GitRoll contribution profile" data-visual-live>
            <a
              href={gitrollProfileUrl}
              target="_blank"
              rel="nofollow noreferrer noopener"
              className="hero-gitroll"
              title="Open GitRoll CURISM profile for Peramanathan Sathyamoorthy"
            >
              <span className="hero-gitroll__halo" aria-hidden="true" />
              <span className="hero-gitroll__plate">
                <Image
                  src="/images/curism.png"
                  alt="GitRoll CURISM radar chart — contribution analytics across engineering dimensions"
                  fill
                  sizes="(max-width: 1023px) 220px, 360px"
                  loading="eager"
                  className="object-contain"
                  priority
                />
              </span>
              <span className="hero-gitroll__meta">
                <span className="hero-gitroll__eyebrow">GitRoll · CURISM</span>
                <span className="hero-gitroll__cta">View contribution profile</span>
              </span>
            </a>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}
