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
    <section
      id="home"
      data-section="home"
      className="relative min-w-0 flex items-center justify-center overflow-x-clip bg-surface1 pt-[var(--header-offset)] pb-16 lg:min-h-screen"
    >
      <div className="container mx-auto min-w-0 max-w-7xl px-4 sm:px-6 z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={motionTransition(!!shouldReduceMotion, 0.8)}
          className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center min-w-0 min-h-[calc(80vh-var(--header-offset))] py-8 lg:py-12"
        >
          <div className="flex-1 min-w-0 text-center lg:text-left space-y-5">
            <p className="text-lg text-text2">Hello, I&apos;m</p>

            <h1
              className="font-[family-name:var(--font-display)] text-text1 leading-tight"
              style={{ fontSize: "clamp(2rem, 6vmin, 4rem)" }}
            >
              {cvdata.name}
            </h1>

            <p className="text-2xl md:text-3xl text-text2">{cvdata.latest_proffessional_role}</p>

            <p className="text-lg text-text1 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              <AISmartHighlight>{cvdata.one_liner}</AISmartHighlight>
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <SiteButton size="lg" href="/#experience">
                View My Work
              </SiteButton>
              <SiteButton size="lg" variant="secondary" href="/cv">
                View CV
              </SiteButton>
              <SiteButton size="lg" href="/qa">
                Profile Q&amp;A
              </SiteButton>
            </div>

            <div className="w-full sm:max-w-md lg:max-w-none mx-auto lg:mx-0 pt-1">
              <SiteButton size="lg" variant="secondary" href="/status/code/200" fullWidth>
                Live GitHub activity
              </SiteButton>
            </div>

            <div className="pt-4">
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
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 xl:w-[30rem] xl:h-[30rem] rounded-full overflow-hidden rad-shadow border-4 border-brand/10 relative mx-auto">
                <Image
                  src="/images/curism.png"
                  alt="GitRoll CURISM contribution analytics for Peramanathan Sathyamoorthy"
                  fill
                  sizes="(max-width: 639px) 256px, (max-width: 767px) 320px, (max-width: 1279px) 384px, 480px"
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
