"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import cvdata from "@/data/cvdata.json";
import { fadeUp, motionTransition } from "@/lib/motion";
import { AISmartHighlight } from "./ai-smart-highlight";
import { SiteButton } from "./site/SiteButton";
import { SocialLinks } from "./social-links";

const gitrollProfileUrl = "https://gitroll.io/profile/uQUk8uoBUTNOWCHltHi810sXytq33";

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
          className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center min-w-0 w-full"
        >
          <div className="flex-1 min-w-0 text-center lg:text-left space-y-3 sm:space-y-3.5">
            <p className="hero-greeting">Hello, I&apos;m</p>

            <h1 className="hero-name">{cvdata.name}</h1>

            <p className="hero-role">{cvdata.latest_proffessional_role}</p>

            <p className="hero-lead max-w-2xl mx-auto lg:mx-0">
              <AISmartHighlight>{cvdata.one_liner}</AISmartHighlight>
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1">
              <SiteButton href="/#experience">View My Work</SiteButton>
              <SiteButton variant="secondary" href="/cv">
                View CV
              </SiteButton>
              <SiteButton href="/qa">Profile Q&amp;A</SiteButton>
              <SiteButton variant="secondary" href="/status/code/200">
                Live GitHub activity
              </SiteButton>
            </div>

            <div className="pt-2">
              <SocialLinks />
            </div>
          </div>

          <figure className="shrink-0 mx-auto lg:mx-0 max-w-full">
            <a
              href={gitrollProfileUrl}
              target="_blank"
              rel="nofollow noreferrer noopener"
              title="GitRoll CURISM for https://github.com/p10ns11y"
              className="block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <div className="hero-visual rounded-full overflow-hidden rad-shadow border-4 border-[var(--color-brand-subtle)] relative mx-auto">
                <Image
                  src="/images/curism.png"
                  alt="GitRoll CURISM contribution analytics for Peramanathan Sathyamoorthy"
                  fill
                  sizes="(max-width: 1023px) 176px, 280px"
                  loading="eager"
                  className="object-cover contrast-125"
                />
              </div>
            </a>
            <figcaption className="sr-only">
              GitRoll CURISM profile visualization for Peramanathan Sathyamoorthy
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </section>
  );
}
