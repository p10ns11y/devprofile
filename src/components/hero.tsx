"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import cvdata from "@/data/cvdata.json";
import { fadeUp, motionTransition } from "@/lib/motion";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SiteButton } from "./site/SiteButton";
import { SocialLinks } from "./social-links";

const gitrollProfileUrl = "https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33";

const heroMoreLinks = [
  { href: "/qa", label: "Profile Q&A" },
  { href: "/status/code/200", label: "Live GitHub activity" },
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
              <p className="hero-greeting">Hello, I&apos;m</p>
              <h1 className="hero-name">{cvdata.name}</h1>
              <p className="hero-role">{cvdata.latest_proffessional_role}</p>
              <p className="hero-lead">
                <AISmartHighlight>{cvdata.one_liner}</AISmartHighlight>
              </p>
            </div>

            <div className="hero-engage">
              <div className="hero-cta-row">
                <SiteButton size="lg" href="/#experience" className="hero-cta">
                  View My Work
                </SiteButton>
                <SiteButton size="lg" variant="secondary" href="/cv" className="hero-cta">
                  View CV
                </SiteButton>
              </div>

              <nav className="hero-links" aria-label="More profile links">
                {heroMoreLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hero-link">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="hero-profiles">
                <SocialLinks size="compact" className="justify-center" />
              </div>
            </div>
          </div>

          <aside className="hero-aside" aria-label="GitRoll contribution profile">
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
